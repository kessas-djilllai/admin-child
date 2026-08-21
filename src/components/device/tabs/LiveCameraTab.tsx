import { useState, useEffect } from 'react';
import { sendCommand } from '../../../services/api';
import { onSocketEvent } from '../../../services/socket';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Video, VideoOff, Camera } from 'lucide-react';

interface Props { token: string }

export function LiveCameraTab({ token }: Props) {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [camera, setCamera] = useState<'front' | 'back'>('front');
  const [lastFrame, setLastFrame] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSocketEvent('stream:data', (data: unknown) => {
      const d = data as { image?: string; data?: string };
      const base64 = d.image || d.data;
      if (base64 && isActive) setLastFrame(`data:image/jpeg;base64,${base64}`);
    });
    return () => unsub();
  }, [isActive]);

  const startStream = async (cam: 'front' | 'back') => {
    setIsLoading(true);
    setCamera(cam);
    try {
      await sendCommand(token, `stream_camera_${cam}`);
      setIsActive(true);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  const stopStream = async () => {
    setIsLoading(true);
    try {
      await sendCommand(token, 'stop_camera_stream');
      setIsActive(false);
      setLastFrame(null);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Camera size={20} className="text-primary-500" />
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">بث الكاميرا المباشر</h2>
          {isActive && <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" /></span>}
        </div>
        {isActive && <Button variant="danger" size="sm" icon={<VideoOff size={16} />} onClick={stopStream} loading={isLoading}>إيقاف</Button>}
      </div>

      {!isActive && (
        <div className="flex gap-3">
          <Button icon={<Camera size={16} />} onClick={() => startStream('front')} loading={isLoading && camera === 'front'} variant="outline" className="flex-1">
            الكاميرا الأمامية
          </Button>
          <Button icon={<Camera size={16} />} onClick={() => startStream('back')} loading={isLoading && camera === 'back'} variant="outline" className="flex-1">
            الكاميرا الخلفية
          </Button>
        </div>
      )}

      <div className="relative bg-surface-900 rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800" style={{ minHeight: 400 }}>
        {lastFrame ? (
          <img src={lastFrame} alt="Camera Stream" className="w-full h-full object-contain" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-surface-500">
            <Video size={48} className="mb-4 opacity-30" />
            <p className="text-sm">{isActive ? 'في انتظار الإطارات...' : 'اختر الكاميرا لبدء البث'}</p>
          </div>
        )}
        {isActive && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" /></span>
            <span className="text-xs text-white font-medium">CAM {camera === 'front' ? 'أمامية' : 'خلفية'}</span>
          </div>
        )}
      </div>
    </div>
  );
}
