import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
const listeners = new Map<string, Set<(data: unknown) => void>>();
let serverUrl = '';

export function connectSocket(url: string): Socket {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  serverUrl = url;

  socket = io(url, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    reconnectionAttempts: Infinity,
    forceNew: true,
  });

  socket.on('connect', () => {
    socket?.emit('admin:join');
    emit('connection_change', true);
    emit('reconnect_attempt', 0);
  });

  socket.on('disconnect', () => {
    emit('connection_change', false);
  });

  socket.io.on('reconnect_attempt', (attempt) => {
    emit('reconnect_attempt', attempt);
  });

  socket.io.on('reconnect_failed', () => {
    emit('reconnect_failed', true);
    setTimeout(() => {
      if (socket && !socket.connected) {
        socket.connect();
      }
    }, 3000);
  });

  const events = [
    'admin:online_devices',
    'device:online',
    'device:offline',
    'device:update',
    'device:update_state',
    'device:heartbeat',
    'device:status_reply',
    'command:reply',
    'command:status',
    'command:status_reply',
    'stream:signal',
    'stream:data',
    'stream:binary',
  ];

  for (const event of events) {
    socket.on(event, (data: unknown) => emit(event, data));
  }

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function forceReconnect() {
  if (socket && serverUrl) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    connectSocket(serverUrl);
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export function onSocketEvent(event: string, callback: (data: unknown) => void): () => void {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event)!.add(callback);
  return () => listeners.get(event)?.delete(callback);
}

function emit(event: string, data: unknown) {
  listeners.get(event)?.forEach((cb) => cb(data));
}

export function sendCommandViaSocket(command: string, payload: Record<string, unknown>) {
  socket?.emit(command, payload);
}
