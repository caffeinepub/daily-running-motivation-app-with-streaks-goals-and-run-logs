import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { Goal } from '../../backend';

export function useGetGoals() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGoals();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSaveDailyGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: Goal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveDailyGoal(goal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}
