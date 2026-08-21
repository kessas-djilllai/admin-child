import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSecurityAlerts, deleteSecurityAlerts } from '../../../services/api';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Shield, AlertTriangle, Trash2 } from 'lucide-react';
import { Skeleton } from '../../ui/Skeleton';

interface Props { token: string }

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'الآن';
  if (diff < 3600) return `${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} س`;
  return `${Math.floor(diff / 86400)} ي`;
}

export function SecurityAlertsTab({ token }: Props) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['alerts', token], queryFn: () => fetchSecurityAlerts(token), refetchInterval: 15000 });
  const clearMutation = useMutation({
    mutationFn: () => deleteSecurityAlerts(token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts', token] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={20} className="text-primary-500" />
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">تنبيهات الأمان</h2>
          <Badge variant={data && data.length > 0 ? 'danger' : 'success'}>{data?.length || 0}</Badge>
        </div>
        {data && data.length > 0 && (
          <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => clearMutation.mutate()} loading={clearMutation.isPending}>
            مسح الكل
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : !data || data.length === 0 ? (
        <Card><div className="text-center py-12"><Shield size={32} className="mx-auto mb-3 text-surface-300" /><p className="text-surface-500 text-sm">لا توجد تنبيهات أمان</p></div></Card>
      ) : (
        <div className="space-y-2">
          {data.map((alert) => (
            <Card key={alert.id} padding="sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle size={14} className="text-rose-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-surface-900 dark:text-white">{alert.title}</span>
                    <span className="text-xs text-surface-400">{timeAgo(alert.timestamp)}</span>
                  </div>
                  <p className="text-xs text-surface-500 mt-1">{alert.message}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
