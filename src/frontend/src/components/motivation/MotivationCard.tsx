import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';
import { Goal } from '../../backend';

interface MotivationCardProps {
  message: string;
  todayCompleted: boolean;
  currentGoal: Goal | null;
  isLoading: boolean;
}

export default function MotivationCard({
  message,
  todayCompleted,
  currentGoal,
  isLoading,
}: MotivationCardProps) {
  return (
    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
          <Sparkles className="h-5 w-5" />
          Daily Motivation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </>
        ) : (
          <>
            <p className="text-lg font-medium text-orange-900 dark:text-orange-100">
              {message}
            </p>
            {currentGoal && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-orange-800 dark:text-orange-200">
                  <span>Today's Progress</span>
                  <span className="font-medium">
                    {todayCompleted ? 'Complete!' : 'Not started'}
                  </span>
                </div>
                <Progress value={todayCompleted ? 100 : 0} className="h-2" />
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  Goal: {currentGoal.targetTimeMinutes} minutes
                  {currentGoal.targetDistance && ` • ${currentGoal.targetDistance} ${currentGoal.unit}`}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
