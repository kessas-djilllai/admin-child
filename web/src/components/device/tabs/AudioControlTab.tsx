import { useState, useEffect } from 'react';
import { sendCommand } from '../../../services/api';
import { onSocketEvent } from '../../../services/socket';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Volume2, VolumeX, Volume1, Play, Square, Music } from 'lucide-react';

interface Props { token: string }

export function AudioControlTab({ token }: Props) {
  const [volume, setVolume] = useState(50);
  const [loading, setLoading] = useState<string | null>(null);
  const [sounds, setSounds] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const unsub = onSocketEvent('command:reply', (data: unknown) => {
      const d = data as { command?: string; result?: string };
      if (d.command === 'get_sounds' && d.result) {
        try {
          const list = JSON.parse(d.result);
          if (Array.isArray(list)) setSounds(list);
        } catch {
          setSounds(d.result.split('\n').filter(Boolean));
        }
      }
    });
    return () => unsub();
  }, []);

  const doCmd = async (cmd: string, params?: Record<string, unknown>, id?: string) => {
    setLoading(id || cmd);
    try { await sendCommand(token, cmd, params); } catch { /* ignore */ }
    finally { setLoading(null); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-surface-900 dark:text-white">التحكم بالصوت</h2>

      {/* Volume Control */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Volume2 size={18} className="text-sky-500" />
          <h3 className="text-sm font-semibold text-surface-900 dark:text-white">مستوى الصوت</h3>
        </div>
        <div className="flex items-center gap-4">
          <VolumeX size={16} className="text-surface-400 shrink-0" />
          <input
            type="range" min={0} max={100} value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 accent-primary-600"
          />
          <Volume1 size={16} className="text-surface-400 shrink-0" />
          <span className="text-sm font-bold text-surface-900 dark:text-white w-10 text-center">{volume}%</span>
        </div>
        <Button size="sm" onClick={() => doCmd('set_volume', { volume }, 'set_vol')} loading={loading === 'set_vol'} className="w-full mt-4">
          تطبيق المستوى
        </Button>
      </Card>

      {/* Remote Sound Playback */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Music size={18} className="text-emerald-500" />
          <h3 className="text-sm font-semibold text-surface-900 dark:text-white">تشغيل صوت عن بُعد</h3>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" icon={<Play size={14} />} onClick={() => { doCmd('play_remote_sound', undefined, 'play_sound'); setIsPlaying(true); }} loading={loading === 'play_sound'} className="flex-1">تشغيل</Button>
          <Button size="sm" variant="outline" icon={<Square size={14} />} onClick={() => { doCmd('stop_sound', undefined, 'stop_sound'); setIsPlaying(false); }} loading={loading === 'stop_sound'} className="flex-1">إيقاف</Button>
        </div>
        {isPlaying && (
          <div className="mt-3 flex items-center gap-1 justify-center">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: `${Math.random() * 20 + 8}px`, animationDelay: `${i * 40}ms` }} />
            ))}
          </div>
        )}
      </Card>

      {/* Available Sounds */}
      {sounds.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">الأصوات المتاحة</h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {sounds.map((s, i) => (
              <button key={i} onClick={() => doCmd('play_remote_sound', { sound: s }, `play_${i}`)} className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors text-right">
                <Play size={12} className="text-emerald-500 shrink-0" />
                <span className="text-sm text-surface-700 dark:text-surface-300 truncate">{s}</span>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
