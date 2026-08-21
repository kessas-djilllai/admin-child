import { useQuery } from '@tanstack/react-query';
import { fetchInstalledApps, fetchAppUsage } from '../../../services/api';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { AppWindow, Search, Clock, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '../../ui/Skeleton';

interface Props { token: string }

function formatDuration(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h} س ${m} د`;
  return `${m} د`;
}

export function InstalledAppsTab({ token }: Props) {
  const [search, setSearch] = useState('');
  const [showUsage, setShowUsage] = useState(false);
  const { data: apps, isLoading } = useQuery({ queryKey: ['apps', token], queryFn: () => fetchInstalledApps(token) });
  const { data: usage } = useQuery({ queryKey: ['appUsage', token], queryFn: () => fetchAppUsage(token) });

  const filtered = (apps || []).filter((a) => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.packageName.toLowerCase().includes(search.toLowerCase()));
  const systemCount = (apps || []).filter((a) => a.isSystem).length;
  const userCount = (apps || []).length - systemCount;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AppWindow size={20} className="text-primary-500" />
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">التطبيقات</h2>
          <Badge variant="muted">{filtered.length}</Badge>
        </div>
        <button onClick={() => setShowUsage(!showUsage)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
          <BarChart3 size={14} />
          {showUsage ? 'قائمة التطبيقات' : 'إحصائيات الاستخدام'}
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40" />
      </div>

      <div className="flex gap-2 text-xs">
        <Badge variant="primary">المستخدم: {userCount}</Badge>
        <Badge variant="muted">النظام: {systemCount}</Badge>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : showUsage ? (
        <UsageList data={usage || []} />
      ) : (
        <div className="space-y-1">
          {filtered.map((app) => (
            <div key={app.packageName} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center shrink-0">
                  <AppWindow size={14} className="text-surface-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{app.name}</p>
                  <p className="text-xs text-surface-500 font-mono truncate">{app.packageName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {app.isSystem && <Badge variant="muted">نظام</Badge>}
                <span className="text-xs text-surface-400">{app.versionName}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UsageList({ data }: { data: { packageName: string; appName: string; totalTimeMs: number; launchCount: number; category: string }[] }) {
  const sorted = [...data].sort((a, b) => b.totalTimeMs - a.totalTimeMs).slice(0, 50);
  const maxTime = sorted[0]?.totalTimeMs || 1;

  return (
    <div className="space-y-2">
      {sorted.map((u) => (
        <Card key={u.packageName} padding="sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-surface-900 dark:text-white">{u.appName || u.packageName}</span>
            <div className="flex items-center gap-2">
              <Badge variant="muted">{u.launchCount} تشغيل</Badge>
              <span className="text-xs text-surface-500 flex items-center gap-1"><Clock size={12} />{formatDuration(u.totalTimeMs)}</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all" style={{ width: `${(u.totalTimeMs / maxTime) * 100}%` }} />
          </div>
        </Card>
      ))}
    </div>
  );
}
