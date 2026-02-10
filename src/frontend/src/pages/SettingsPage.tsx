import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetGoals, useSaveDailyGoal } from '../hooks/queries/useGoals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { DistanceUnit } from '../backend';
import { toast } from 'sonner';
import { getReminderPreferences, saveReminderPreferences } from '../lib/preferences';

export default function SettingsPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: goals, isLoading: goalsLoading } = useGetGoals();
  const saveDailyGoalMutation = useSaveDailyGoal();

  const currentGoal = goals && goals.length > 0 ? goals[goals.length - 1] : null;

  const [targetTime, setTargetTime] = useState('30');
  const [targetDistance, setTargetDistance] = useState('');
  const [unit, setUnit] = useState<DistanceUnit>(DistanceUnit.kilometers);

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('18:00');

  useEffect(() => {
    if (currentGoal) {
      setTargetTime(currentGoal.targetTimeMinutes.toString());
      setTargetDistance(currentGoal.targetDistance?.toString() || '');
      setUnit(currentGoal.unit);
    }
  }, [currentGoal]);

  useEffect(() => {
    const prefs = getReminderPreferences();
    setReminderEnabled(prefs.enabled);
    setReminderTime(prefs.time);
  }, []);

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please sign in to save settings');
      return;
    }

    const timeMinutes = parseFloat(targetTime);
    if (isNaN(timeMinutes) || timeMinutes <= 0) {
      toast.error('Please enter a valid duration');
      return;
    }

    const distanceValue = targetDistance ? parseFloat(targetDistance) : undefined;
    if (distanceValue !== undefined && (isNaN(distanceValue) || distanceValue < 0)) {
      toast.error('Please enter a valid distance');
      return;
    }

    try {
      await saveDailyGoalMutation.mutateAsync({
        targetTimeMinutes: timeMinutes,
        targetDistance: distanceValue,
        unit,
        createdAt: BigInt(Date.now() * 1_000_000),
      });
      toast.success('Goal saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save goal');
    }
  };

  const handleSaveReminders = () => {
    saveReminderPreferences({
      enabled: reminderEnabled,
      time: reminderTime,
    });
    toast.success('Reminder preferences saved!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Daily Goal</CardTitle>
          <CardDescription>Set your daily running target</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveGoal} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="targetTime">Target Duration (minutes) *</Label>
              <Input
                id="targetTime"
                type="number"
                step="1"
                min="1"
                max="1440"
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                placeholder="30"
                required
                disabled={!isAuthenticated || goalsLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDistance">Target Distance (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="targetDistance"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1000"
                  value={targetDistance}
                  onChange={(e) => setTargetDistance(e.target.value)}
                  placeholder="5.0"
                  className="flex-1"
                  disabled={!isAuthenticated || goalsLoading}
                />
                <Select
                  value={unit}
                  onValueChange={(value) => setUnit(value as DistanceUnit)}
                  disabled={!isAuthenticated || goalsLoading}
                >
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
            </div>

            <Button
              type="submit"
              disabled={!isAuthenticated || saveDailyGoalMutation.isPending}
              className="w-full"
            >
              {saveDailyGoalMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Goal'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reminders</CardTitle>
          <CardDescription>Set up daily run reminders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reminder-enabled">Enable Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Show a reminder banner when it's time to run
              </p>
            </div>
            <Switch
              id="reminder-enabled"
              checked={reminderEnabled}
              onCheckedChange={setReminderEnabled}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="reminderTime">Reminder Time</Label>
            <Input
              id="reminderTime"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              disabled={!reminderEnabled}
            />
            <p className="text-xs text-muted-foreground">
              You'll see a reminder banner after this time if you haven't run today
            </p>
          </div>

          <Button onClick={handleSaveReminders} className="w-full">
            Save Reminder Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
