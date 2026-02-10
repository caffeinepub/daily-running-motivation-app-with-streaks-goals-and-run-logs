import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useGetGoals } from './useGoals';
import { useGetRunLogs } from './useRunLogs';
import { useGetAchievements } from './useAchievements';
import { computeTodayCompleted, computeStreak } from '../../lib/streak';
import { useState, useEffect } from 'react';
import { Achievement } from '../../backend';

export function useDashboardSummary() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: goals, isLoading: goalsLoading } = useGetGoals();
  const { data: runLogs, isLoading: logsLoading } = useGetRunLogs(null);
  const { data: achievements, isLoading: achievementsLoading } = useGetAchievements();

  const [previousAchievements, setPreviousAchievements] = useState<Achievement[]>([]);
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<Achievement[]>([]);

  const motivationQuery = useQuery<string>({
    queryKey: ['motivationMessage'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMotivationMessage();
    },
    enabled: !!actor && !actorFetching,
  });

  const currentGoal = goals && goals.length > 0 ? goals[goals.length - 1] : null;
  const todayCompleted = computeTodayCompleted(runLogs || []);
  const currentStreak = computeStreak(runLogs || []);

  useEffect(() => {
    if (achievements && achievements.length > 0) {
      if (previousAchievements.length > 0) {
        const previousIds = new Set(previousAchievements.map((a) => a.id));
        const newAchievements = achievements.filter((a) => !previousIds.has(a.id));
        if (newAchievements.length > 0) {
          setNewlyUnlockedAchievements(newAchievements);
          setTimeout(() => setNewlyUnlockedAchievements([]), 10000);
        }
      }
      setPreviousAchievements(achievements);
    }
  }, [achievements]);

  const isLoading = goalsLoading || logsLoading || achievementsLoading || motivationQuery.isLoading;
  const error = motivationQuery.error;

  return {
    todayCompleted,
    currentStreak,
    currentGoal,
    motivationMessage: motivationQuery.data || 'Keep running!',
    achievements: achievements || [],
    isLoading,
    error,
    refetch: motivationQuery.refetch,
    newlyUnlockedAchievements,
  };
}
