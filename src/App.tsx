import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ConnectionGuard } from './components/layout/ConnectionGuard';
import { CommandProgress } from './components/commands/CommandProgress';
import { ConnectionSetupPage } from './pages/ConnectionSetupPage';
import { DevicesPage } from './pages/DevicesPage';
import { DeviceDetailPage } from './pages/DeviceDetailPage';
import { SettingsPage } from './pages/SettingsPage';
import { useConnection } from './hooks/useConnection';
import { useAppStore } from './stores/useAppStore';
import { fetchKeysFromVercel, fetchServerUrlFromDb, configureApi } from './services/api';
import { useEffect, useState } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  useConnection();
  const { settings } = useAppStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/setup" element={<ConnectionSetupPage />} />
        <Route
          path="/*"
          element={
            <ConnectionGuard>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<DevicesPage />} />
                  <Route path="/devices" element={<DevicesPage />} />
                  <Route path="/device/:token" element={<DeviceDetailPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </DashboardLayout>
            </ConnectionGuard>
          }
        />
      </Routes>
      <CommandProgress />
    </BrowserRouter>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-950 dark:to-surface-900 flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/20 animate-pulse">
        <span className="text-2xl">🔌</span>
      </div>
      <p className="text-sm text-surface-500 dark:text-surface-400">جاري الاتصال بقاعدة البيانات...</p>
    </div>
  );
}

export default function App() {
  const { theme, settings, updateSettings } = useAppStore();
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const doBoot = async () => {
      if (settings.serverUrl && settings.supabaseKey) {
        setBooting(false);
        return;
      }
      try {
        const keys = await fetchKeysFromVercel();
        if (keys?.supabase_url && keys?.supabase_key) {
          const dbServerUrl = await fetchServerUrlFromDb(keys.supabase_url, keys.supabase_key);
          const finalServerUrl = dbServerUrl || keys.supabase_url;
          updateSettings({
            serverUrl: finalServerUrl,
            supabaseKey: keys.supabase_key,
            cloudinaryName: keys.cloudinary_cloud_name || '',
            cloudinaryApiKey: keys.cloudinary_api_key || '',
            cloudinaryApiSecret: keys.cloudinary_secret_key || '',
          });
          configureApi(finalServerUrl, keys.supabase_key);
        }
      } catch {
        /* fallback to manual setup */
      }
      setBooting(false);
    };
    doBoot();
  }, []);

  if (booting) {
    return (
      <QueryClientProvider client={queryClient}>
        <LoadingScreen />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
