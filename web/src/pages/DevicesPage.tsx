import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, Monitor } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { DeviceGrid } from '../components/device/DeviceGrid';
import { Dialog } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { useDevices } from '../hooks/useDevices';
import { useAppStore } from '../stores/useAppStore';
import { addDevice } from '../services/api';
import { useState } from 'react';

export function DevicesPage() {
  const navigate = useNavigate();
  const { devices, allDevices, isLoading, refetch } = useDevices();
  const { settings } = useAppStore();
  const [addDialog, setAddDialog] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [newName, setNewName] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const onlineCount = allDevices.filter((d) => d.isOnline).length;

  const handleAddDevice = async () => {
    if (!newToken.trim() || !newName.trim()) return;
    setAddLoading(true);
    try {
      await addDevice(newToken, newName);
      setAddDialog(false);
      setNewToken('');
      setNewName('');
      refetch();
    } catch { /* ignore */ }
    finally { setAddLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">الأجهزة</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            {allDevices.length} جهاز — {onlineCount} متصل
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" icon={<RefreshCw size={16} />} onClick={() => refetch()}>
            تحديث
          </Button>
          <Button size="sm" icon={<Plus size={16} />} onClick={() => setAddDialog(true)}>
            إضافة جهاز
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'الكل', value: allDevices.length, color: 'from-primary-500 to-primary-600', icon: Monitor },
          { label: 'متصل', value: onlineCount, color: 'from-emerald-500 to-emerald-600', icon: Monitor },
          { label: 'غير متصل', value: allDevices.length - onlineCount, color: 'from-surface-400 to-surface-500', icon: Monitor },
          { label: 'الموقع', value: settings.serverUrl ? '✓' : '—', color: 'from-sky-500 to-sky-600', icon: Monitor },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-surface-500 dark:text-surface-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Device Grid */}
      <DeviceGrid
        devices={devices}
        isLoading={isLoading}
        onSelectDevice={(device) => {
          useAppStore.getState().setSelectedDevice(device);
          navigate(`/device/${device.token}`);
        }}
      />

      {/* Add Device Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} title="إضافة جهاز جديد">
        <div className="space-y-4">
          <Input
            label="اسم الجهاز"
            placeholder="مثال: جهاز الابن"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            label="توكن الجهاز"
            placeholder="أدخل التوكن..."
            value={newToken}
            onChange={(e) => setNewToken(e.target.value)}
            dir="ltr"
          />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setAddDialog(false)}>إلغاء</Button>
            <Button onClick={handleAddDevice} loading={addLoading}>إضافة</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
