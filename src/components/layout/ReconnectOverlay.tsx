import { useAppStore } from '../../stores/useAppStore';

export function ReconnectOverlay() {
  const { isConnected, reconnecting, reconnectAttempt } = useAppStore();

  if (isConnected || !reconnecting) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          جاري إعادة الاتصال...
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          انقطع الاتصال بالسيرفر
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {reconnectAttempt === -1
            ? 'فشل الاتصال — يُعاد المحاولة...'
            : `محاولة الاتصال رقم ${reconnectAttempt}...`}
        </p>
      </div>
    </div>
  );
}
