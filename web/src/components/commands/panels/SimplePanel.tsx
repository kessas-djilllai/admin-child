import { useState } from 'react';
import { sendCommand } from '../../../services/api';
import { Button } from '../../ui/Button';
import { ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import type { ComponentType } from 'react';

interface Props {
  token: string;
  command: string;
  label: string;
  description: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  color: string;
  danger?: boolean;
  onBack: () => void;
}

export function SimplePanel({ token, command, label, description, icon: Icon, color, danger, onBack }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);

  const execute = async () => {
    setLoading(true);
    setResult(null);
    try {
      await sendCommand(token, command);
      setResult('success');
    } catch {
      setResult('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <ArrowRight size={20} className="text-surface-600 dark:text-surface-400" />
        </button>
        <Icon size={20} className={color} />
        <h2 className="text-lg font-bold text-surface-900 dark:text-white">{label}</h2>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 flex flex-col items-center gap-6">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
          danger
            ? 'bg-rose-50 dark:bg-rose-500/10 border-4 border-rose-200 dark:border-rose-500/20'
            : 'bg-surface-50 dark:bg-surface-800 border-4 border-surface-200 dark:border-surface-700'
        }`}>
          <Icon size={40} className={danger ? 'text-rose-400' : 'text-surface-400'} />
        </div>

        <p className="text-sm text-surface-500 dark:text-surface-400 text-center max-w-sm">{description}</p>

        {danger && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 w-full">
            <AlertTriangle size={16} className="text-amber-500 shrink-0" />
            <span className="text-xs text-amber-600 dark:text-amber-400">هذا الأمر قد يسبب تغييراً على الجهاز</span>
          </div>
        )}

        {result === 'success' && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 w-full">
            <CheckCircle size={16} className="text-emerald-500" />
            <span className="text-sm text-emerald-600 dark:text-emerald-400">تم إرسال الأمر بنجاح</span>
          </div>
        )}

        {result === 'error' && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 w-full">
            <AlertTriangle size={16} className="text-rose-500" />
            <span className="text-sm text-rose-600 dark:text-rose-400">فشل إرسال الأمر</span>
          </div>
        )}

        <Button
          size="lg"
          variant={danger ? 'danger' : 'primary'}
          onClick={execute}
          loading={loading}
          disabled={result === 'success'}
          className="w-full max-w-xs"
        >
          تنفيذ الأمر
        </Button>
      </div>
    </div>
  );
}
