import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
const listeners = new Map<string, Set<(data: unknown) => void>>();

export function connectSocket(serverUrl: string): Socket {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  socket = io(serverUrl, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionAttempts: 10,
    forceNew: true,
  });

  socket.on('connect', () => {
    socket?.emit('admin:join');
    emit('connection_change', true);
  });

  socket.on('disconnect', () => {
    emit('connection_change', false);
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
