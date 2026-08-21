import { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Loader, Copy, Check } from 'lucide-react';
import { sendCommand } from '../../services/api';
import { onSocketEvent } from '../../services/socket';

export type ProgressStage = 'idle' | 'connecting' | 'sending' | 'executing' | 'uploading' | 'receiving' | 'success' | 'error';

export interface CommandProgress {
  id: number;
  command: string;
  label: string;
  stage: ProgressStage;
  message?: string;
  completedStages?: ProgressStage[];
}

interface BadgeProps {
  progress: CommandProgress | null;
  commandKey: string;
}

export function CommandProgressBadge({ progress, commandKey }: BadgeProps) {
  if (!progress || progress.command !== commandKey) return null;

  const isError = progress.stage === 'error';
  const isDone = progress.stage === 'success' || progress.stage === 'error';

  return (
    <div className={`absolute -top-1.5 -left-1.5 z-10 w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-surface-900 ${
      isError ? 'bg-rose-500' : isDone ? 'bg-emerald-500' : 'bg-primary-500'
    }`}>
      {!isDone && <Loader size={12} className="text-white animate-spin" />}
      {progress.stage === 'success' && <CheckCircle size={12} className="text-white" />}
      {progress.stage === 'error' && <AlertTriangle size={12} className="text-white" />}
    </div>
  );
}

interface LabelProps {
  progress: CommandProgress | null;
  commandKey: string;
}

const STAGE_LABELS: Partial<Record<ProgressStage, string>> = {
  connecting: 'جاري الاتصال بالسيرفر...',
  sending: 'جاري إرسال الأمر...',
  executing: 'جاري تنفيذ الأمر...',
  uploading: 'جاري رفع الملف...',
  receiving: 'جاري استلام الملف...',
};

export function CommandProgressLabel({ progress, commandKey }: LabelProps) {
  if (!progress || progress.command !== commandKey) return null;
  if (progress.stage === 'error' || progress.stage === 'success' || progress.stage === 'idle') return null;

  return (
    <div className="absolute inset-x-0 -bottom-6 flex justify-center z-10 pointer-events-none">
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap bg-primary-500 text-white shadow-md">
        {STAGE_LABELS[progress.stage]}
      </span>
    </div>
  );
}

export function ErrorToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-3 bg-rose-600 text-white px-4 py-3 rounded-2xl shadow-2xl shadow-rose-500/30 max-w-md">
        <AlertTriangle size={18} className="shrink-0" />
        <p className="text-sm font-medium flex-1 text-right">{message}</p>
        <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors shrink-0" title="نسخ">
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
        <button onClick={onDismiss} className="text-xs text-white/70 hover:text-white transition-colors shrink-0">✕</button>
      </div>
    </div>
  );
}

export function SuccessToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-3 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl shadow-emerald-500/30 max-w-md">
        <CheckCircle size={18} className="shrink-0" />
        <p className="text-sm font-medium flex-1 text-right">{message}</p>
        <button onClick={onDismiss} className="text-xs text-white/70 hover:text-white transition-colors shrink-0">✕</button>
      </div>
    </div>
  );
}

const MEDIA_COMMANDS = ['take_screenshot', 'take_photo_front', 'take_photo_back', 'record_video_front', 'record_video_back', 'record_audio'];

let progressId = 0;

export function useCommandProgress(onMediaReceived?: () => void) {
  const [progress, setProgress] = useState<CommandProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const activeIdRef = useRef<number | null>(null);
  const mediaReceivedRef = useRef(false);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    const unsubReply = onSocketEvent('command:reply', (data: unknown) => {
      const d = data as { device_token?: string; message?: string; response_data?: string; status?: string };
      if (!d.status) return;
      const currentId = activeIdRef.current;
      if (!currentId) return;

      clearAllTimeouts();

      if (d.status === 'error') {
        const msg = d.message || d.response_data || 'فشل التنفيذ';
        setProgress((prev) => prev && prev.id === currentId ? { ...prev, stage: 'error', message: msg } : prev);
        setErrorMessage(msg);
        const t = setTimeout(() => setErrorMessage(null), 3000);
        timeoutsRef.current.push(t);
        activeIdRef.current = null;
        const dt = setTimeout(() => setProgress(null), 4000);
        timeoutsRef.current.push(dt);
      } else {
        setProgress((prev) => prev && prev.id === currentId ? { ...prev, stage: 'receiving' } : prev);
        setTimeout(() => {
          if (activeIdRef.current === currentId) {
            const msg = d.message || d.response_data || 'تم التنفيذ بنجاح';
            setProgress((prev) => prev && prev.id === currentId ? { ...prev, stage: 'success', message: msg } : prev);
            setSuccessMessage(msg);
            const t = setTimeout(() => setSuccessMessage(null), 3000);
            timeoutsRef.current.push(t);
            activeIdRef.current = null;
            const dt = setTimeout(() => setProgress(null), 4000);
            timeoutsRef.current.push(dt);
            if (mediaReceivedRef.current) {
              mediaReceivedRef.current = false;
              setTimeout(() => onMediaReceived?.(), 500);
            }
          }
        }, 800);
      }
    });

    const unsubExec = onSocketEvent('command:executing', (data: unknown) => {
      const currentId = activeIdRef.current;
      if (!currentId) return;
      setProgress((prev) => prev && prev.id === currentId ? { ...prev, stage: 'executing' } : prev);
    });

    const unsubStatus = onSocketEvent('command:status', (data: unknown) => {
      const d = data as { device_token?: string; command_id?: string; status?: string; message?: string };
      const currentId = activeIdRef.current;
      if (!currentId) return;
      if (d.status === 'executing') {
        setProgress((prev) => prev && prev.id === currentId ? { ...prev, stage: 'executing' } : prev);
      } else if (d.status === 'uploading') {
        setProgress((prev) => prev && prev.id === currentId ? { ...prev, stage: 'uploading' } : prev);
      } else if (d.status === 'uploaded') {
        setProgress((prev) => prev && prev.id === currentId ? { ...prev, stage: 'receiving' } : prev);
      }
    });

    return () => {
      unsubReply();
      unsubExec();
      unsubStatus();
      clearAllTimeouts();
    };
  }, [clearAllTimeouts, onMediaReceived]);

  const send = useCallback(async (deviceToken: string, command: string, label: string) => {
    clearAllTimeouts();
    setSuccessMessage(null);
    const id = ++progressId;
    activeIdRef.current = id;
    mediaReceivedRef.current = MEDIA_COMMANDS.includes(command);

    setProgress({ id, command, label, stage: 'connecting', completedStages: [] });

    timeoutsRef.current.push(setTimeout(() => {
      if (activeIdRef.current === id) {
        setProgress((prev) => prev && prev.id === id ? { ...prev, stage: 'sending' } : prev);
      }
    }, 500));

    try {
      const result = await sendCommand(deviceToken, command) as { delivered?: boolean; error?: string }[];
      if (activeIdRef.current !== id) return;
      if (result?.[0]?.error === 'device_offline') {
        clearAllTimeouts();
        const msg = 'الجهاز غير متصل';
        setProgress({ id, command, label, stage: 'error', message: msg });
        setErrorMessage(msg);
        const t = setTimeout(() => setErrorMessage(null), 3000);
        timeoutsRef.current.push(t);
        activeIdRef.current = null;
        const dt = setTimeout(() => setProgress(null), 4000);
        timeoutsRef.current.push(dt);
        return;
      }
      setProgress((prev) => prev && prev.id === id ? { ...prev, stage: 'executing' } : prev);
    } catch {
      if (activeIdRef.current === id) {
        clearAllTimeouts();
        const msg = 'فشل الاتصال';
        setProgress({ id, command, label, stage: 'error', message: msg });
        setErrorMessage(msg);
        const t = setTimeout(() => setErrorMessage(null), 3000);
        timeoutsRef.current.push(t);
        activeIdRef.current = null;
        const dt = setTimeout(() => setProgress(null), 4000);
        timeoutsRef.current.push(dt);
      }
    }
  }, [clearAllTimeouts]);

  const dismiss = useCallback(() => {
    clearAllTimeouts();
    activeIdRef.current = null;
    setProgress(null);
  }, [clearAllTimeouts]);

  const dismissError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const dismissSuccess = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  return { progress, errorMessage, successMessage, send, dismiss, dismissError, dismissSuccess };
}
