import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAddRunLog } from '../hooks/queries/useRunLogs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { DistanceUnit } from '../backend';
import { validateRunLog } from '../lib/validation';
import { preventDuplicateSubmit } from '../lib/submitGuards';
import ErrorCallout from '../components/system/ErrorCallout';

export default function LogRunPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [unit, setUnit] = useState<DistanceUnit>(DistanceUnit.kilometers);
  const [notes, setNotes] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const addRunLogMutation = useAddRunLog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setValidationErrors({ form: 'Please sign in to log a run' });
      return;
    }

    const errors = validateRunLog({
      timeMinutes: parseFloat(duration),
      distance: distance ? parseFloat(distance) : undefined,
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const formData = {
      date,
      time,
      duration: parseFloat(duration),
      distance: distance ? parseFloat(distance) : undefined,
      unit,
      notes: notes.trim() || undefined,
    };

    if (!preventDuplicateSubmit(formData)) {
      setValidationErrors({ form: 'Please wait before submitting again' });
      return;
    }

    setValidationErrors({});

    const timestamp = new Date(`${date}T${time}`).getTime() * 1_000_000;

    try {
      await addRunLogMutation.mutateAsync({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user: identity!.getPrincipal(),
        timeMinutes: parseFloat(duration),
        distance: distance ? parseFloat(distance) : undefined,
        unit,
        notes: notes.trim() || undefined,
        timestamp: BigInt(timestamp),
        createdAt: BigInt(Date.now() * 1_000_000),
      });

      navigate({ to: '/' });
    } catch (error: any) {
      setValidationErrors({ form: error.message || 'Failed to log run' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Log a Run</CardTitle>
          <CardDescription>Record your running activity</CardDescription>
        </CardHeader>
        <CardContent>
          {!isAuthenticated && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please sign in to log your runs and track your progress.
              </AlertDescription>
            </Alert>
          )}

          {validationErrors.form && (
            <ErrorCallout
              message={validationErrors.form}
              onRetry={addRunLogMutation.isError ? () => handleSubmit(new Event('submit') as any) : undefined}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                step="0.1"
                min="0.1"
                max="1440"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                required
              />
              {validationErrors.timeMinutes && (
                <p className="text-sm text-destructive">{validationErrors.timeMinutes}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance">Distance (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="distance"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1000"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="5.0"
                  className="flex-1"
                />
                <Select value={unit} onValueChange={(value) => setUnit(value as DistanceUnit)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DistanceUnit.kilometers}>km</SelectItem>
                    <SelectItem value={DistanceUnit.miles}>miles</SelectItem>
                    <SelectItem value={DistanceUnit.meters}>meters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {validationErrors.distance && (
                <p className="text-sm text-destructive">{validationErrors.distance}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did it feel? Any observations?"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">{notes.length}/500 characters</p>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={!isAuthenticated || addRunLogMutation.isPending}
                className="flex-1"
              >
                {addRunLogMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging...
                  </>
                ) : (
                  'Log Run'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/' })}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
