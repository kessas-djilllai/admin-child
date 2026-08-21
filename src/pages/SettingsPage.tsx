import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Server, Key, Cloud, Save, CheckCircle, Shield, Database, Code, Globe, Trash2, Link, Check, Copy, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAppStore } from '../stores/useAppStore';
import { testConnection, configureApi, fetchKeysFromVercel, fetchServerUrlFromDb } from '../services/api';
import { disconnectSocket, connectSocket } from '../services/socket';

export function SettingsPage() {
  const { settings, updateSettings } = useAppStore();
  const [serverUrl, setServerUrl] = useState(settings.serverUrl);
  const [supabaseKey, setSupabaseKey] = useState(settings.supabaseKey);
  const [cloudName, setCloudName] = useState(settings.cloudinaryName);
  const [cloudKey, setCloudKey] = useState(settings.cloudinaryApiKey);
  const [cloudSecret, setCloudSecret] = useState(settings.cloudinaryApiSecret);
  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const [copied, setCopied] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [reconnectStatus, setReconnectStatus] = useState<'idle' | 'fetching-keys' | 'fetching-url' | 'connecting' | 'success' | 'error'>('idle');
  const [reconnectError, setReconnectError] = useState('');
  const { isConnected } = useAppStore();

  const handleReconnect = async () => {
    setReconnecting(true);
    setReconnectError('');
    try {
      setReconnectStatus('fetching-keys');
      const keys = await fetchKeysFromVercel();
      if (!keys?.supabase_url || !keys?.supabase_key) throw new Error('فشل جلب المفاتيح من الخادم');

      setReconnectStatus('fetching-url');
      const newServerUrl = await fetchServerUrlFromDb(keys.supabase_url, keys.supabase_key);
      if (!newServerUrl) throw new Error('لم يتم العثور على رابط الخادم في قاعدة البيانات');

      setReconnectStatus('connecting');
      updateSettings({
        serverUrl: newServerUrl,
        supabaseKey: keys.supabase_key,
        cloudinaryName: keys.cloudinary_cloud_name || '',
        cloudinaryApiKey: keys.cloudinary_api_key || '',
        cloudinaryApiSecret: keys.cloudinary_secret_key || '',
      });
      configureApi(newServerUrl, keys.supabase_key);
      setServerUrl(newServerUrl);
      setSupabaseKey(keys.supabase_key);
      setCloudName(keys.cloudinary_cloud_name || '');
      setCloudKey(keys.cloudinary_api_key || '');
      setCloudSecret(keys.cloudinary_secret_key || '');

      disconnectSocket();
      connectSocket(newServerUrl);

      setReconnectStatus('success');
      setTimeout(() => setReconnectStatus('idle'), 3000);
    } catch (e) {
      setReconnectStatus('error');
      setReconnectError(e instanceof Error ? e.message : 'خطأ غير معروف');
      setTimeout(() => setReconnectStatus('idle'), 5000);
    }
    setReconnecting(false);
  };

  const handleSave = () => {
    updateSettings({ serverUrl, supabaseKey, cloudinaryName: cloudName, cloudinaryApiKey: cloudKey, cloudinaryApiSecret: cloudSecret });
    configureApi(serverUrl, supabaseKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    setTestStatus('testing');
    configureApi(serverUrl, supabaseKey);
    const ok = await testConnection();
    setTestStatus(ok ? 'ok' : 'fail');
    setTimeout(() => setTestStatus('idle'), 3000);
  };

  const sections = [
    {
      icon: <Server size={18} />, color: 'from-primary-500 to-primary-600',
      title: 'إعدادات السيرفر', desc: 'رابط السيرفر ومفتاح Supabase',
      content: (
        <div className="space-y-4">
          <Input label="رابط السيرفر" placeholder="https://your-server.com" value={serverUrl} onChange={(e) => setServerUrl(e.target.value)} icon={<Server size={16} />} dir="ltr" />
          <Input label="Supabase Key" placeholder="eyJhbGciOiJIUzI1NiIs..." value={supabaseKey} onChange={(e) => setSupabaseKey(e.target.value)} icon={<Key size={16} />} dir="ltr" />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleTest} loading={testStatus === 'testing'}>
              {testStatus === 'ok' ? '✓ متصل' : testStatus === 'fail' ? '✗ فشل' : 'اختبار الاتصال'}
            </Button>
            {testStatus === 'ok' && <Badge variant="success">الاتصال ناجح</Badge>}
            {testStatus === 'fail' && <Badge variant="danger">الاتصال فاشل</Badge>}
          </div>
        </div>
      ),
    },
    {
      icon: <Cloud size={18} />, color: 'from-sky-500 to-sky-600',
      title: 'Cloudinary', desc: 'إعدادات التخزين السحابي',
      content: (
        <div className="space-y-4">
          <Input label="Cloud Name" placeholder="your-cloud-name" value={cloudName} onChange={(e) => setCloudName(e.target.value)} dir="ltr" />
          <Input label="API Key" placeholder="123456789" value={cloudKey} onChange={(e) => setCloudKey(e.target.value)} dir="ltr" />
          <Input label="API Secret" placeholder="your-api-secret" value={cloudSecret} onChange={(e) => setCloudSecret(e.target.value)} dir="ltr" />
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Current Connection Info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-2 border-primary-100 dark:border-primary-900/50">
            <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white">
              <Link size={18} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-surface-900 dark:text-white">الخادم المتصل حالياً</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className="text-xs text-surface-500">{isConnected ? 'متصل' : 'غير متصل'}</span>
              </div>
            </div>
            <Button size="sm" variant="outline" icon={<RefreshCw size={14} />} onClick={handleReconnect} loading={reconnecting}>
              إعادة اتصال
            </Button>
          </div>

          {reconnectStatus !== 'idle' && reconnectStatus !== 'success' && reconnectStatus !== 'error' && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300">
              <RefreshCw size={14} className="animate-spin shrink-0" />
              <span className="text-xs font-medium">
                {reconnectStatus === 'fetching-keys' && 'جاري جلب المفاتيح من الخادم...'}
                {reconnectStatus === 'fetching-url' && 'جاري جلب رابط الخادم من قاعدة البيانات...'}
                {reconnectStatus === 'connecting' && 'جاري الاتصال بالخادم الجديد...'}
              </span>
            </div>
          )}

          {reconnectStatus === 'success' && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <CheckCircle size={14} className="shrink-0" />
              <span className="text-xs font-medium">تم الاتصال بنجاح بالخادم الجديد</span>
            </div>
          )}

          {reconnectStatus === 'error' && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300">
              <AlertTriangle size={14} className="shrink-0" />
              <span className="text-xs font-medium">{reconnectError || 'فشل الاتصال'}</span>
            </div>
          )}

          <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-surface-400 mb-1">رابط السيرفر (من قاعدة البيانات)</p>
                <p className="text-sm font-mono text-primary-600 dark:text-primary-400 truncate" dir="ltr">{settings.serverUrl || 'غير محدد'}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="info" className="text-[10px]">
                  <Database size={10} className="mr-1" />
                  Supabase
                </Badge>
                {settings.serverUrl && (
                  <button
                    onClick={() => { navigator.clipboard.writeText(settings.serverUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                    className="shrink-0 p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                    title="نسخ الرابط"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-surface-400" />}
                  </button>
                )}
              </div>
            </div>
            <div className="h-px bg-surface-100 dark:bg-surface-700" />
            <div>
              <p className="text-[11px] text-surface-400 mb-1">Supabase Key</p>
              <p className="text-xs font-mono text-surface-600 dark:text-surface-400 truncate" dir="ltr">
                {settings.supabaseKey ? settings.supabaseKey.substring(0, 40) + '...' : 'غير محدد'}
              </p>
            </div>
            {settings.cloudinaryName && (
              <>
                <div className="h-px bg-surface-100 dark:bg-surface-700" />
                <div>
                  <p className="text-[11px] text-surface-400 mb-1">Cloudinary Cloud</p>
                  <p className="text-xs font-mono text-surface-600 dark:text-surface-400" dir="ltr">{settings.cloudinaryName}</p>
                </div>
              </>
            )}
          </div>
        </Card>
      </motion.div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">الإعدادات</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">إعدادات الاتصال والتخزين</p>
        </div>
      </div>

      {sections.map((section, i) => (
        <motion.div key={section.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center text-white`}>{section.icon}</div>
              <div>
                <h3 className="text-sm font-semibold text-surface-900 dark:text-white">{section.title}</h3>
                <p className="text-xs text-surface-500">{section.desc}</p>
              </div>
            </div>
            {section.content}
          </Card>
        </motion.div>
      ))}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Button size="lg" icon={saved ? <CheckCircle size={18} /> : <Save size={18} />} onClick={handleSave} variant={saved ? 'secondary' : 'primary'} className="w-full">
          {saved ? 'تم الحفظ!' : 'حفظ الإعدادات'}
        </Button>
      </motion.div>

      {/* About */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <div className="text-center py-4">
            <Shield size={24} className="mx-auto mb-2 text-primary-500" />
            <p className="text-sm font-semibold text-surface-900 dark:text-white">Supervisor Control</p>
            <p className="text-xs text-surface-500">لوحة التحكم في الأجهزة — نسخة الويب v1.0</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
