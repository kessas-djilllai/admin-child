import { motion } from 'framer-motion';
import { Camera, CameraIcon, Video, Mic, Lock, Unlock, Flashlight, FlashlightOff, Send, Radio, Monitor, MonitorOff, VideoOff, Users, MessageSquare, MapPin, AppWindow, Mail, Bell, FolderOpen, Image, Archive, Film, Volume2, VolumeX, Volume1, MousePointer, Music, Terminal, CreditCard } from 'lucide-react';
import type { CommandDef } from '../../types';
import type { ComponentType } from 'react';

const iconMap: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  Camera, CameraIcon, Video, Mic, Lock, Unlock, Flashlight, FlashlightOff, Send, Radio, Monitor, MonitorOff, VideoOff, Users, MessageSquare, MapPin, AppWindow, Mail, Bell, FolderOpen, Image, Archive, Film, Volume2, VolumeX, Volume1, MousePointer, Music, Terminal, SimCard: CreditCard,
};

interface CommandButtonProps {
  command: CommandDef;
  onClick: () => void;
  loading?: boolean;
}

export function CommandButton({ command, onClick, loading }: CommandButtonProps) {
  const IconComponent = iconMap[command.icon] || Terminal;

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={loading}
      className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all ${
        command.danger
          ? 'bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20 hover:border-rose-300 dark:hover:border-rose-500/40'
          : 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 hover:border-primary-300 dark:hover:border-primary-700'
      }`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${
        command.danger
          ? 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/25'
          : 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-primary-500/25'
      }`}>
        {loading ? (
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <IconComponent size={26} />
        )}
      </div>
      <span className="text-sm font-medium text-surface-700 dark:text-surface-300 text-center">
        {command.label}
      </span>
    </motion.button>
  );
}
