import { useEffect } from 'react';
import { connectSocket, disconnectSocket, onSocketEvent } from '../services/socket';
import { useAppStore } from '../stores/useAppStore';
import { configureApi, fetchKeysFromVercel, fetchServerUrlFromDb } from '../services/api';

export function useConnection() {
  const { settings, setConnected, updateSettings } = useAppStore();

  useEffect(() => {
    if (!settings.serverUrl) return;

    configureApi(settings.serverUrl, settings.supabaseKey);
    connectSocket(settings.serverUrl);

    const unsubs = [
      onSocketEvent('connection_change', (v) => {
        const connected = v as boolean;
        setConnected(connected);
      }),
    ];

    return () => {
      unsubs.forEach((u) => u());
      disconnectSocket();
    };
  }, [settings.serverUrl, settings.supabaseKey]);
}
