import { Battery, BatteryCharging, Wifi, WifiOff, HardDrive, Smartphone, Lock, Unlock, Cpu } from 'lucide-react';
import { Card } from '../ui/Card';
import type { Device } from '../../types';

interface DeviceInfoCardsProps {
  device: Device;
}

export function DeviceInfoCards({ device }: DeviceInfoCardsProps) {
  const cards = [
    {
      icon: device.isCharging ? <BatteryCharging size={22} /> : <Battery size={22} />,
      label: 'البطارية',
      value: `${device.battery}%`,
      sub: device.isCharging ? 'جاري الشحن' : '',
      color: device.battery <= 20 ? 'from-rose-500 to-rose-600' : device.battery <= 50 ? 'from-amber-500 to-amber-600' : 'from-emerald-500 to-emerald-600',
    },
    {
      icon: device.networkType === 'wifi' ? <Wifi size={22} /> : <WifiOff size={22} />,
      label: 'الشبكة',
      value: device.networkType || 'غير معروف',
      sub: device.carrierName || '',
      color: 'from-sky-500 to-sky-600',
    },
    {
      icon: <HardDrive size={22} />,
      label: 'التخزين',
      value: device.storageTotal > 0 ? `${formatBytes(device.storageUsed)} / ${formatBytes(device.storageTotal)}` : 'غير معروف',
      sub: device.storageTotal > 0 ? `${Math.round((device.storageUsed / device.storageTotal) * 100)}% مستخدم` : '',
      color: 'from-violet-500 to-violet-600',
    },
    {
      icon: <Cpu size={22} />,
      label: 'إصدار Android',
      value: device.androidVersion || 'غير معروف',
      sub: '',
      color: 'from-pink-500 to-pink-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <Card key={card.label} padding="md">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white mb-3`}>
            {card.icon}
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400 mb-1">{card.label}</p>
          <p className="text-sm font-semibold text-surface-900 dark:text-white">{card.value}</p>
          {card.sub && <p className="text-xs text-surface-400 mt-0.5">{card.sub}</p>}
        </Card>
      ))}
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
