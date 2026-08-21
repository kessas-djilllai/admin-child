import { useState } from 'react';
import { sendCommand } from '../../../services/api';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { MousePointer, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Circle } from 'lucide-react';

interface Props { token: string }

export function RemoteControlTab({ token }: Props) {
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const sendTouch = async (type: string, x: number, y: number) => {
    setLoading(true);
    setLastAction(type);
    try {
      await sendCommand(token, 'remote_control', { action: type, x, y });
    } catch { /* ignore */ }
    finally { setLoading(false); setTimeout(() => setLastAction(null), 500); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <MousePointer size={20} className="text-primary-500" />
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">التحكم عن بُعد</h2>
      </div>

      <Card className="flex flex-col items-center py-8">
        <p className="text-sm text-surface-500 mb-6">اضغط على الأزرار للتحكم بالجهاز</p>

        {/* D-Pad style controls */}
        <div className="grid grid-cols-3 gap-3 w-64">
          <div />
          <Button variant="outline" size="lg" onClick={() => sendTouch('swipe', 540, 1200)} loading={loading && lastAction === 'swipe'} className="justify-center">
            <ArrowUp size={20} />
          </Button>
          <div />
          <Button variant="outline" size="lg" onClick={() => sendTouch('swipe', 200, 1200)} loading={loading && lastAction === 'swipe'} className="justify-center">
            <ArrowLeft size={20} />
          </Button>
          <Button variant="primary" size="lg" onClick={() => sendTouch('click', 540, 1200)} loading={loading && lastAction === 'click'} className="justify-center rounded-full">
            <Circle size={20} />
          </Button>
          <Button variant="outline" size="lg" onClick={() => sendTouch('swipe', 880, 1200)} loading={loading && lastAction === 'swipe'} className="justify-center">
            <ArrowRight size={20} />
          </Button>
          <div />
          <Button variant="outline" size="lg" onClick={() => sendTouch('swipe', 540, 2000)} loading={loading && lastAction === 'swipe'} className="justify-center">
            <ArrowDown size={20} />
          </Button>
          <div />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <Button variant="outline" size="sm" onClick={() => sendTouch('long_click', 540, 1200)} loading={loading}>
            ضغطة طويلة
          </Button>
          <Button variant="outline" size="sm" onClick={() => sendTouch('back', 0, 0)} loading={loading}>
            رجوع
          </Button>
          <Button variant="outline" size="sm" onClick={() => sendTouch('home', 0, 0)} loading={loading}>
            الرئيسية
          </Button>
        </div>
      </Card>
    </div>
  );
}
