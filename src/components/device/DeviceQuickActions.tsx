import { Lock, Unlock, Flashlight, FlashlightOff, Power, PowerOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { CommandProgressBadge, CommandProgressLabel, ErrorToast, SuccessToast, useCommandProgress } from '../commands/CommandProgressToast';

interface DeviceQuickActionsProps {
  deviceToken: string;
  deviceLocked: boolean;
}

const actions = [
  { command: 'power_on', label: 'تشغيل الشاشة', icon: Power, color: 'from-emerald-500 to-emerald-600' },
  { command: 'power_off', label: 'إطفاء الشاشة', icon: PowerOff, color: 'from-slate-600 to-slate-700' },
  { command: 'flash_on', label: 'تشغيل الفلاش', icon: Flashlight, color: 'from-yellow-400 to-yellow-500' },
  { command: 'flash_off', label: 'إيقاف الفلاش', icon: FlashlightOff, color: 'from-slate-500 to-slate-600' },
];

export function DeviceQuickActions({ deviceToken, deviceLocked }: DeviceQuickActionsProps) {
  const { progress, errorMessage, successMessage, send, dismissError, dismissSuccess } = useCommandProgress();
  const [loadingCmd, setLoadingCmd] = useState<string | null>(null);

  const handleCommand = async (command: string, label: string) => {
    setLoadingCmd(command);
    try {
      await send(deviceToken, command, label);
    } finally {
      setLoadingCmd(null);
    }
  };

  const handleLock = async () => {
    const cmd = deviceLocked ? 'unlock_device' : 'lock_device';
    const label = deviceLocked ? 'إلغاء القفل' : 'قفل الهاتف';
    await handleCommand(cmd, label);
  };

  const lockProgress = progress && (progress.command === 'lock_device' || progress.command === 'unlock_device');

  return (
    <div className="space-y-4">
      {errorMessage && <ErrorToast message={errorMessage} onDismiss={dismissError} />}
      {successMessage && <SuccessToast message={successMessage} onDismiss={dismissSuccess} />}

      {/* Lock/Unlock Button */}
      <motion.button
        whileHover={lockProgress ? {} : { scale: 1.02 }}
        whileTap={lockProgress ? {} : { scale: 0.98 }}
        onClick={lockProgress ? undefined : handleLock}
        className={`relative w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium text-white transition-all ${
          deviceLocked
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25'
            : 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-lg shadow-rose-500/25'
        }`}
      >
        {lockProgress && <CommandProgressBadge progress={progress!} commandKey={progress!.command} />}
        <span>
          {deviceLocked ? <Unlock size={20} /> : <Lock size={20} />}
        </span>
        <span>
          {deviceLocked ? 'إلغاء القفل' : 'قفل الهاتف'}
        </span>
        {lockProgress && <CommandProgressLabel progress={progress!} commandKey={progress!.command} />}
      </motion.button>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const isActive = progress && progress.command === action.command;

          return (
            <motion.button
              key={action.command}
              whileHover={isActive ? {} : { scale: 1.05, y: -2 }}
              whileTap={isActive ? {} : { scale: 0.95 }}
              onClick={() => {
                if (!isActive) handleCommand(action.command, action.label);
              }}
              disabled={loadingCmd === action.command}
              className="relative flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 hover:border-primary-300 dark:hover:border-primary-700 transition-all group"
            >
              {isActive && <CommandProgressBadge progress={progress!} commandKey={action.command} />}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
                <action.icon size={22} />
              </div>
              <span className="text-xs font-medium text-surface-700 dark:text-surface-300 text-center">{action.label}</span>
              {isActive && <CommandProgressLabel progress={progress!} commandKey={action.command} />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
