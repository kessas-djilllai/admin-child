import { useState, useEffect } from 'react';
import { sendCommand } from '../../../services/api';
import { onSocketEvent } from '../../../services/socket';
import { Button } from '../../ui/Button';
import { Mic, MicOff, ArrowRight } from 'lucide-react';

interface Props {
  token: string;
  onBack: () => void;
}

export function MicroPanel({ token, onBack }: Props) {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    const unsub = onSocketEvent('stream:data', (data: unknown) => {
      const d = data as { level?: number };
      if (d.level !== undefined) setAudioLevel(d.level);
      else setAudioLevel(Math.random() * 100);
    });
    return () => unsub();
  }, []);

  const startMic = async () => {
    setIsLoading(true);
    try {
      await sendCommand(token, 'micro_on');
      setIsActive(true);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  const stopMic = async () => {
    setIsLoading(true);
    try {
      await sendCommand(token, 'micro_off');
      setIsActive(false);
      setAudioLevel(0);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <ArrowRight size={20} className="text-surface-600 dark:text-surface-400" />
        </button>
        <Mic size={20} className="text-red-500" />
        <h2 className="text-lg font-bold text-surface-900 dark:text-white">بث الميكروفون المباشر</h2>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 flex flex-col items-center gap-6">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
          isActive
            ? 'bg-red-50 dark:bg-red-500/10 border-4 border-red-300 dark:border-red-500/30 shadow-lg shadow-red-500/20'
            : 'bg-surface-100 dark:bg-surface-800 border-4 border-surface-200 dark:border-surface-700'
        }`}>
          {isActive ? (
            <div className="flex items-end gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="w-1.5 bg-red-400 rounded-full animate-pulse" style={{ height: `${(audioLevel / 100) * (Math.random() * 40 + 10)}px`, animationDelay: `${i * 50}ms` }} />
              ))}
            </div>
          ) : (
            <Mic size={40} className="text-surface-300 dark:text-surface-600" />
          )}
        </div>

        <p className="text-sm text-surface-500 dark:text-surface-400">
          {isActive ? 'الميكروفون يعمل — جاري البث المباشر' : 'اضغط لبدء الاستماع للميكروفون'}
        </p>

        {isActive && <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" /></span>}

        {isActive ? (
          <Button variant="danger" size="lg" icon={<MicOff size={20} />} onClick={stopMic} loading={isLoading} className="w-full max-w-xs">
            إيقاف البث
          </Button>
        ) : (
          <Button size="lg" icon={<Mic size={20} />} onClick={startMic} loading={isLoading} className="w-full max-w-xs">
            بدء البث
          </Button>
        )}
      </div>
    </div>
  );
}
