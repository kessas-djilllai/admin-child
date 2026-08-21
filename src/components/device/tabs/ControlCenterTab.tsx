import { useState } from 'react';
import { sendCommand } from '../../../services/api';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { MapPin, Send, Volume2, VolumeX, Flashlight, FlashlightOff, Bell } from 'lucide-react';
import { Input } from '../../ui/Input';

interface Props { token: string }

export function ControlCenterTab({ token }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [volume, setVolume] = useState(50);
  const [notification, setNotification] = useState('');

  const doCommand = async (cmd: string, params?: Record<string, unknown>, id?: string) => {
    setLoading(id || cmd);
    try { await sendCommand(token, cmd, params); } catch { /* ignore */ }
    finally { setLoading(null); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-surface-900 dark:text-white">مركز التحكم</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Flashlight */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Flashlight size={18} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white">الفلاش</h3>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" icon={<Flashlight size={14} />} onClick={() => doCommand('flash_on', undefined, 'flash_on')} loading={loading === 'flash_on'} className="flex-1">تشغيل</Button>
            <Button size="sm" variant="outline" icon={<FlashlightOff size={14} />} onClick={() => doCommand('flash_off', undefined, 'flash_off')} loading={loading === 'flash_off'} className="flex-1">إيقاف</Button>
          </div>
        </Card>

        {/* Volume */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Volume2 size={18} className="text-sky-500" />
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white">مستوى الصوت: {volume}%</h3>
          </div>
          <input type="range" min={0} max={100} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full accent-primary-600 mb-3" />
          <Button size="sm" onClick={() => doCommand('set_volume', { volume }, 'set_volume')} loading={loading === 'set_volume'} className="w-full">تطبيق</Button>
        </Card>

        {/* Sound */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Volume2 size={18} className="text-emerald-500" />
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white">الصوت</h3>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => doCommand('play_remote_sound', undefined, 'play_sound')} loading={loading === 'play_sound'} className="flex-1">تشغيل</Button>
            <Button size="sm" variant="outline" onClick={() => doCommand('stop_sound', undefined, 'stop_sound')} loading={loading === 'stop_sound'} className="flex-1">إيقاف</Button>
          </div>
        </Card>

        {/* Location */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={18} className="text-rose-500" />
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white">الموقع</h3>
          </div>
          <Button size="sm" variant="outline" icon={<MapPin size={14} />} onClick={() => doCommand('get_location', undefined, 'get_location')} loading={loading === 'get_location'} className="w-full">جلب الموقع</Button>
        </Card>

        {/* Send Notification */}
        <Card className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Bell size={18} className="text-primary-500" />
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white">إرسال تنبيه</h3>
          </div>
          <div className="flex gap-2">
            <input placeholder="اكتب نص التنبيه..." value={notification} onChange={(e) => setNotification(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40" />
            <Button size="sm" icon={<Send size={14} />} onClick={() => { if (notification.trim()) { doCommand('send_notification', { message: notification }, 'send_notif'); setNotification(''); } }} loading={loading === 'send_notif'}>إرسال</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
