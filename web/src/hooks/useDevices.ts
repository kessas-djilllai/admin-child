import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDevices } from '../services/api';
import { useAppStore } from '../stores/useAppStore';
import { onSocketEvent } from '../services/socket';
import type { Device } from '../types';

export function useDevices() {
  const { settings, favorites, archivedDevices, filter, searchQuery } = useAppStore();

  const query = useQuery({
    queryKey: ['devices', settings.serverUrl],
    queryFn: fetchDevices,
    enabled: !!settings.serverUrl,
    refetchInterval: 10000,
    staleTime: 5000,
  });

  const [localDevices, setLocalDevices] = useState<Device[]>([]);

  useEffect(() => {
    if (query.data) setLocalDevices(query.data);
  }, [query.data]);

  useEffect(() => {
    const unsub1 = onSocketEvent('device:online', (data: unknown) => {
      const { token } = data as { token: string };
      setLocalDevices((prev) =>
        prev.map((d) => (d.token === token ? { ...d, isOnline: true } : d))
      );
    });
    const unsub2 = onSocketEvent('device:offline', (data: unknown) => {
      const { token } = data as { token: string };
      setLocalDevices((prev) =>
        prev.map((d) => (d.token === token ? { ...d, isOnline: false } : d))
      );
    });
    const unsub3 = onSocketEvent('device:update', (data: unknown) => {
      const update = data as Partial<Device> & { token: string };
      setLocalDevices((prev) =>
        prev.map((d) => (d.token === update.token ? { ...d, ...update } : d))
      );
    });

    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  const filtered = localDevices.filter((d) => {
    if (filter === 'active') return d.isOnline;
    if (filter === 'inactive') return !d.isOnline;
    if (filter === 'favorites') return favorites.includes(d.token);
    if (filter === 'archived') return archivedDevices.includes(d.token);
    if (!archivedDevices.includes(d.token)) return true;
    return false;
  }).filter((d) => {
    if (!searchQuery) return true;
    return d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           d.token.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return {
    devices: filtered,
    allDevices: localDevices,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
