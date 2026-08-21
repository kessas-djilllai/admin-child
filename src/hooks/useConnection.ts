import { useEffect } from 'react';
import { connectSocket, disconnectSocket, onSocketEvent } from '../services/socket';
import { useAppStore } from '../stores/useAppStore';
import { configureApi } from '../services/api';

export function useConnection() {
  const { settings, setConnected, setReconnecting, setReconnectAttempt } = useAppStore();

  useEffect(() => {
    if (!settings.serverUrl) return;

    configureApi(settings.serverUrl, settings.supabaseKey);
    connectSocket(settings.serverUrl);

    const unsubs = [
      onSocketEvent('connection_change', (v) => {
        const connected = v as boolean;
        setConnected(connected);
        if (connected) {
          setReconnecting(false);
          setReconnectAttempt(0);
        } else {
          setReconnecting(true);
          setReconnectAttempt(1);
        }
      }),
      onSocketEvent('reconnect_attempt', (attempt) => {
        setReconnecting(true);
        setReconnectAttempt(attempt as number);
      }),
      onSocketEvent('reconnect_failed', () => {
        setReconnecting(true);
        setReconnectAttempt(-1);
      }),
    ];

    return () => {
      unsubs.forEach((u) => u());
      disconnectSocket();
    };
  }, [settings.serverUrl, settings.supabaseKey]);
}
