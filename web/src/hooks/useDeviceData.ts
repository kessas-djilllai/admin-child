import { useQuery } from '@tanstack/react-query';
import { fetchSms, fetchSecurityAlerts, fetchInstalledApps, fetchAppUsage, fetchFiles, fetchContacts, fetchSimCards, fetchMediaFiles, fetchCommands } from '../services/api';
import type { SmsLog, SecurityAlert, InstalledApp, AppUsageActivity, FileItem, Contact, SimCardInfo, MediaItem, Command } from '../types';

export function useDeviceData(token: string | undefined) {
  const enabled = !!token;

  const sms = useQuery<SmsLog[]>({ queryKey: ['sms', token], queryFn: () => fetchSms(token!), enabled, refetchInterval: 15000 });
  const alerts = useQuery<SecurityAlert[]>({ queryKey: ['alerts', token], queryFn: () => fetchSecurityAlerts(token!), enabled, refetchInterval: 15000 });
  const apps = useQuery<InstalledApp[]>({ queryKey: ['apps', token], queryFn: () => fetchInstalledApps(token!), enabled });
  const appUsage = useQuery<AppUsageActivity[]>({ queryKey: ['appUsage', token], queryFn: () => fetchAppUsage(token!), enabled });
  const files = useQuery<FileItem[]>({ queryKey: ['files', token], queryFn: () => fetchFiles(token!), enabled });
  const contacts = useQuery<Contact[]>({ queryKey: ['contacts', token], queryFn: () => fetchContacts(token!), enabled });
  const simCards = useQuery<SimCardInfo[]>({ queryKey: ['simCards', token], queryFn: () => fetchSimCards(token!), enabled });
  const mediaScreenshots = useQuery<MediaItem[]>({ queryKey: ['media', token, 'screenshot'], queryFn: () => fetchMediaFiles(token!, ['screenshot']), enabled });
  const mediaPhotos = useQuery<MediaItem[]>({ queryKey: ['media', token, 'photo'], queryFn: () => fetchMediaFiles(token!, ['photo']), enabled });
  const mediaVideos = useQuery<MediaItem[]>({ queryKey: ['media', token, 'video'], queryFn: () => fetchMediaFiles(token!, ['video']), enabled });
  const mediaAudio = useQuery<MediaItem[]>({ queryKey: ['media', token, 'audio'], queryFn: () => fetchMediaFiles(token!, ['audio']), enabled });
  const commands = useQuery<Command[]>({ queryKey: ['commands', token], queryFn: () => fetchCommands(token!), enabled, refetchInterval: 12000 });

  return { sms, alerts, apps, appUsage, files, contacts, simCards, mediaScreenshots, mediaPhotos, mediaVideos, mediaAudio, commands };
}
