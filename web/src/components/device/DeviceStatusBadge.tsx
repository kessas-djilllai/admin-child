import { Badge } from '../ui/Badge';

interface DeviceStatusBadgeProps {
  isOnline: boolean;
}

export function DeviceStatusBadge({ isOnline }: DeviceStatusBadgeProps) {
  return (
    <Badge variant={isOnline ? 'success' : 'muted'} pulse={isOnline}>
      {isOnline ? 'متصل' : 'غير متصل'}
    </Badge>
  );
}
