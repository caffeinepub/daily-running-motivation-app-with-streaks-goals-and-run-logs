import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { RunLog } from '../../backend';

export function useGetRunLogs(limit: number | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<RunLog[]>({
    queryKey: ['runLogs', limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRunLogs(limit !== null ? BigInt(limit) : null);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddRunLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: RunLog) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addRunLog(log);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runLogs'] });
      queryClient.invalidateQueries({ queryKey: ['motivationMessage'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
}
