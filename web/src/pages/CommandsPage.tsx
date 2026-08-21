import { Terminal } from 'lucide-react';
import { CommandGrid } from '../components/commands/CommandGrid';
import { useAppStore } from '../stores/useAppStore';

export function CommandsPage() {
  const { selectedDevice } = useAppStore();

  if (!selectedDevice) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
          <Terminal size={28} className="text-surface-400" />
        </div>
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">اختر جهازاً أولاً</h2>
        <p className="text-sm text-surface-500">قم باختيار جهاز من صفحة الأجهزة لإرسال الأوامر</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">الأوامر</h1>
        <p className="text-sm text-surface-500 mt-1">جهاز: {selectedDevice.name}</p>
      </div>
      <CommandGrid deviceToken={selectedDevice.token} />
    </div>
  );
}
