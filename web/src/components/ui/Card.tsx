import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddings = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({ children, className = '', hover = false, padding = 'md', onClick }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 8px 25px -5px rgb(0 0 0 / 0.1)' } : undefined}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 ${paddings[padding]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
