import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { Achievement } from '../../backend';

export function useGetAchievements() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Achievement[]>({
    queryKey: ['achievements'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAchievements(null);
    },
    enabled: !!actor && !actorFetching,
  });
}
