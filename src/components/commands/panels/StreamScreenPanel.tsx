import { useState } from 'react';
import { sendCommand } from '../../../services/api';
import { Button } from '../../ui/Button';
import { Monitor, Radio, StopCircle, ArrowRight } from 'lucide-react';
import { StreamLightbox } from './StreamLightbox';

interface Props {
  token: string;
  onBack: () => void;
}

export function StreamScreenPanel({ token, onBack }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startStream = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await sendCommand(token, 'stream_screen');
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
      await sendCommand(token, 'stop_stream');
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
        <Monitor size={20} className="text-emerald-500" />
        <h2 className="text-lg font-bold text-surface-900 dark:text-white">بث الشاشة المباشر</h2>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-sm text-rose-600 dark:text-rose-400">{error}</div>
      )}

      <div className="flex gap-3">
        {!streaming ? (
          <Button icon={<Radio size={16} />} onClick={startStream} loading={isLoading} className="flex-1">
            بدء البث
          </Button>
        ) : (
          <>
            <Button icon={<Monitor size={16} />} onClick={() => setStreaming(true)} className="flex-1">
              عرض البث
            </Button>
            <Button variant="danger" size="sm" icon={<StopCircle size={16} />} onClick={stopStream} loading={isLoading}>
              إيقاف
            </Button>
          </>
        )}
      </div>

      <div className="bg-surface-100 dark:bg-surface-800 rounded-2xl p-8 text-center">
        <Monitor size={48} className="mx-auto mb-3 text-surface-300 dark:text-surface-600" />
        <p className="text-sm text-surface-500">
          {streaming ? 'البث نشط — اضغط "عرض البث" لفتحه في نافذة ملء الشاشة' : 'اضغط "بدء البث" لمراقبة شاشة الجهاز مباشرة'}
        </p>
      </div>

      <StreamLightbox
        open={streaming}
        onClose={() => setStreaming(false)}
        deviceToken={token}
        streamType="screen"
        title="بث الشاشة المباشر"
      />
    </div>
  );
}
