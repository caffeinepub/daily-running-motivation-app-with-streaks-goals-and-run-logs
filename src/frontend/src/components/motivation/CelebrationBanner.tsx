import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Trophy } from 'lucide-react';
import { Achievement } from '../../backend';

interface CelebrationBannerProps {
  achievements: Achievement[];
}

export default function CelebrationBanner({ achievements }: CelebrationBannerProps) {
  if (achievements.length === 0) return null;

  return (
    <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-300 dark:border-green-800">
      <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
      <AlertTitle className="text-green-900 dark:text-green-100">
        🎉 New Achievement{achievements.length > 1 ? 's' : ''} Unlocked!
      </AlertTitle>
      <AlertDescription className="text-green-800 dark:text-green-200">
        {achievements.map((a) => a.name).join(', ')}
      </AlertDescription>
    </Alert>
  );
}
