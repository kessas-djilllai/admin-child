import { useAppStore } from '../../stores/useAppStore';
import { RefreshCw } from 'lucide-react';

export function ReconnectOverlay() {
  const { isConnected, reconnecting, reconnectAttempt } = useAppStore();

  if (isConnected || !reconnecting) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white px-4 py-2.5 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <RefreshCw size={16} className="animate-spin shrink-0" />
        <span className="text-sm font-medium">
          {reconnectAttempt === -1
            ? 'فشل الاتصال — يُعاد المحاولة...'
            : `جاري إعادة الاتصال... (محاولة ${reconnectAttempt})`}
        </span>
      </div>
    </div>
  );
}
