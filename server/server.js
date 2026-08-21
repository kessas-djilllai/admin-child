require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const db = require('./database');
const { initFirebase, sendFCMNotification, sendFCMDataOnly } = require('./firebase');
const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==================== REST API ====================
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'Parental Control Server',
    version: '1.0.0',
    status: 'running',
    onlineDevices: Object.keys(connectedDevices).length
  });
});

// ==================== SOCKET.IO ====================

const connectedDevices = {};
const connectedAdmins = {};
app.set('connectedDevices', connectedDevices);
app.set('io', io);

function getOnlineDeviceTokens() {
  return Object.keys(connectedDevices);
}

io.on('connection', (socket) => {
  console.log(`[Socket] New connection: ${socket.id}`);

  // ==================== DEVICE (CHILD) EVENTS ====================

  socket.on('device:register', (data) => {
    const { token, fcm_token, device_name, battery, status, storage_used, storage_total, net_type, net_name, android_version } = data;

    if (!token) return;

    connectedDevices[token] = {
      socketId: socket.id,
      lastSeen: Date.now()
    };

    socket.deviceToken = token;
    socket.deviceRole = 'child';

    db.prepare(`
      INSERT INTO devices (token, device_name, battery, status, storage_used, storage_total, net_type, net_name, android_version, fcm_token, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(token) DO UPDATE SET
        device_name = COALESCE(excluded.device_name, devices.device_name),
        battery = COALESCE(excluded.battery, devices.battery),
        status = COALESCE(excluded.status, devices.status),
        storage_used = COALESCE(excluded.storage_used, devices.storage_used),
        storage_total = COALESCE(excluded.storage_total, devices.storage_total),
        net_type = COALESCE(excluded.net_type, devices.net_type),
        net_name = COALESCE(excluded.net_name, devices.net_name),
        android_version = COALESCE(excluded.android_version, devices.android_version),
        fcm_token = COALESCE(excluded.fcm_token, devices.fcm_token),
        last_updated = datetime('now')
    `).run(token, device_name, battery || 0, status || 'connected', storage_used || 0, storage_total || 0, net_type, net_name, android_version, fcm_token);

    console.log(`[Socket] Device registered: ${token}`);

    io.to('admin-room').emit('device:online', { token, timestamp: Date.now() });

    socket.join(`device:${token}`);
  });

  socket.on('device:update_state', (data) => {
    const { token, battery, status, storage_used, storage_total, net_type, net_name } = data;
    const deviceToken = token || socket.deviceToken;
    if (!deviceToken) return;

    connectedDevices[deviceToken] = {
      socketId: socket.id,
      lastSeen: Date.now()
    };

    db.prepare(`
      UPDATE devices SET
        battery = COALESCE(?, battery),
        status = COALESCE(?, status),
        storage_used = COALESCE(?, storage_used),
        storage_total = COALESCE(?, storage_total),
        net_type = COALESCE(?, net_type),
        net_name = COALESCE(?, net_name),
        last_updated = datetime('now')
      WHERE token = ?
    `).run(battery, status, storage_used, storage_total, net_type, net_name, deviceToken);

    io.to('admin-room').emit('device:update', {
      token: deviceToken,
      battery, status, storage_used, storage_total, net_type, net_name,
      last_updated: new Date().toISOString()
    });
  });

  socket.on('device:heartbeat', (data) => {
    const deviceToken = data?.token || socket.deviceToken;
    if (!deviceToken) return;

    if (connectedDevices[deviceToken]) {
      connectedDevices[deviceToken].lastSeen = Date.now();
    }

    db.prepare("UPDATE devices SET last_updated = datetime('now') WHERE token = ?").run(deviceToken);

    io.to('admin-room').emit('device:heartbeat', { token: deviceToken, timestamp: Date.now() });
  });

  socket.on('command:execute', (data) => {
    const { command_id } = data;
    const deviceToken = socket.deviceToken;
    if (!deviceToken || !command_id) return;

    db.prepare("UPDATE commands SET status = 'executing' WHERE id = ?").run(command_id);

    io.to('admin-room').emit('command:executing', { device_token: deviceToken, command_id });
  });

  socket.on('command:status', (data) => {
    const { command_id, status, message } = data;
    const deviceToken = socket.deviceToken;
    if (!deviceToken) return;

    io.to('admin-room').emit('command:status', { device_token: deviceToken, command_id, status, message });
    console.log(`[Socket] Command status from ${deviceToken}: ${status}`);
  });

  socket.on('command:reply', (data) => {
    const { command_id, command_type, status, message, response_data, command_timestamp, file_url, file_type } = data;
    const deviceToken = socket.deviceToken;
    if (!deviceToken) return;

    db.prepare(`
      INSERT INTO command_responses (device_token, command_id, command_type, status, response_data, message, command_timestamp, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(deviceToken, command_id || null, command_type || null, status || 'success', response_data || message || null, message || null, command_timestamp || 0, Date.now());

    if (command_id) {
      db.prepare("UPDATE commands SET status = ? WHERE id = ?")
        .run(status === 'error' ? 'failed' : 'completed', command_id);
    }

    if (file_url) {
      try {
        db.prepare(`
          INSERT INTO media_files (token, file_url, file_type, command_source)
          VALUES (?, ?, ?, ?)
        `).run(deviceToken, file_url, file_type || 'other', command_type || null);
        console.log(`[Socket] Media saved for ${deviceToken}: ${file_url}`);
      } catch (e) {
        console.error(`[Socket] Error saving media: ${e.message}`);
      }
    }

    io.to('admin-room').emit('command:reply', {
      device_token: deviceToken,
      command_id,
      command_type,
      status,
      message,
      response_data,
      file_url,
      file_type,
      timestamp: Date.now()
    });

    console.log(`[Socket] Command reply from ${deviceToken}: ${status}`);
  });

  // ==================== ADMIN EVENTS ====================

  socket.on('admin:join', () => {
    socket.join('admin-room');
    socket.deviceRole = 'admin';

    const onlineTokens = getOnlineDeviceTokens();
    socket.emit('admin:online_devices', { devices: onlineTokens });

    console.log(`[Socket] Admin joined. Online devices: ${onlineTokens.length}`);
  });

  socket.on('command:send', (data) => {
    const { device_token, command, params, command_id } = data;
    if (!device_token || !command) return;

    const id = command_id || require('uuid').v4();
    const timestamp = Date.now();

    const deviceEntry = connectedDevices[device_token];

    const isSocketAlive = deviceEntry && io.sockets.sockets.has(deviceEntry.socketId);

    if (!isSocketAlive) {
      if (deviceEntry) {
        delete connectedDevices[device_token];
      }
      db.prepare(`
        INSERT INTO commands (id, device_token, command, params, status, timestamp)
        VALUES (?, ?, ?, ?, 'failed', ?)
      `).run(id, device_token, command, params ? JSON.stringify(params) : null, timestamp);

      socket.emit('command:sent', { id, success: false, error: 'device_offline' });
      console.log(`[Socket] Device ${device_token} is offline. Command rejected: ${command}`);
      return;
    }

    db.prepare(`
      INSERT INTO commands (id, device_token, command, params, status, timestamp)
      VALUES (?, ?, ?, ?, 'pending', ?)
    `).run(id, device_token, command, params ? JSON.stringify(params) : null, timestamp);

    io.to(deviceEntry.socketId).emit('command:incoming', {
      id,
      device_token,
      command,
      params: params ? JSON.stringify(params) : null,
      timestamp
    });

    socket.emit('command:sent', { id, success: true });
    console.log(`[Socket] Command sent to device ${device_token}: ${command}`);
  });

  socket.on('command:check_status', (data) => {
    const { device_token } = data;
    if (!device_token) return;

    const deviceEntry = connectedDevices[device_token];
    if (deviceEntry) {
      io.to(deviceEntry.socketId).emit('command:ping', { type: 'check_status' });
      io.to(deviceEntry.socketId).emit('check_status');
    }
  });

  socket.on('command:status_reply', (data) => {
    const deviceToken = socket.deviceToken;
    if (!deviceToken) return;

    io.to('admin-room').emit('device:status_reply', { token: deviceToken, timestamp: Date.now() });
  });

  // ==================== STREAMING RELAY ====================

  socket.on('stream:signal', (data) => {
    const deviceToken = socket.deviceToken;
    if (socket.deviceRole === 'child') {
      io.to('admin-room').emit('stream:signal', { device_token: deviceToken, ...data });
    } else if (socket.deviceRole === 'admin') {
      const target = data.device_token;
      if (target) {
        const entry = connectedDevices[target];
        if (entry) io.to(entry.socketId).emit('stream:signal', data);
      }
    }
  });

  socket.on('stream:data', (data) => {
    const deviceToken = socket.deviceToken;
    if (socket.deviceRole === 'child') {
      io.to('admin-room').emit('stream:data', { device_token: deviceToken, ...data });
    } else if (socket.deviceRole === 'admin') {
      const target = data.device_token;
      if (target) {
        const entry = connectedDevices[target];
        if (entry) io.to(entry.socketId).emit('stream:data', data);
      }
    }
  });

  socket.on('stream:binary', (data) => {
    const deviceToken = socket.deviceToken;
    if (socket.deviceRole === 'child') {
      io.to('admin-room').emit('stream:binary', { device_token: deviceToken, ...data });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);

    if (socket.deviceRole === 'child' && socket.deviceToken) {
      delete connectedDevices[socket.deviceToken];

      db.prepare("UPDATE devices SET status = 'disconnected', last_updated = datetime('now') WHERE token = ?")
        .run(socket.deviceToken);

      io.to('admin-room').emit('device:offline', {
        token: socket.deviceToken,
        timestamp: Date.now()
      });

      console.log(`[Socket] Device went offline: ${socket.deviceToken}`);
    }
  });
});

// ==================== CLEANUP STALE CONNECTIONS ====================

setInterval(() => {
  const now = Date.now();
  const staleThreshold = 40000;

  for (const [token, info] of Object.entries(connectedDevices)) {
    if (now - info.lastSeen > staleThreshold) {
      console.log(`[Cleanup] Stale device removed: ${token}`);
      delete connectedDevices[token];

      db.prepare("UPDATE devices SET status = 'disconnected', last_updated = datetime('now') WHERE token = ?")
        .run(token);

      io.to('admin-room').emit('device:offline', { token, timestamp: now });
    }
  }
}, 10000);

// ==================== START SERVER ====================

const PORT = process.env.PORT || 3000;

initFirebase();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`  Parental Control Server`);
  console.log(`  Running on port ${PORT}`);
  console.log(`  REST API: http://localhost:${PORT}/api`);
  console.log(`  Socket.IO: http://localhost:${PORT}`);
  console.log(`========================================\n`);
});
