import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Home, Plus, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BottomNav() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/log', icon: Plus, label: 'Log Run' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = currentPath === item.path || (item.path === '/history' && currentPath.startsWith('/history'));
          const Icon = item.icon;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: item.path })}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                isActive ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
