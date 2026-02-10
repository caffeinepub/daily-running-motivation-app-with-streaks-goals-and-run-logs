import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

export default function GuestModeBanner() {
  const { login } = useInternetIdentity();

  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <span>
          You're in guest mode. Sign in to save your runs and track your progress.
        </span>
        <Button size="sm" onClick={login} className="flex-shrink-0">
          Sign In
        </Button>
      </AlertDescription>
    </Alert>
  );
}
