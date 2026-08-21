import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Monitor, Settings, Shield, Wifi, WifiOff, ChevronLeft, ChevronRight, Terminal, Home, ArrowRight, Image } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { useState, useEffect } from 'react';

const mainNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'الرئيسية' },
  { to: '/devices', icon: Monitor, label: 'الأجهزة' },
  { to: '/settings', icon: Settings, label: 'الإعدادات' },
];

interface DeviceTab {
  key: string;
  label: string;
  icon: typeof Home;
}

const deviceTabs: DeviceTab[] = [
  { key: 'home', label: 'الرئيسية', icon: Home },
  { key: 'commands', label: 'الأوامر', icon: Terminal },
  { key: 'media', label: 'معرض الوسائط', icon: Image },
  { key: 'settings', label: 'الإعدادات', icon: Settings },
];

export function Sidebar() {
  const { isConnected } = useAppStore();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isDeviceView, setIsDeviceView] = useState(false);
  const activeDeviceTab = useAppStore((s) => s.activeDeviceTab);
  const setActiveDeviceTab = useAppStore((s) => s.setActiveDeviceTab);

  useEffect(() => {
    setIsDeviceView(/^\/device\/.+/.test(location.pathname));
  }, [location.pathname]);

  return (
    <aside className={`fixed top-0 right-0 h-full z-40 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[220px]'} bg-white dark:bg-surface-950 border-l border-surface-200 dark:border-surface-800 flex flex-col`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 h-16 border-b border-surface-100 dark:border-surface-800 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shrink-0">
          <Shield size={18} className="text-white" />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold text-surface-900 dark:text-white whitespace-nowrap">
            Supervisor Control
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {isDeviceView ? (
          <>
            <NavLink
              to="/devices"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-surface-600 hover:bg-surface-50 dark:text-surface-400 dark:hover:bg-surface-900 ${collapsed ? 'justify-center' : ''}`}
            >
              <ArrowRight size={20} className="shrink-0" />
              {!collapsed && <span>العودة للأجهزة</span>}
            </NavLink>

            <div className={`my-2 border-t border-surface-100 dark:border-surface-800 ${collapsed ? 'mx-2' : ''}`} />

            {deviceTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveDeviceTab(tab.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeDeviceTab === tab.key
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                    : 'text-surface-600 hover:bg-surface-50 dark:text-surface-400 dark:hover:bg-surface-900'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <tab.icon size={20} className="shrink-0" />
                {!collapsed && <span>{tab.label}</span>}
              </button>
            ))}
          </>
        ) : (
          mainNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                    : 'text-surface-600 hover:bg-surface-50 dark:text-surface-400 dark:hover:bg-surface-900'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))
        )}
      </nav>

      {/* Status + Collapse */}
      <div className="px-3 pb-4 space-y-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-surface-500"
        >
          {collapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-900 ${collapsed ? 'justify-center' : ''}`}>
          {isConnected ? (
            <Wifi size={16} className="text-emerald-500 shrink-0" />
          ) : (
            <WifiOff size={16} className="text-rose-500 shrink-0" />
          )}
          {!collapsed && (
            <span className={`text-xs font-medium ${isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {isConnected ? 'متصل' : 'غير متصل'}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
