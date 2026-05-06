import { RouteError } from '@/components/ui/route-error';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { MyRouterContext } from '@/main.js';
import {
  Link,
  Outlet,
  createRootRouteWithContext,
  redirect,
  useNavigate,
} from '@tanstack/react-router';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/todos', label: 'Todos' },
  { to: '/habits', label: 'Habits' },
  { to: '/time-blocks', label: 'Time Blocks' },
  { to: '/activity-types', label: 'Activity Types' },
  { to: '/stats', label: 'Stats' },
] as const;

function getInitialDark(): boolean {
  const stored = localStorage.getItem('theme');
  if (stored) return stored === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function useDarkMode() {
  const [dark, setDark] = useState(getInitialDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return [dark, setDark] as const;
}

function LogoutButton() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('auth_token');
    navigate({ to: '/login' });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      Sign out
    </button>
  );
}

function RootLayout() {
  const [dark, setDark] = useDarkMode();

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <header className="flex-shrink-0 border-b bg-card">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold leading-none">Auto Cal</h1>
                <p className="text-xs text-muted-foreground">
                  Smart todo and habit scheduling
                </p>
              </div>
              <nav className="flex items-center gap-1">
                {NAV_LINKS.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    activeProps={{
                      className: 'bg-primary text-primary-foreground',
                    }}
                    inactiveProps={{
                      className:
                        'text-muted-foreground hover:bg-muted hover:text-foreground',
                    }}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    )}
                  >
                    {label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => setDark((d) => !d)}
                  aria-label={
                    dark ? 'Switch to light mode' : 'Switch to dark mode'
                  }
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {dark ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </button>
                <LogoutButton />
              </nav>
            </div>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  );
}

function RootErrorComponent({
  error,
  reset,
}: { error: unknown; reset: () => void }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex-shrink-0 border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-2xl font-bold leading-none">Auto Cal</h1>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center">
        <RouteError error={error} reset={reset} />
      </main>
    </div>
  );
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: ({ location }) => {
    const publicPaths = ['/login', '/auth/verify'];
    const isPublic = publicPaths.some((p) => location.pathname.startsWith(p));
    if (!isPublic && !localStorage.getItem('auth_token')) {
      throw redirect({ to: '/login' });
    }
  },
  component: RootLayout,
  errorComponent: RootErrorComponent,
});
