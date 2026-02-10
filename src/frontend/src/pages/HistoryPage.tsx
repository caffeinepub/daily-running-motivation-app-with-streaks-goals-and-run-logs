import { useNavigate } from '@tanstack/react-router';
import { useGetRunLogs } from '../hooks/queries/useRunLogs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';
import ErrorCallout from '../components/system/ErrorCallout';
import { formatDistanceDisplay } from '../lib/streak';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { data: runLogs, isLoading, error, refetch } = useGetRunLogs(50);

  if (error) {
    return (
      <div className="pb-20">
        <ErrorCallout
          message="Failed to load run history"
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="pb-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Run History</CardTitle>
          <CardDescription>Your recent running activities</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : !runLogs || runLogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No runs logged yet</p>
              <Button onClick={() => navigate({ to: '/log' })}>
                Log Your First Run
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {runLogs.map((log) => {
                const date = new Date(Number(log.timestamp) / 1_000_000);
                return (
                  <button
                    key={log.id}
                    onClick={() => navigate({ to: '/history/$logId', params: { logId: log.id } })}
                    className="w-full text-left p-4 border rounded-lg hover:bg-accent transition-colors flex items-center gap-4"
                  >
                    <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium mb-1">
                        {date.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {log.timeMinutes} min
                        </span>
                        {log.distance && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {formatDistanceDisplay(log.distance, log.unit)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
