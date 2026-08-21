import { useState } from 'react';
import { sendCommand } from '../../../services/api';
import { Button } from '../../ui/Button';
import { Camera, Video, VideoOff, ArrowRight } from 'lucide-react';
import { StreamLightbox } from './StreamLightbox';

interface Props {
  token: string;
  onBack: () => void;
}

export function StreamCameraPanel({ token, onBack }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [camera, setCamera] = useState<'front' | 'back'>('front');
  const [error, setError] = useState<string | null>(null);

  const startStream = async (cam: 'front' | 'back') => {
    setIsLoading(true);
    setCamera(cam);
    setError(null);
    try {
      await sendCommand(token, `stream_camera_${cam}`);
      setStreaming(true);
    } catch {
      setError('فشل بدء البث');
    } finally {
      setIsLoading(false);
    }
  };

  const stopStream = async () => {
    setIsLoading(true);
    try {
      await sendCommand(token, 'stop_camera_stream');
      setStreaming(false);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <ArrowRight size={20} className="text-surface-600 dark:text-surface-400" />
        </button>
        <Camera size={20} className="text-green-500" />
        <h2 className="text-lg font-bold text-surface-900 dark:text-white">بث الكاميرا المباشر</h2>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-sm text-rose-600 dark:text-rose-400">{error}</div>
      )}

      {!streaming ? (
        <div className="flex gap-3">
          <Button icon={<Camera size={16} />} onClick={() => startStream('front')} loading={isLoading && camera === 'front'} variant="outline" className="flex-1">
            الكاميرا الأمامية
          </Button>
          <Button icon={<Camera size={16} />} onClick={() => startStream('back')} loading={isLoading && camera === 'back'} variant="outline" className="flex-1">
            الكاميرا الخلفية
          </Button>
        </div>
      ) : (
        <div className="flex gap-3">
          <Button icon={<Video size={16} />} onClick={() => setStreaming(true)} className="flex-1">
            عرض البث
          </Button>
          <Button variant="danger" size="sm" icon={<VideoOff size={16} />} onClick={stopStream} loading={isLoading}>
            إيقاف
          </Button>
        </div>
      )}

      <div className="bg-surface-100 dark:bg-surface-800 rounded-2xl p-8 text-center">
        <Camera size={48} className="mx-auto mb-3 text-surface-300 dark:text-surface-600" />
        <p className="text-sm text-surface-500">
          {streaming
            ? `البث نشط (${camera === 'front' ? 'أمامية' : 'خلفية'}) — اضغط "عرض البث"`
            : 'اختر الكاميرا لبدء البث المباشر'}
        </p>
      </div>

      <StreamLightbox
        open={streaming}
        onClose={() => setStreaming(false)}
        deviceToken={token}
        streamType="camera"
        title={`بث الكاميرا ${camera === 'front' ? 'الأمامية' : 'الخلفية'}`}
      />
    </div>
  );
}
