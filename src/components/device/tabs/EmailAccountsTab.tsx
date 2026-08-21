import { Card } from '../../ui/Card';
import { Mail } from 'lucide-react';

interface Props { token: string }

export function EmailAccountsTab({ token }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Mail size={20} className="text-primary-500" />
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">حسابات البريد الإلكتروني</h2>
      </div>
      <Card>
        <div className="text-center py-12">
          <Mail size={32} className="mx-auto mb-3 text-surface-300" />
          <p className="text-sm text-surface-500">يمكنك جلب الحسابات من صفحة الأوامر</p>
          <p className="text-xs text-surface-400 mt-1">أرسل أمر "الحسابات الإلكترونية" لجلب الحسابات</p>
        </div>
      </Card>
    </div>
  );
}
