import { useState, useEffect, useRef } from 'react';
import { sendCommand } from '../../../services/api';
import { onSocketEvent } from '../../../services/socket';
import { Button } from '../../ui/Button';
import { Mail, ArrowRight, RefreshCw, User, AtSign, ExternalLink } from 'lucide-react';

interface Props {
  token: string;
  onBack: () => void;
}

interface Account {
  name: string;
  email: string;
  type?: string;
}

export function AccountPanel({ token, onBack }: Props) {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [raw, setRaw] = useState<string>('');
  const [fetched, setFetched] = useState(false);
  const awaitingRef = useRef(false);

  useEffect(() => {
    const unsub = onSocketEvent('command:reply', (data: unknown) => {
      if (!awaitingRef.current) return;
      const d = data as { device_token?: string; response_data?: string; message?: string; status?: string };
      if (d.device_token && d.device_token !== token) return;

      const rawStr = d.response_data || d.message || '';
      if (!rawStr) return;

      awaitingRef.current = false;
      setRaw(rawStr);
      parseAccounts(rawStr);
      setFetched(true);
      setLoading(false);
    });
    return () => unsub();
  }, [token]);

  const parseAccounts = (rawStr: string) => {
    try {
      const parsed = JSON.parse(rawStr);
      if (Array.isArray(parsed)) {
        setAccounts(parsed.map((a: Record<string, string>) => ({
          name: a.name || a.accountName || a.display_name || '',
          email: a.email || a.account || a.name || '',
          type: a.type || a.accountType || 'email',
        })));
        return;
      }
      if (typeof parsed === 'object') {
        const list = parsed.accounts || parsed.data || parsed.result;
        if (Array.isArray(list)) {
          setAccounts(list.map((a: Record<string, string>) => ({
            name: a.name || a.accountName || '',
            email: a.email || a.account || '',
            type: a.type || 'email',
          })));
          return;
        }
      }
    } catch {
      // Not JSON, parse text format
    }
    const lines = rawStr.split('\n').filter(Boolean);
    const parsed2: Account[] = [];
    let currentAccount: Partial<Account> = {};
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('---') || trimmed.startsWith('===')) {
        if (currentAccount.email || currentAccount.name) {
          parsed2.push(currentAccount as Account);
          currentAccount = {};
        }
        continue;
      }
      const typeMatch = trimmed.match(/نوع الحساب:\s*(.+)/);
      const nameMatch = trimmed.match(/اسم الحساب:\s*(.+)/);
      if (typeMatch) {
        currentAccount.type = typeMatch[1].trim();
      } else if (nameMatch) {
        const val = nameMatch[1].trim();
        if (val.includes('@')) {
          currentAccount.email = val;
        } else {
          currentAccount.name = val;
        }
      } else if (trimmed.includes('@')) {
        if (currentAccount.email || currentAccount.name) {
          parsed2.push(currentAccount as Account);
          currentAccount = {};
        }
        currentAccount.email = trimmed;
      }
    }
    if (currentAccount.email || currentAccount.name) {
      parsed2.push(currentAccount as Account);
    }
    if (parsed2.length > 0) setAccounts(parsed2);
  };

  const fetchAccounts = async () => {
    setLoading(true);
    setFetched(false);
    setAccounts([]);
    setRaw('');
    awaitingRef.current = true;
    try {
      const result = await sendCommand(token, 'get_account') as { delivered?: boolean; error?: string }[];
      if (result?.[0]?.error === 'device_offline') {
        awaitingRef.current = false;
        setFetched(true);
        setLoading(false);
      }
    } catch {
      awaitingRef.current = false;
      setLoading(false);
    }
    setTimeout(() => {
      if (awaitingRef.current) {
        awaitingRef.current = false;
        setFetched(true);
        setLoading(false);
      }
    }, 15000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <ArrowRight size={20} className="text-surface-600 dark:text-surface-400" />
        </button>
        <Mail size={20} className="text-pink-500" />
        <h2 className="text-lg font-bold text-surface-900 dark:text-white">حسابات البريد الإلكتروني</h2>
      </div>

      <Button icon={<RefreshCw size={16} />} onClick={fetchAccounts} loading={loading} className="w-full">
        جلب الحسابات
      </Button>

      {loading && (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="w-16 h-16 rounded-full bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center">
            <RefreshCw size={24} className="text-pink-400 animate-spin" />
          </div>
          <p className="text-sm text-surface-500">جاري جلب الحسابات من الجهاز...</p>
        </div>
      )}

      {!loading && fetched && accounts.length === 0 && (
        <div className="text-center py-12">
          <Mail size={40} className="mx-auto mb-3 text-surface-300 dark:text-surface-600" />
          <p className="text-sm text-surface-500 dark:text-surface-400">لم يتم العثور على حسابات</p>
          <p className="text-xs text-surface-400 mt-1">تأكد من أن الجهاز متصل</p>
        </div>
      )}

      {!loading && accounts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white">الحسابات ({accounts.length})</h3>
          </div>

          {accounts.map((acc, i) => (
            <div key={i} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white shrink-0">
                  <User size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                    {acc.name || 'حساب غير معروف'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <AtSign size={12} className="text-surface-400 shrink-0" />
                    <p className="text-xs text-surface-500 dark:text-surface-400 truncate font-mono">
                      {acc.email}
                    </p>
                  </div>
                  {acc.type && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-pink-50 dark:bg-pink-500/10 text-[10px] font-medium text-pink-600 dark:text-pink-400">
                      {acc.type}
                    </span>
                  )}
                </div>
                {acc.email && (
                  <a href={`mailto:${acc.email}`} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors shrink-0">
                    <ExternalLink size={16} className="text-surface-400" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && fetched && raw && (
        <details className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
          <summary className="px-4 py-3 text-xs font-medium text-surface-500 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
            عرض البيانات الخام
          </summary>
          <pre className="px-4 pb-4 text-xs text-surface-600 dark:text-surface-400 overflow-x-auto max-h-48 overflow-y-auto font-mono whitespace-pre-wrap">
            {raw}
          </pre>
        </details>
      )}
    </div>
  );
}
