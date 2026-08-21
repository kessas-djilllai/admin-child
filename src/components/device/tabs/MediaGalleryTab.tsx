import { useQuery } from '@tanstack/react-query';
import { fetchMediaFiles } from '../../../services/api';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Camera, Image, Video, Mic, Download, Trash2, Play, X } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '../../ui/Skeleton';
import type { MediaItem } from '../../../types';
import { Button } from '../../ui/Button';
import { Dialog } from '../../ui/Dialog';

interface Props { token: string }

type Tab = 'screenshots' | 'photos' | 'videos' | 'audio';

export function MediaGalleryTab({ token }: Props) {
  const [tab, setTab] = useState<Tab>('screenshots');
  const [preview, setPreview] = useState<MediaItem | null>(null);

  const screenshots = useQuery({ queryKey: ['media', token, 'screenshot'], queryFn: () => fetchMediaFiles(token, ['screenshot']) });
  const photos = useQuery({ queryKey: ['media', token, 'photo'], queryFn: () => fetchMediaFiles(token, ['photo']) });
  const videos = useQuery({ queryKey: ['media', token, 'video'], queryFn: () => fetchMediaFiles(token, ['video']) });
  const audio = useQuery({ queryKey: ['media', token, 'audio'], queryFn: () => fetchMediaFiles(token, ['audio']) });

  const queries = { screenshots, photos, videos, audio };
  const current = queries[tab];
  const items = current?.data || [];

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'screenshots', label: 'لقطات الشاشة', icon: <Image size={16} />, count: screenshots.data?.length || 0 },
    { key: 'photos', label: 'الصور', icon: <Camera size={16} />, count: photos.data?.length || 0 },
    { key: 'videos', label: 'الفيديوهات', icon: <Video size={16} />, count: videos.data?.length || 0 },
    { key: 'audio', label: 'الصوتيات', icon: <Mic size={16} />, count: audio.data?.length || 0 },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-surface-900 dark:text-white">معرض الوسائط</h2>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${tab === t.key ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25' : 'bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-400 border border-surface-200 dark:border-surface-700'}`}>
            {t.icon}{t.label}
            {t.count > 0 && <Badge variant={tab === t.key ? 'info' : 'muted'}>{t.count}</Badge>}
          </button>
        ))}
      </div>

      {current?.isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : items.length === 0 ? (
        <Card><p className="text-center text-surface-500 py-12">لا توجد وسائط</p></Card>
      ) : tab === 'audio' ? (
        <div className="space-y-2">{items.map((m) => <AudioCard key={m.id} item={m} />)}</div>
      ) : tab === 'videos' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{items.map((m) => <VideoCard key={m.id} item={m} onPreview={setPreview} />)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">{items.map((m) => <ImageCard key={m.id} item={m} onPreview={setPreview} />)}</div>
      )}

      <Dialog open={!!preview} onClose={() => setPreview(null)} maxWidth="lg">
        {preview && (
          <div className="space-y-3">
            {preview.url && (preview.type === 'screenshot' || preview.type === 'photo') && (
              <img src={preview.url} alt="" className="w-full rounded-xl" />
            )}
            {preview.url && preview.type === 'video' && (
              <video src={preview.url} controls className="w-full rounded-xl" />
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-surface-500">{new Date(preview.timestamp).toLocaleString('ar')}</span>
              <a href={preview.url} download className="text-primary-500 text-sm flex items-center gap-1"><Download size={14} />تحميل</a>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function ImageCard({ item, onPreview }: { item: MediaItem; onPreview: (m: MediaItem) => void }) {
  return (
    <button onClick={() => onPreview(item)} className="group relative rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800 aspect-square">
      {item.url ? (
        <img src={item.url} alt="" className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center"><Image size={24} className="text-surface-400" /></div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-2">
        <span className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">{new Date(item.timestamp).toLocaleDateString('ar')}</span>
      </div>
    </button>
  );
}

function VideoCard({ item, onPreview }: { item: MediaItem; onPreview: (m: MediaItem) => void }) {
  return (
    <button onClick={() => onPreview(item)} className="group relative rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800 aspect-video">
      {item.url ? (
        <video src={item.url} className="w-full h-full object-cover" preload="metadata" />
      ) : (
        <div className="w-full h-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center"><Video size={24} className="text-surface-400" /></div>
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-primary-600 transition-colors"><Play size={20} className="text-white mr-0.5" /></div>
      </div>
    </button>
  );
}

function AudioCard({ item }: { item: MediaItem }) {
  const [playing, setPlaying] = useState(false);
  return (
    <Card padding="sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center"><Mic size={18} className="text-white" /></div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{item.type}</p>
          <p className="text-xs text-surface-500">{new Date(item.timestamp).toLocaleString('ar')}</p>
        </div>
        {item.url && <audio src={item.url} controls className="h-8 max-w-[200px]" />}
      </div>
    </Card>
  );
}
