import { useEffect } from 'react';
import { connectSocket, disconnectSocket } from '../services/socket';
import { useAppStore } from '../stores/useAppStore';
import { onSocketEvent } from '../services/socket';
import { configureApi } from '../services/api';

export function useConnection() {
  const { settings, setConnected } = useAppStore();

  useEffect(() => {
    if (!settings.serverUrl) return;

    configureApi(settings.serverUrl, settings.supabaseKey);
    const socket = connectSocket(settings.serverUrl);

    const unsub = onSocketEvent('connection_change', (v) => {
      setConnected(v as boolean);
    });

    return () => {
      unsub();
      disconnectSocket();
    };
  }, [settings.serverUrl, settings.supabaseKey]);
}
