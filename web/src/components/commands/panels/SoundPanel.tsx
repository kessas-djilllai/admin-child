import { useState } from 'react';
import { sendCommand } from '../../../services/api';
import { Button } from '../../ui/Button';
import { Play, Square, Loader } from 'lucide-react';

interface Props {
  token: string;
}

export function SoundModal({ token }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSound = async () => {
    setLoading('play');
    try {
      await sendCommand(token, 'play_remote_sound');
      setIsPlaying(true);
    } catch { /* ignore */ }
    finally { setLoading(null); }
  };

  const stopSound = async () => {
    setLoading('stop');
    try {
      await sendCommand(token, 'stop_sound');
      setIsPlaying(false);
    } catch { /* ignore */ }
    finally { setLoading(null); }
  };

  return (
    <div className="space-y-4">
      {isPlaying && (
        <div className="flex items-center gap-1 justify-center py-3">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-1.5 bg-fuchsia-400 rounded-full animate-pulse" style={{ height: `${Math.random() * 30 + 8}px`, animationDelay: `${i * 40}ms` }} />
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          icon={loading === 'play' ? <Loader size={16} className="animate-spin" /> : <Play size={16} />}
          onClick={playSound}
          loading={loading === 'play'}
          className="flex-1"
        >
          تشغيل صوت تنبيه
        </Button>
        <Button
          variant="danger"
          icon={loading === 'stop' ? <Loader size={16} className="animate-spin" /> : <Square size={16} />}
          onClick={stopSound}
          loading={loading === 'stop'}
          className="flex-1"
        >
          إيقاف الصوت
        </Button>
      </div>
    </div>
  );
}
