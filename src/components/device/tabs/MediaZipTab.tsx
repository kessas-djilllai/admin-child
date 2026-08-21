import { useQuery } from '@tanstack/react-query';
import { fetchMediaFiles } from '../../../services/api';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Archive, Image, Film, Download, Package } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../ui/Button';

interface Props { token: string }

export function MediaZipTab({ token }: Props) {
  const [tab, setTab] = useState<'photo' | 'video'>('photo');
  const photos = useQuery({ queryKey: ['media', token, 'photo'], queryFn: () => fetchMediaFiles(token, ['photo']) });
  const videos = useQuery({ queryKey: ['media', token, 'video'], queryFn: () => fetchMediaFiles(token, ['video']) });

  const data = tab === 'photo' ? photos.data || [] : videos.data || [];
  const totalSize = data.reduce((acc, m) => acc + (m.base64?.length || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Archive size={20} className="text-primary-500" />
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">حزم الوسائط</h2>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('photo')} className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${tab === 'photo' ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-400' : 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800'}`}>
          <Image size={20} />
          <span className="font-medium">صور</span>
          <Badge variant="muted">{photos.data?.length || 0}</Badge>
        </button>
        <button onClick={() => setTab('video')} className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${tab === 'video' ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-400' : 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800'}`}>
          <Film size={20} />
          <span className="font-medium">فيديوهات</span>
          <Badge variant="muted">{videos.data?.length || 0}</Badge>
        </button>
      </div>

      <Card>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <Package size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-surface-900 dark:text-white">{data.length} {tab === 'photo' ? 'صورة' : 'فيديو'}</p>
            <p className="text-xs text-surface-500">حجم الحزمة: {Math.round(totalSize / 1024 / 1024)} MB</p>
          </div>
          <Button size="sm" icon={<Download size={14} />} disabled={data.length === 0}>
            تحميل الحزمة
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.slice(0, 12).map((m) => (
          <div key={m.id} className="aspect-square rounded-xl overflow-hidden border border-surface-200 dark:border-surface-800">
            {m.url ? (
              <img src={m.url} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                {tab === 'photo' ? <Image size={20} className="text-surface-400" /> : <Film size={20} className="text-surface-400" />}
              </div>
            )}
          </div>
        ))}
      </div>
      {data.length > 12 && <p className="text-center text-sm text-surface-500">و {data.length - 12} أخرى...</p>}
    </div>
  );
}
