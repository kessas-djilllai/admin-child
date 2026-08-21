import { Battery, BatteryCharging, BatteryLow, Wifi, WifiOff, HardDrive, Smartphone, Star, Archive, MoreVertical } from 'lucide-react';
import { Card } from '../ui/Card';
import { DeviceStatusBadge } from './DeviceStatusBadge';
import { useAppStore } from '../../stores/useAppStore';
import type { Device } from '../../types';
import { useState, useRef, useEffect } from 'react';

interface DeviceCardProps {
  device: Device;
  onClick: () => void;
}

function getBatteryIcon(level: number, charging: boolean) {
  if (charging) return <BatteryCharging size={16} className="text-emerald-500" />;
  if (level <= 20) return <BatteryLow size={16} className="text-rose-500" />;
  return <Battery size={16} className="text-surface-500" />;
}

function getBatteryColor(level: number) {
  if (level <= 20) return 'text-rose-500';
  if (level <= 50) return 'text-amber-500';
  return 'text-emerald-500';
}

function timeAgo(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'الآن';
  if (diff < 3600) return `${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} س`;
  return `${Math.floor(diff / 86400)} ي`;
}

export function DeviceCard({ device, onClick }: DeviceCardProps) {
  const { favorites, toggleFavorite, archivedDevices, toggleArchived } = useAppStore();
  const isFav = favorites.includes(device.token);
  const isArchived = archivedDevices.includes(device.token);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Card hover onClick={onClick} className="relative group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            device.isOnline
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
              : 'bg-surface-200 dark:bg-surface-800'
          }`}>
            <Smartphone size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white">{device.name}</h3>
            <p className="text-xs text-surface-500 dark:text-surface-400 font-mono">{device.token.slice(0, 12)}...</p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreVertical size={14} className="text-surface-400" />
          </button>
          {menuOpen && (
            <div className="absolute left-0 top-8 w-40 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl shadow-lg py-1 z-10">
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(device.token); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
              >
                <Star size={14} className={isFav ? 'text-amber-500 fill-amber-500' : 'text-surface-400'} />
                {isFav ? 'إلغاء المفضلة' : 'إضافة للمفضلة'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleArchived(device.token); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
              >
                <Archive size={14} className="text-surface-400" />
                {isArchived ? 'إلغاء الأرشفة' : 'أرشفة'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between mb-4">
        <DeviceStatusBadge isOnline={device.isOnline} />
        <span className="text-xs text-surface-400">{timeAgo(device.lastActive)}</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-50 dark:bg-surface-800/50">
          {getBatteryIcon(device.battery, device.isCharging)}
          <span className={`text-xs font-medium ${getBatteryColor(device.battery)}`}>{device.battery}%</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-50 dark:bg-surface-800/50">
          {device.networkType === 'wifi' ? (
            <Wifi size={14} className="text-sky-500" />
          ) : (
            <WifiOff size={14} className="text-surface-400" />
          )}
          <span className="text-xs text-surface-600 dark:text-surface-400">{device.networkType || '—'}</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-50 dark:bg-surface-800/50">
          <HardDrive size={14} className="text-surface-400" />
          <span className="text-xs text-surface-600 dark:text-surface-400">
            {device.storageTotal > 0 ? `${Math.round((device.storageUsed / device.storageTotal) * 100)}%` : '—'}
          </span>
        </div>
      </div>
    </Card>
  );
}
