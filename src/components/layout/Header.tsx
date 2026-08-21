import { Search, Bell } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAppStore } from '../../stores/useAppStore';

export function Header() {
  const { searchQuery, setSearchQuery, isConnected } = useAppStore();

  return (
    <header className="h-14 lg:h-16 bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl border-b border-surface-100 dark:border-surface-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3 flex-1 lg:pl-0 pl-12">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="بحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className={`hidden sm:block px-3 py-1 rounded-full text-xs font-medium ${
          isConnected
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
            : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
        }`}>
          {isConnected ? '● متصل' : '● غير متصل'}
        </div>
        <button className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors relative">
          <Bell size={18} className="text-surface-600 dark:text-surface-400" />
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
