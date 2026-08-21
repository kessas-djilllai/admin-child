import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/useAppStore';
import { CheckCircle, XCircle, Loader, X } from 'lucide-react';

export function CommandProgress() {
  const { commandProgress, setCommandProgress } = useAppStore();

  return (
    <AnimatePresence>
      {commandProgress && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4 min-w-[300px]"
        >
          <div className="shrink-0">
            {commandProgress.status === 'sending' && (
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
                <Loader size={20} className="text-amber-500 animate-spin" />
              </div>
            )}
            {commandProgress.status === 'sent' && (
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle size={20} className="text-emerald-500" />
              </div>
            )}
            {commandProgress.status === 'error' && (
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center">
                <XCircle size={20} className="text-rose-500" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{commandProgress.label}</p>
            <p className="text-xs text-surface-500">
              {commandProgress.status === 'sending' && 'جاري الإرسال...'}
              {commandProgress.status === 'sent' && 'تم الإرسال بنجاح'}
              {commandProgress.status === 'executing' && 'جاري التنفيذ...'}
              {commandProgress.status === 'done' && 'تم التنفيذ بنجاح'}
              {commandProgress.status === 'error' && commandProgress.error}
            </p>
          </div>
          <button
            onClick={() => setCommandProgress(null)}
            className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors shrink-0"
          >
            <X size={14} className="text-surface-400" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
