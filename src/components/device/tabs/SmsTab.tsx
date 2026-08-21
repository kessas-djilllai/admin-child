import { useQuery } from '@tanstack/react-query';
import { fetchSms } from '../../../services/api';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { MessageSquare, ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '../../ui/Skeleton';

interface Props { token: string }

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'الآن';
  if (diff < 3600) return `${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} س`;
  return `${Math.floor(diff / 86400)} ي`;
}

export function SmsTab({ token }: Props) {
  const { data, isLoading } = useQuery({ queryKey: ['sms', token], queryFn: () => fetchSms(token), refetchInterval: 15000 });
  const [search, setSearch] = useState('');

  const filtered = (data || []).filter((s) =>
    !search || s.sender.includes(search) || s.body.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <MessageSquare size={20} className="text-primary-500" />
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">رسائل SMS</h2>
        <Badge variant="muted">{filtered.length} رسالة</Badge>
      </div>

      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          placeholder="بحث في الرسائل..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><p className="text-center text-surface-500 py-8">لا توجد رسائل</p></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((sms) => (
            <Card key={sms.id} padding="sm">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${sms.type === 'incoming' ? 'bg-emerald-100 dark:bg-emerald-500/10' : 'bg-sky-100 dark:bg-sky-500/10'}`}>
                  {sms.type === 'incoming' ? <ArrowDownLeft size={14} className="text-emerald-600" /> : <ArrowUpRight size={14} className="text-sky-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-surface-900 dark:text-white">{sms.sender}</span>
                    <span className="text-xs text-surface-400">{timeAgo(sms.timestamp)}</span>
                  </div>
                  <p className="text-sm text-surface-600 dark:text-surface-400 mt-1 break-words">{sms.body}</p>
                  <Badge variant={sms.type === 'incoming' ? 'success' : 'info'} className="mt-2">
                    {sms.type === 'incoming' ? 'واردة' : 'صادرة'}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
