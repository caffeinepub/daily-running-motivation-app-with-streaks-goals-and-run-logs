import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import ProfileSetupDialog from '../components/auth/ProfileSetupDialog';
import GuestModeBanner from '../components/auth/GuestModeBanner';
import MotivationCard from '../components/motivation/MotivationCard';
import CelebrationBanner from '../components/motivation/CelebrationBanner';
import AchievementsGrid from '../components/achievements/AchievementsGrid';
import ReminderBanner from '../components/reminders/ReminderBanner';
import { useDashboardSummary } from '../hooks/queries/useDashboardSummary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Target, Flame } from 'lucide-react';
import ErrorCallout from '../components/system/ErrorCallout';

export default function DashboardPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const {
    todayCompleted,
    currentStreak,
    currentGoal,
    motivationMessage,
    achievements,
    isLoading,
    error,
    refetch,
    newlyUnlockedAchievements,
  } = useDashboardSummary();

  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  if (showProfileSetup) {
    return <ProfileSetupDialog />;
  }

  return (
    <div className="space-y-6 pb-20">
      {!isAuthenticated && <GuestModeBanner />}

      <ReminderBanner todayCompleted={todayCompleted} />

      {newlyUnlockedAchievements.length > 0 && (
        <CelebrationBanner achievements={newlyUnlockedAchievements} />
      )}

      <div
        className="relative h-48 rounded-lg overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center"
        style={{
          backgroundImage: 'url(/assets/generated/run-hero-bg.dim_1600x600.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/80 to-orange-600/80" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl font-bold mb-2">
            {isAuthenticated && userProfile?.displayName
              ? `Welcome back, ${userProfile.displayName}!`
              : 'Ready to Run?'}
          </h1>
          <p className="text-lg opacity-90">Let's make today count</p>
        </div>
      </div>

      {error && (
        <ErrorCallout
          message="Failed to load dashboard data"
          onRetry={refetch}
        />
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {todayCompleted ? (
                    <span className="text-green-600 dark:text-green-400">Complete! ✓</span>
                  ) : (
                    <span className="text-orange-600 dark:text-orange-400">Not yet</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {todayCompleted ? 'Great job today!' : 'Time to get moving'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentStreak > 0 ? 'Keep it going!' : 'Start your streak today'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Goal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : currentGoal ? (
              <>
                <div className="text-2xl font-bold">
                  {currentGoal.targetTimeMinutes} min
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentGoal.targetDistance
                    ? `${currentGoal.targetDistance} ${currentGoal.unit}`
                    : 'Time-based goal'}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-muted-foreground">Not set</div>
                <p className="text-xs text-muted-foreground mt-1">Set a goal in Settings</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <MotivationCard
        message={motivationMessage}
        todayCompleted={todayCompleted}
        currentGoal={currentGoal}
        isLoading={isLoading}
      />

      <AchievementsGrid achievements={achievements} isLoading={isLoading} />
    </div>
  );
}
