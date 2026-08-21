import { useDeviceData } from '../../../hooks/useDeviceData';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Shield, AlertTriangle, Clock, Smartphone } from 'lucide-react';
import type { SecurityAlert, SimCardInfo, Command } from '../../../types';

interface Props { token: string }

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'الآن';
  if (diff < 3600) return `${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} س`;
  return `${Math.floor(diff / 86400)} ي`;
}

export function DeviceHomeTab({ token }: Props) {
  const { alerts, simCards, commands } = useDeviceData(token);
  const recentAlerts: SecurityAlert[] = alerts.data?.slice(0, 5) || [];
  const recentCommands: Command[] = commands.data?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      {/* Quick Actions are already in parent */}

      {/* Security Alerts */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-primary-500" />
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white">تنبيهات الأمان</h3>
          </div>
          <Badge variant={recentAlerts.length > 0 ? 'danger' : 'success'}>
            {recentAlerts.length > 0 ? `${recentAlerts.length} تنبيه` : 'لا توجد تنبيهات'}
          </Badge>
        </div>
        {recentAlerts.length === 0 ? (
          <p className="text-sm text-surface-500 dark:text-surface-400 py-4 text-center">لا توجد تنبيهات أمان</p>
        ) : (
          <div className="space-y-2">
            {recentAlerts.map((a: SecurityAlert) => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10">
                <AlertTriangle size={16} className="text-rose-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 dark:text-white">{a.title}</p>
                  <p className="text-xs text-surface-500 truncate">{a.message}</p>
                </div>
                <span className="text-xs text-surface-400 shrink-0">{timeAgo(a.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Commands */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-primary-500" />
          <h3 className="text-sm font-semibold text-surface-900 dark:text-white">آخر الأوامر</h3>
        </div>
        {recentCommands.length === 0 ? (
          <p className="text-sm text-surface-500 py-4 text-center">لا توجد أوامر بعد</p>
        ) : (
          <div className="space-y-2">
            {recentCommands.map((c: Command) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <span className="text-sm text-surface-700 dark:text-surface-300">{c.command}</span>
                <Badge variant={c.status === 'executed' ? 'success' : c.status === 'failed' ? 'danger' : 'warning'}>
                  {c.status === 'executed' ? 'تم التنفيذ' : c.status === 'failed' ? 'فشل' : c.status === 'sent' ? 'تم الإرسال' : 'قيد الانتظار'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* SIM Cards */}
      {simCards.data && simCards.data.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Smartphone size={18} className="text-primary-500" />
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white">شرائح الهاتف</h3>
          </div>
          <div className="space-y-2">
            {simCards.data.map((sim: SimCardInfo) => (
              <div key={sim.slotIndex} className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-surface-900 dark:text-white">{sim.carrierName || 'غير معروف'}</span>
                  <Badge variant="info">شريحة {sim.slotIndex + 1}</Badge>
                </div>
                <p className="text-xs text-surface-500 font-mono">{sim.phoneNumber || 'غير متوفر'}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
