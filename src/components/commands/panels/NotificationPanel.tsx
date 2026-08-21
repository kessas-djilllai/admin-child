import { useState } from 'react';
import { sendCommand } from '../../../services/api';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Send, ArrowRight, CheckCircle } from 'lucide-react';

interface Props {
  token: string;
  onBack: () => void;
}

export function NotificationPanel({ token, onBack }: Props) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await sendCommand(token, 'send_notification', { message: text });
      setSent(true);
      setText('');
      setTimeout(() => setSent(false), 3000);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <ArrowRight size={20} className="text-surface-600 dark:text-surface-400" />
        </button>
        <Send size={20} className="text-green-500" />
        <h2 className="text-lg font-bold text-surface-900 dark:text-white">إرسال رسالة فورية</h2>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 space-y-4">
        <p className="text-sm text-surface-500 dark:text-surface-400">
          اكتب نص الرسالة وستظهر كشعار (notification) على جهاز الطفل
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتب نص الرسالة هنا..."
          className="w-full h-32 p-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-all"
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-surface-400">{text.length} حرف</span>
          <Button icon={<Send size={16} />} onClick={send} loading={loading} disabled={!text.trim()}>
            إرسال
          </Button>
        </div>

        {sent && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
            <CheckCircle size={18} className="text-emerald-500" />
            <span className="text-sm text-emerald-600 dark:text-emerald-400">تم الإرسال بنجاح</span>
          </div>
        )}
      </div>
    </div>
  );
}
