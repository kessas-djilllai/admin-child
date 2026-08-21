import type { AppSettings } from '../types';

const STORAGE_KEY = 'supervisor_control';

interface StorageData {
  settings: AppSettings;
  favorites: string[];
  archivedDevices: string[];
  theme: 'light' | 'dark';
}

function getStored(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    settings: { serverUrl: '', supabaseKey: '', cloudinaryName: '', cloudinaryApiKey: '', cloudinaryApiSecret: '' },
    favorites: [],
    archivedDevices: [],
    theme: 'light',
  };
}

function saveStored(data: StorageData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const storage = {
  getSettings: (): AppSettings => getStored().settings,
  saveSettings: (settings: AppSettings) => {
    const data = getStored();
    data.settings = settings;
    saveStored(data);
  },

  getFavorites: (): string[] => getStored().favorites,
  toggleFavorite: (token: string) => {
    const data = getStored();
    const idx = data.favorites.indexOf(token);
    if (idx >= 0) data.favorites.splice(idx, 1);
    else data.favorites.push(token);
    saveStored(data);
    return data.favorites;
  },

  getArchived: (): string[] => getStored().archivedDevices,
  toggleArchived: (token: string) => {
    const data = getStored();
    const idx = data.archivedDevices.indexOf(token);
    if (idx >= 0) data.archivedDevices.splice(idx, 1);
    else data.archivedDevices.push(token);
    saveStored(data);
    return data.archivedDevices;
  },

  getTheme: (): 'light' | 'dark' => getStored().theme,
  setTheme: (theme: 'light' | 'dark') => {
    const data = getStored();
    data.theme = theme;
    saveStored(data);
  },
};
