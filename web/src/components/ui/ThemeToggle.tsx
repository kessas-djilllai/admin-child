import { Sun, Moon } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
      title={theme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح'}
    >
      {theme === 'light' ? (
        <Moon size={18} className="text-surface-600" />
      ) : (
        <Sun size={18} className="text-surface-400" />
      )}
    </button>
  );
}
