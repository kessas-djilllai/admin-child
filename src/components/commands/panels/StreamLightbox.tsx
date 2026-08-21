import { useEffect, useRef, useState } from 'react';
import { X, Monitor, Camera, Radio, Maximize, Minimize } from 'lucide-react';
import { initWebRTC, startWebRTCListener, stopWebRTCStream, cleanupWebRTC, type StreamType } from '../../../services/webrtc';

interface StreamLightboxProps {
  open: boolean;
  onClose: () => void;
  deviceToken: string;
  streamType: StreamType;
  title: string;
}

export function StreamLightbox({ open, onClose, deviceToken, streamType, title }: StreamLightboxProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'stopped'>('connecting');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) {
      cleanupWebRTC();
      setStatus('connecting');
      setErrorMsg('');
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
      return;
    }

    setStatus('connecting');

    initWebRTC({
      onStream: (stream: MediaStream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      },
      onConnected: () => {
        setStatus('connected');
        if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
      },
      onError: (err: string) => { setStatus('error'); setErrorMsg(err); },
      onDisconnected: () => setStatus('stopped'),
    });

    startWebRTCListener();

    timeoutRef.current = setTimeout(() => {
      if (status === 'connecting') {
        setStatus('error');
        setErrorMsg('หมดเวลาเชื่อมต่อ — تأكد أن الجهاز متصل');
      }
    }, 30000);

    return () => {
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
      stopWebRTCStream();
    };
  }, [open, deviceToken, streamType]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) containerRef.current.requestFullscreen?.();
    else document.exitFullscreen?.();
    setIsFullscreen(!isFullscreen);
  };

  if (!open) return null;

  const Icon = streamType === 'screen' ? Monitor : Camera;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <Icon size={18} className={status === 'connected' ? 'text-emerald-400' : 'text-surface-400'} />
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {status === 'connected' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-[10px] text-red-400 font-bold">LIVE</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
          <button onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 min-h-0 flex items-center justify-center px-4 pb-4" onClick={(e) => e.stopPropagation()}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-contain rounded-lg ${status === 'connected' ? '' : 'hidden'}`}
        />

        {status === 'connecting' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-white/60">جاري الاتصال بالبث...</p>
            <p className="text-xs text-white/30">تأكد أن الجهاز متصل بالإنترنت</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <Radio size={28} className="text-red-400" />
            </div>
            <div className="text-center">
              <p className="text-sm text-red-400 font-medium">{errorMsg || 'خطأ في الاتصال'}</p>
              <button onClick={onClose} className="mt-3 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors">
                إغلاق
              </button>
            </div>
          </div>
        )}

        {status === 'stopped' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-surface-500/20 flex items-center justify-center">
              <Radio size={28} className="text-surface-400" />
            </div>
            <div className="text-center">
              <p className="text-sm text-white/60">البث متوقف</p>
              <button onClick={onClose} className="mt-3 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors">
                إغلاق
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
