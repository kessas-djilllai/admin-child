import { useState } from 'react';
import { sendCommand } from '../../../services/api';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Bell, Send } from 'lucide-react';

interface Props { token: string }

export function NotificationTab({ token }: Props) {
  const [title, setTitle] = useState('تنبيه من الوالدين');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      await sendCommand(token, 'send_notification', { title, message });
      setSent(true);
      setTimeout(() => setSent(false), 2000);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Bell size={20} className="text-primary-500" />
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">إرسال إشعار فوري</h2>
      </div>

      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">العنوان</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">الرسالة</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="اكتب نص التنبيه..."
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 resize-none"
            />
          </div>

          <Button
            onClick={handleSend}
            loading={loading}
            disabled={!message.trim()}
            icon={<Send size={16} />}
            className="w-full"
          >
            {sent ? 'تم الإرسال!' : 'إرسال الآن'}
          </Button>
        </div>
      </Card>

      <p className="text-xs text-surface-500 text-center">
        سيظهر هذا الإشعار فوراً في شريط التنبيهات على هاتف الطفل حتى لو كان التطبيق في الخلفية.
      </p>
    </div>
  );
}
