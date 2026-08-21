import { useState, useEffect, useCallback } from 'react';
import { sendCommand } from '../../../services/api';
import { onSocketEvent } from '../../../services/socket';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { MapPin, RefreshCw } from 'lucide-react';

interface Props { token: string }

export function LocationTab({ token }: Props) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSocketEvent('command:reply', (data: unknown) => {
      const d = data as { result?: string; command?: string };
      if (d.command === 'get_location' && d.result) {
        try {
          const json = JSON.parse(d.result);
          if (json.latitude && json.longitude) setCoords({ lat: json.latitude, lng: json.longitude });
          else if (json.lat && json.lng) setCoords({ lat: json.lat, lng: json.lng });
        } catch {
          const parts = d.result.split(',');
          if (parts.length >= 2) {
            const lat = parseFloat(parts[0].replace(/[^0-9.-]/g, ''));
            const lng = parseFloat(parts[1].replace(/[^0-9.-]/g, ''));
            if (!isNaN(lat) && !isNaN(lng)) setCoords({ lat, lng });
          }
        }
        setError(null);
      }
    });
    return () => unsub();
  }, []);

  const requestLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      await sendCommand(token, 'get_location');
    } catch { setError('فشل إرسال أمر الموقع'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin size={20} className="text-primary-500" />
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">موقع الجهاز</h2>
        </div>
        <Button size="sm" icon={<MapPin size={14} />} onClick={requestLocation} loading={loading}>
          طلب الموقع
        </Button>
      </div>

      {error && <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 text-sm text-rose-600">{error}</div>}

      {coords ? (
        <Card padding="sm">
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">تم تحديد مكان الجهاز</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 font-mono mt-1">{coords.lat}, {coords.lng}</p>
          </div>
          <div className="rounded-xl overflow-hidden border-2 border-rose-400" style={{ height: 400 }}>
            <iframe
              src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&hl=ar&t=k&z=17&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
            />
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col items-center py-16">
          <MapPin size={48} className="mb-4 text-surface-300 dark:text-surface-600" />
          <p className="text-sm text-surface-500 text-center">اضغط "طلب الموقع" لإرسال الأمر إلى الجهاز</p>
          <p className="text-xs text-surface-400 text-center mt-1">انتظر حتى يتم الرد من جهاز الطفل</p>
        </Card>
      )}
    </div>
  );
}
