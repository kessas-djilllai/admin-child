interface BadgeProps {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'muted';
  children: React.ReactNode;
  pulse?: boolean;
  className?: string;
}

const badgeStyles = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  info: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20',
  primary: 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-500/10 dark:text-primary-400 dark:border-primary-500/20',
  muted: 'bg-surface-100 text-surface-600 border-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:border-surface-700',
};

export function Badge({ variant = 'muted', children, pulse, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border ${badgeStyles[variant]} ${className}`}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            variant === 'success' ? 'bg-emerald-400' :
            variant === 'danger' ? 'bg-rose-400' :
            variant === 'warning' ? 'bg-amber-400' :
            variant === 'info' ? 'bg-sky-400' :
            variant === 'primary' ? 'bg-primary-400' :
            'bg-surface-400'
          }`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            variant === 'success' ? 'bg-emerald-500' :
            variant === 'danger' ? 'bg-rose-500' :
            variant === 'warning' ? 'bg-amber-500' :
            variant === 'info' ? 'bg-sky-500' :
            variant === 'primary' ? 'bg-primary-500' :
            'bg-surface-500'
          }`} />
        </span>
      )}
      {children}
    </span>
  );
}
