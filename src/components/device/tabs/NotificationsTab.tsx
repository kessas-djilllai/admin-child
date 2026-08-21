import { useQuery } from '@tanstack/react-query';
import { fetchSms, fetchSecurityAlerts } from '../../../services/api';
import { Card } from '../../ui/Card';
import { Bell, MessageSquare, Shield, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useState } from 'react';
import type { SmsLog, SecurityAlert } from '../../../types';

interface Props { token: string }

export function NotificationsTab({ token }: Props) {
  const [tab, setTab] = useState<'sms' | 'alerts'>('sms');
  const sms = useQuery<SmsLog[]>({ queryKey: ['sms', token], queryFn: () => fetchSms(token), refetchInterval: 15000 });
  const alerts = useQuery<SecurityAlert[]>({ queryKey: ['alerts', token], queryFn: () => fetchSecurityAlerts(token), refetchInterval: 15000 });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Bell size={20} className="text-primary-500" />
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">الإشعارات</h2>
      </div>

      <div className="flex gap-1 bg-surface-100 dark:bg-surface-900 p-1 rounded-xl">
        <button onClick={() => setTab('sms')} className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'sms' ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-sm' : 'text-surface-500'}`}>
          <MessageSquare size={14} className="inline ml-1.5" />SMS ({sms.data?.length || 0})
        </button>
        <button onClick={() => setTab('alerts')} className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'alerts' ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-sm' : 'text-surface-500'}`}>
          <Shield size={14} className="inline ml-1.5" />الأمان ({alerts.data?.length || 0})
        </button>
      </div>

      {tab === 'sms' ? (
        <div className="space-y-2">
          {(sms.data || []).map((s: SmsLog) => (
            <Card key={s.id} padding="sm">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${s.type === 'incoming' ? 'bg-emerald-100 dark:bg-emerald-500/10' : 'bg-sky-100 dark:bg-sky-500/10'}`}>
                  {s.type === 'incoming' ? <ArrowDownLeft size={14} className="text-emerald-600" /> : <ArrowUpRight size={14} className="text-sky-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-surface-900 dark:text-white">{s.sender}</span>
                    <span className="text-xs text-surface-400">{new Date(s.timestamp).toLocaleDateString('ar')}</span>
                  </div>
                  <p className="text-sm text-surface-600 dark:text-surface-400 mt-1 break-words">{s.body}</p>
                </div>
              </div>
            </Card>
          ))}
          {(!sms.data || sms.data.length === 0) && <Card><p className="text-center text-surface-500 py-8">لا توجد رسائل</p></Card>}
        </div>
      ) : (
        <div className="space-y-2">
          {(alerts.data || []).map((a: SecurityAlert) => (
            <Card key={a.id} padding="sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center shrink-0"><Shield size={14} className="text-rose-500" /></div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-surface-900 dark:text-white">{a.title}</span>
                  <p className="text-xs text-surface-500 mt-1">{a.message}</p>
                </div>
              </div>
            </Card>
          ))}
          {(!alerts.data || alerts.data.length === 0) && <Card><p className="text-center text-surface-500 py-8">لا توجد تنبيهات</p></Card>}
        </div>
      )}
    </div>
  );
}
