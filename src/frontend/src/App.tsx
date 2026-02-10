import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import LogRunPage from './pages/LogRunPage';
import HistoryPage from './pages/HistoryPage';
import RunLogDetailPage from './pages/RunLogDetailPage';
import SettingsPage from './pages/SettingsPage';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function Layout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const logRunRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/log',
  component: LogRunPage,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: HistoryPage,
});

const historyDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history/$logId',
  component: RunLogDetailPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  logRunRoute,
  historyRoute,
  historyDetailRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!identity) {
      queryClient.clear();
    }
  }, [identity, queryClient]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
