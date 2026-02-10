import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Lock } from 'lucide-react';
import { Achievement } from '../../backend';
import { achievementsCatalog } from '../../lib/achievementsCatalog';

interface AchievementsGridProps {
  achievements: Achievement[];
  isLoading: boolean;
}

export default function AchievementsGrid({ achievements, isLoading }: AchievementsGridProps) {
  const earnedIds = new Set(achievements.map((a) => a.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {achievementsCatalog.map((catalogItem) => {
              const earned = achievements.find((a) => a.id === catalogItem.id);
              const isLocked = !earned;

              return (
                <div
                  key={catalogItem.id}
                  className={`p-4 border rounded-lg ${
                    isLocked
                      ? 'bg-muted/30 opacity-60'
                      : 'bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border-orange-200 dark:border-orange-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isLocked
                          ? 'bg-muted'
                          : 'bg-gradient-to-br from-orange-400 to-yellow-400'
                      }`}
                    >
                      {isLocked ? (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      ) : (
                        <Trophy className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{catalogItem.name}</h3>
                        {!isLocked && (
                          <Badge variant="secondary" className="text-xs">
                            Earned
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {catalogItem.description}
                      </p>
                      {earned && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Unlocked{' '}
                          {new Date(Number(earned.unlockedDate) / 1_000_000).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
