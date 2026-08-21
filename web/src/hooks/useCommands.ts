import { useQuery } from '@tanstack/react-query';
import { fetchCommands } from '../services/api';

export function useCommands(token: string | undefined) {
  return useQuery({
    queryKey: ['commands', token],
    queryFn: () => fetchCommands(token!),
    enabled: !!token,
    refetchInterval: 12000,
    staleTime: 8000,
  });
}
