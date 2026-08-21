import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMediaFiles, deleteMediaFile } from '../../../services/api';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Camera, Image, Video, Mic, Download, Trash2, Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Skeleton } from '../../ui/Skeleton';
import type { MediaItem } from '../../../types';

interface Props { token: string }

type Tab = 'screenshots' | 'photos' | 'videos' | 'audio';

export function MediaGalleryTab({ token }: Props) {
  const [tab, setTab] = useState<Tab>('screenshots');
  const [preview, setPreview] = useState<{ item: MediaItem; index: number } | null>(null);
  const queryClient = useQueryClient();

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

  const invalidateMedia = () => {
    queryClient.invalidateQueries({ queryKey: ['media', token] });
  };

  const goNext = useCallback(() => {
    if (!preview) return;
    const next = preview.index + 1;
    if (next < items.length) setPreview({ item: items[next], index: next });
    else setPreview(null);
  }, [preview, items]);

  const goPrev = useCallback(() => {
    if (!preview) return;
    const prev = preview.index - 1;
    if (prev >= 0) setPreview({ item: items[prev], index: prev });
    else setPreview(null);
  }, [preview, items]);

  useEffect(() => {
    if (!preview) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goNext();
      if (e.key === 'ArrowRight') goPrev();
      if (e.key === 'Escape') setPreview(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [preview, goNext, goPrev]);

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
        <div className="space-y-2">{items.map((m) => <AudioCard key={m.id} item={m} onDelete={invalidateMedia} />)}</div>
      ) : tab === 'videos' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{items.map((m, i) => <VideoCard key={m.id} item={m} onPreview={() => setPreview({ item: m, index: i })} onDelete={invalidateMedia} />)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">{items.map((m, i) => <ImageCard key={m.id} item={m} onPreview={() => setPreview({ item: m, index: i })} onDelete={invalidateMedia} />)}</div>
      )}

      {preview && (
        <PreviewLightbox
          item={preview.item}
          index={preview.index}
          total={items.length}
          onPrev={goPrev}
          onNext={goNext}
          onClose={() => setPreview(null)}
          onDelete={async () => {
            if (!preview.item.id) return;
            await deleteMediaFile(preview.item.id);
            invalidateMedia();
            if (items.length <= 1) setPreview(null);
            else if (preview.index >= items.length - 1) goPrev();
            else goNext();
          }}
        />
      )}
    </div>
  );
}

function PreviewLightbox({ item, index, total, onPrev, onNext, onClose, onDelete }: {
  item: MediaItem; index: number; total: number;
  onPrev: () => void; onNext: () => void; onClose: () => void; onDelete: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete();
    setDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col" onClick={onClose}>
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/60">{index + 1} / {total}</span>
          <span className="text-sm text-white/80">{new Date(item.timestamp).toLocaleString('ar')}</span>
        </div>
        <div className="flex items-center gap-2">
          {item.url && (
            <a href={item.url} download onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors">
              <Download size={14} />تحميل
            </a>
          )}
          <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 text-sm transition-colors disabled:opacity-50">
            <Trash2 size={14} />{deleting ? 'جاري الحذف...' : 'حذف'}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
        {(item.type === 'screenshot' || item.type === 'photo') && item.url && (
          <img src={item.url} alt="" className="max-h-full max-w-full object-contain rounded-lg" />
        )}
        {item.type === 'video' && item.url && (
          <video src={item.url} controls autoPlay className="max-h-full max-w-full rounded-lg" />
        )}
      </div>

      {total > 1 && (
        <div className="flex items-center justify-center gap-4 py-3 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onPrev(); }}
            disabled={index === 0}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronRight size={20} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onNext(); }}
            disabled={index === total - 1}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronLeft size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

function ImageCard({ item, onPreview, onDelete }: { item: MediaItem; onPreview: () => void; onDelete: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(true);
    await deleteMediaFile(item.id);
    onDelete();
    setDeleting(false);
  };

  return (
    <button onClick={onPreview} className="group relative rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800 aspect-square">
      {item.url ? (
        <img src={item.url} alt="" className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center"><Image size={24} className="text-surface-400" /></div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={handleDelete} disabled={deleting}
            className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-colors disabled:opacity-50">
            <Trash2 size={14} />
          </button>
        </div>
        <div className="absolute bottom-0 inset-x-0 p-2">
          <span className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">{new Date(item.timestamp).toLocaleDateString('ar')}</span>
        </div>
      </div>
    </button>
  );
}

function VideoCard({ item, onPreview, onDelete }: { item: MediaItem; onPreview: () => void; onDelete: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(true);
    await deleteMediaFile(item.id);
    onDelete();
    setDeleting(false);
  };

  return (
    <button onClick={onPreview} className="group relative rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800 aspect-video">
      {item.url ? (
        <video src={item.url} className="w-full h-full object-cover" preload="metadata" />
      ) : (
        <div className="w-full h-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center"><Video size={24} className="text-surface-400" /></div>
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-primary-600 transition-colors"><Play size={20} className="text-white mr-0.5" /></div>
      </div>
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={handleDelete} disabled={deleting}
          className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-colors disabled:opacity-50">
          <Trash2 size={14} />
        </button>
      </div>
    </button>
  );
}

function AudioCard({ item, onDelete }: { item: MediaItem; onDelete: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    await deleteMediaFile(item.id);
    onDelete();
    setDeleting(false);
  };

  return (
    <Card padding="sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center"><Mic size={18} className="text-white" /></div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{item.type}</p>
          <p className="text-xs text-surface-500">{new Date(item.timestamp).toLocaleString('ar')}</p>
        </div>
        {item.url && <audio src={item.url} controls className="h-8 max-w-[200px]" />}
        <button onClick={handleDelete} disabled={deleting}
          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors disabled:opacity-50 shrink-0">
          <Trash2 size={16} />
        </button>
      </div>
    </Card>
  );
}
