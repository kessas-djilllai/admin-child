import { useState } from 'react';
import { sendCommand } from '../../../services/api';
import { Button } from '../../ui/Button';
import { Volume2, VolumeX } from 'lucide-react';

interface Props {
  token: string;
}

export function VolumeModal({ token }: Props) {
  const [volume, setVolume] = useState(50);
  const [loading, setLoading] = useState(false);

  const applyVolume = async () => {
    setLoading(true);
    try { await sendCommand(token, 'set_volume', { volume }); } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-center">
        <div className="w-28 h-28 rounded-full bg-fuchsia-50 dark:bg-fuchsia-500/10 border-4 border-fuchsia-200 dark:border-fuchsia-500/30 flex items-center justify-center">
          <span className="text-2xl font-bold text-fuchsia-600 dark:text-fuchsia-400">{volume}%</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <VolumeX size={18} className="text-surface-400 shrink-0" />
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="flex-1 accent-fuchsia-600 h-2"
        />
        <Volume2 size={18} className="text-surface-400 shrink-0" />
      </div>

      <div className="flex gap-2">
        {[0, 25, 50, 75, 100].map((v) => (
          <button
            key={v}
            onClick={() => setVolume(v)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
              volume === v
                ? 'bg-fuchsia-600 text-white'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
            }`}
          >
            {v}%
          </button>
        ))}
      </div>

      <Button onClick={applyVolume} loading={loading} className="w-full">
        تطبيق المستوى
      </Button>
    </div>
  );
}
