import { create } from 'zustand';
import type { AppSettings, Device } from '../types';
import { storage } from '../services/storage';

interface AppState {
  isConnected: boolean;
  setConnected: (v: boolean) => void;

  reconnecting: boolean;
  setReconnecting: (v: boolean) => void;
  reconnectAttempt: number;
  setReconnectAttempt: (n: number) => void;

  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => void;

  selectedDevice: Device | null;
  setSelectedDevice: (d: Device | null) => void;

  favorites: string[];
  toggleFavorite: (token: string) => void;

  archivedDevices: string[];
  toggleArchived: (token: string) => void;

  theme: 'light' | 'dark';
  toggleTheme: () => void;

  filter: 'all' | 'active' | 'inactive' | 'favorites' | 'archived';
  setFilter: (f: AppState['filter']) => void;

  searchQuery: string;
  setSearchQuery: (q: string) => void;

  commandProgress: { command: string; label: string; status: 'sending' | 'sent' | 'executing' | 'done' | 'error'; error?: string } | null;
  setCommandProgress: (p: AppState['commandProgress']) => void;

  activeDeviceTab: string;
  setActiveDeviceTab: (tab: string) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  isConnected: false,
  setConnected: (v) => set({ isConnected: v }),

  reconnecting: false,
  setReconnecting: (v) => set({ reconnecting: v }),
  reconnectAttempt: 0,
  setReconnectAttempt: (n) => set({ reconnectAttempt: n }),

  settings: storage.getSettings(),
  updateSettings: (s) => {
    const current = get().settings;
    const updated = { ...current, ...s };
    storage.saveSettings(updated);
    set({ settings: updated });
  },

  selectedDevice: null,
  setSelectedDevice: (d) => set({ selectedDevice: d }),

  favorites: storage.getFavorites(),
  toggleFavorite: (token) => {
    const updated = storage.toggleFavorite(token);
    set({ favorites: updated });
  },

  archivedDevices: storage.getArchived(),
  toggleArchived: (token) => {
    const updated = storage.toggleArchived(token);
    set({ archivedDevices: updated });
  },

  theme: storage.getTheme(),
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    storage.setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    set({ theme: next });
  },

  filter: 'all',
  setFilter: (f) => set({ filter: f }),

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  commandProgress: null,
  setCommandProgress: (p) => set({ commandProgress: p }),

  activeDeviceTab: 'commands',
  setActiveDeviceTab: (tab) => set({ activeDeviceTab: tab }),

  sidebarOpen: false,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
