import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket, onSocketEvent } from '../services/socket';
import { useAppStore } from '../stores/useAppStore';
import { configureApi, fetchKeysFromVercel, fetchServerUrlFromDb } from '../services/api';

export function useConnection() {
  const { settings, setConnected, setReconnecting, setReconnectAttempt, updateSettings } = useAppStore();
  const failCount = useRef(0);

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
          failCount.current = 0;
        }
      }),
      onSocketEvent('reconnect_attempt', (attempt) => {
        setReconnecting(true);
        setReconnectAttempt(attempt as number);
      }),
      onSocketEvent('reconnect_failed', async () => {
        failCount.current += 1;
        setReconnectAttempt(-1);

        if (failCount.current >= 3) {
          failCount.current = 0;
          try {
            const keys = await fetchKeysFromVercel();
            if (keys?.supabase_url && keys?.supabase_key) {
              const newUrl = await fetchServerUrlFromDb(keys.supabase_url, keys.supabase_key);
              if (newUrl && newUrl !== settings.serverUrl) {
                updateSettings({ serverUrl: newUrl, supabaseKey: keys.supabase_key });
                configureApi(newUrl, keys.supabase_key);
                disconnectSocket();
                connectSocket(newUrl);
                return;
              }
            }
          } catch {
            // ignore
          }
          // If no new URL found, retry current
          setTimeout(() => {
            disconnectSocket();
            connectSocket(settings.serverUrl);
          }, 3000);
        } else {
          setTimeout(() => {
            disconnectSocket();
            connectSocket(settings.serverUrl);
          }, 3000);
        }
      }),
    ];

    return () => {
      unsubs.forEach((u) => u());
      disconnectSocket();
    };
  }, [settings.serverUrl, settings.supabaseKey]);
}
