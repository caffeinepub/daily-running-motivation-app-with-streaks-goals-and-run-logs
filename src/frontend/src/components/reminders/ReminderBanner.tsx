import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { getReminderPreferences } from '../../lib/preferences';
import { useEffect, useState } from 'react';

interface ReminderBannerProps {
  todayCompleted: boolean;
}

export default function ReminderBanner({ todayCompleted }: ReminderBannerProps) {
  const navigate = useNavigate();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const prefs = getReminderPreferences();
    
    if (!prefs.enabled || todayCompleted) {
      setShouldShow(false);
      return;
    }

    const now = new Date();
    const [hours, minutes] = prefs.time.split(':').map(Number);
    const reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);

    setShouldShow(now >= reminderDate);
  }, [todayCompleted]);

  if (!shouldShow) return null;

  return (
    <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-300 dark:border-blue-800">
      <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      <AlertTitle className="text-blue-900 dark:text-blue-100">
        Time to Run! 🏃‍♂️
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-4">
        <span className="text-blue-800 dark:text-blue-200">
          You haven't logged your run today. Let's keep that streak going!
        </span>
        <Button
          size="sm"
          onClick={() => navigate({ to: '/log' })}
          className="flex-shrink-0"
        >
          Log Run
        </Button>
      </AlertDescription>
    </Alert>
  );
}
