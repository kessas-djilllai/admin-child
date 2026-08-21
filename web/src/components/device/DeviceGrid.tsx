import { useAppStore } from '../../stores/useAppStore';
import type { Device } from '../../types';
import { DeviceCard } from './DeviceCard';
import { Skeleton } from '../ui/Skeleton';

interface DeviceGridProps {
  devices: Device[];
  isLoading: boolean;
  onSelectDevice: (device: Device) => void;
}

export function DeviceGrid({ devices, isLoading, onSelectDevice }: DeviceGridProps) {
  const { filter, setFilter } = useAppStore();
  const { favorites, archivedDevices } = useAppStore();

  const filters = [
    { key: 'all' as const, label: 'الكل' },
    { key: 'active' as const, label: 'نشط' },
    { key: 'inactive' as const, label: 'غير نشط' },
    { key: 'favorites' as const, label: 'المفضلة' },
    { key: 'archived' as const, label: 'المحفوظة' },
  ];

  if (isLoading) {
    return (
      <div>
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.key
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                : 'bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-400 border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700'
            }`}
          >
            {f.label}
            {f.key === 'favorites' && favorites.length > 0 && (
              <span className="mr-1 text-xs opacity-70">({favorites.length})</span>
            )}
            {f.key === 'archived' && archivedDevices.length > 0 && (
              <span className="mr-1 text-xs opacity-70">({archivedDevices.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {devices.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
            <span className="text-2xl">📱</span>
          </div>
          <p className="text-surface-500 dark:text-surface-400 text-sm">لا توجد أجهزة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => (
            <DeviceCard key={device.token} device={device} onClick={() => onSelectDevice(device)} />
          ))}
        </div>
      )}
    </div>
  );
}
