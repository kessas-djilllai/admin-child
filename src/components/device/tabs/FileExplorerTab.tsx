import { useQuery } from '@tanstack/react-query';
import { fetchFiles } from '../../../services/api';
import { Card } from '../../ui/Card';
import { FolderOpen, File, ArrowLeft, Folder, Search } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '../../ui/Skeleton';
import type { FileItem } from '../../../types';

interface Props { token: string }

function formatSize(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function FileExplorerTab({ token }: Props) {
  const { data, isLoading } = useQuery({ queryKey: ['files', token], queryFn: () => fetchFiles(token) });
  const [currentPath, setCurrentPath] = useState('/');
  const [search, setSearch] = useState('');

  const items = (data || []).filter((f) => {
    const parentMatch = f.path.replace(/\/[^/]+\/?$/, '') === currentPath || (currentPath === '/' && !f.path.includes('/', 1));
    const searchMatch = !search || f.name.toLowerCase().includes(search.toLowerCase());
    return parentMatch && searchMatch;
  });

  const dirs = items.filter((i) => i.isDir);
  const files = items.filter((i) => !i.isDir);

  const navigateUp = () => {
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    setCurrentPath('/' + parts.join('/'));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <FolderOpen size={20} className="text-primary-500" />
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">استكشف الملفات</h2>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-surface-500 bg-surface-50 dark:bg-surface-800/50 p-2 rounded-xl">
        {currentPath !== '/' && (
          <button onClick={navigateUp} className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
            <ArrowLeft size={14} />
          </button>
        )}
        <span className="font-mono text-xs truncate">{currentPath}</span>
      </div>

      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40" />
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : items.length === 0 ? (
        <Card><p className="text-center text-surface-500 py-8">المجلد فارغ</p></Card>
      ) : (
        <div className="space-y-1">
          {dirs.map((d) => (
            <button key={d.path} onClick={() => setCurrentPath(d.path)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors text-right">
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center"><Folder size={18} className="text-amber-500" /></div>
              <span className="text-sm font-medium text-surface-900 dark:text-white">{d.name}</span>
            </button>
          ))}
          {files.map((f) => (
            <div key={f.path} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center"><File size={18} className="text-surface-400" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{f.name}</p>
                <p className="text-xs text-surface-500">{formatSize(f.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
