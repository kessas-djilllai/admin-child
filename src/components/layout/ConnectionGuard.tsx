import { Navigate } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';

export function ConnectionGuard({ children }: { children: React.ReactNode }) {
  const { settings } = useAppStore();

  if (!settings.serverUrl) {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
}
