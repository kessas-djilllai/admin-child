import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { Command } from '../../types';
import { Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { COMMANDS } from '../../types';

interface CommandHistoryProps {
  commands: Command[];
}

function getCommandLabel(key: string) {
  return COMMANDS.find((c) => c.key === key)?.label || key;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'executed': return <Badge variant="success">تم التنفيذ</Badge>;
    case 'sent': return <Badge variant="info">تم الإرسال</Badge>;
    case 'pending': return <Badge variant="warning">قيد الانتظار</Badge>;
    case 'failed': return <Badge variant="danger">فشل</Badge>;
    default: return <Badge variant="muted">{status}</Badge>;
  }
}

function timeAgo(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'الآن';
  if (diff < 3600) return `${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ساعة`;
  return `${Math.floor(diff / 86400)} يوم`;
}

export function CommandHistory({ commands }: CommandHistoryProps) {
  if (commands.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock size={32} className="mx-auto mb-3 text-surface-300 dark:text-surface-600" />
        <p className="text-sm text-surface-500 dark:text-surface-400">لا توجد أوامر بعد</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {commands.map((cmd) => (
        <Card key={cmd.id} padding="sm" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
              {cmd.status === 'executed' ? (
                <CheckCircle size={18} className="text-emerald-500" />
              ) : cmd.status === 'failed' ? (
                <XCircle size={18} className="text-rose-500" />
              ) : cmd.status === 'pending' ? (
                <Loader size={18} className="text-amber-500 animate-spin" />
              ) : (
                <Clock size={18} className="text-surface-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-surface-900 dark:text-white">{getCommandLabel(cmd.command)}</p>
              <p className="text-xs text-surface-500">{timeAgo(cmd.created_at)}</p>
            </div>
          </div>
          {getStatusBadge(cmd.status)}
        </Card>
      ))}
    </div>
  );
}
