import { useState } from 'react';
import { sendCommand } from '../../../services/api';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Radio, StopCircle } from 'lucide-react';

interface Props { token: string }

export function LiveMicTab({ token }: Props) {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Radio size={20} className="text-primary-500" />
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">بث الميكروفون المباشر</h2>
      </div>

      <Card className="flex flex-col items-center py-12">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all ${isActive ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-2xl shadow-red-500/30' : 'bg-surface-100 dark:bg-surface-800'}`}>
          {isActive ? (
            <div className="relative">
              <StopCircle size={32} className="text-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-red-400" /></span>
            </div>
          ) : (
            <Radio size={32} className="text-surface-400" />
          )}
        </div>
        <p className="text-sm text-surface-500 mb-6">
          {isActive ? 'جاري البث المباشر...' : 'اضغط لبدء بث الميكروفون من الجهاز'}
        </p>
        {isActive ? (
          <Button variant="danger" icon={<StopCircle size={16} />} onClick={stopMic} loading={isLoading}>إيقاف البث</Button>
        ) : (
          <Button icon={<Radio size={16} />} onClick={startMic} loading={isLoading}>بدء البث</Button>
        )}
        {isActive && (
          <div className="mt-6 flex items-center gap-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-1 bg-red-400 rounded-full animate-pulse" style={{ height: `${Math.random() * 30 + 10}px`, animationDelay: `${i * 50}ms` }} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
