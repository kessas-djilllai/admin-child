import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Server, Key, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAppStore } from '../stores/useAppStore';
import { testConnection, configureApi } from '../services/api';

export function ConnectionSetupPage() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useAppStore();
  const [serverUrl, setServerUrl] = useState(settings.serverUrl);
  const [supabaseKey, setSupabaseKey] = useState(settings.supabaseKey);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleConnect = async () => {
    if (!serverUrl.trim()) return;
    setLoading(true);
    setStatus('idle');

    try {
      configureApi(serverUrl, supabaseKey);
      const ok = await testConnection();
      if (ok) {
        setStatus('success');
        updateSettings({ serverUrl, supabaseKey });
        setTimeout(() => navigate('/'), 1000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50/30 to-surface-50 dark:from-surface-950 dark:via-primary-950/20 dark:to-surface-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-2xl shadow-primary-500/30"
          >
            <Shield size={40} className="text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Supervisor Control</h1>
          <p className="text-surface-500 dark:text-surface-400">لوحة التحكم في الأجهزة</p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-xl p-8">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">الاتصال بالسيرفر</h2>

          <div className="space-y-4">
            <Input
              label="رابط السيرفر"
              placeholder="https://your-server.com"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              icon={<Server size={16} />}
              dir="ltr"
            />

            <Input
              label="Supabase Key (اختياري)"
              placeholder="eyJhbGciOiJIUzI1NiIs..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              icon={<Key size={16} />}
              dir="ltr"
            />
          </div>

          {/* Status */}
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20"
            >
              <CheckCircle size={16} className="text-emerald-500" />
              <span className="text-sm text-emerald-700 dark:text-emerald-400">تم الاتصال بنجاح!</span>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20"
            >
              <AlertCircle size={16} className="text-rose-500" />
              <span className="text-sm text-rose-700 dark:text-rose-400">فشل الاتصال. تأكد من صحة الرابط.</span>
            </motion.div>
          )}

          <Button
            className="w-full mt-6"
            size="lg"
            onClick={handleConnect}
            loading={loading}
            icon={<ArrowLeft size={18} />}
          >
            اتصال ودخول
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
