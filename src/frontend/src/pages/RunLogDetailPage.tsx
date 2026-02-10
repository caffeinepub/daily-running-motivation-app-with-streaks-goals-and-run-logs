import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetRunLogs } from '../hooks/queries/useRunLogs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Clock, MapPin, FileText } from 'lucide-react';
import ErrorCallout from '../components/system/ErrorCallout';
import { formatDistanceDisplay } from '../lib/streak';

export default function RunLogDetailPage() {
  const navigate = useNavigate();
  const { logId } = useParams({ from: '/history/$logId' });
  const { data: runLogs, isLoading, error, refetch } = useGetRunLogs(null);

  const log = runLogs?.find((l) => l.id === logId);

  if (error) {
    return (
      <div className="pb-20">
        <ErrorCallout
          message="Failed to load run details"
          onRetry={refetch}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto pb-20">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="max-w-2xl mx-auto pb-20">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Run not found</p>
            <Button onClick={() => navigate({ to: '/history' })}>
              Back to History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const date = new Date(Number(log.timestamp) / 1_000_000);

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/history' })}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to History
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Run Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div>
                <div className="font-medium mb-1">Date & Time</div>
                <div className="text-sm text-muted-foreground">
                  {date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {' at '}
                  {date.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div>
                <div className="font-medium mb-1">Duration</div>
                <div className="text-sm text-muted-foreground">
                  {log.timeMinutes} minutes
                </div>
              </div>
            </div>

            {log.distance && (
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div>
                  <div className="font-medium mb-1">Distance</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceDisplay(log.distance, log.unit)}
                  </div>
                </div>
              </div>
            )}

            {log.notes && (
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div>
                  <div className="font-medium mb-1">Notes</div>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {log.notes}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
