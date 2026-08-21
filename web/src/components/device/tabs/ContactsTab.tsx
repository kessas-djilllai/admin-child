import { useQuery } from '@tanstack/react-query';
import { fetchContacts } from '../../../services/api';
import { Card } from '../../ui/Card';
import { Users, Search, Phone } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '../../ui/Skeleton';

interface Props { token: string }

export function ContactsTab({ token }: Props) {
  const { data, isLoading } = useQuery({ queryKey: ['contacts', token], queryFn: () => fetchContacts(token) });
  const [search, setSearch] = useState('');
  const filtered = (data || []).filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.number.includes(search));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Users size={20} className="text-primary-500" />
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">جهات الاتصال</h2>
      </div>

      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input placeholder="بحث بالاسم أو الرقم..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40" />
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><p className="text-center text-surface-500 py-8">لا توجد جهات اتصال</p></Card>
      ) : (
        <div className="space-y-1">
          {filtered.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">{c.name}</p>
                  <p className="text-xs text-surface-500 font-mono">{c.number}</p>
                </div>
              </div>
              <a href={`tel:${c.number}`} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                <Phone size={16} className="text-emerald-500" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
