import { RouteError } from '@/components/ui/route-error';
import { cn } from '@/lib/utils';
import type { MyRouterContext } from '@/main.js';
import {
  Link,
  Outlet,
  createRootRouteWithContext,
  redirect,
  useNavigate,
} from '@tanstack/react-router';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/todos', label: 'Todos' },
  { to: '/habits', label: 'Habits' },
  { to: '/time-blocks', label: 'Time Blocks' },
  { to: '/activity-types', label: 'Activity Types' },
] as const;

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
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <header className="flex-shrink-0 border-b bg-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold leading-none">Auto Cal</h1>
              <p className="text-xs text-muted-foreground">
                Smart todo and habit scheduling
              </p>
            </div>
            <nav className="flex items-center gap-1">
              {NAV_LINKS.map(({ to, label }) => {
                return (
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
                );
              })}
              <LogoutButton />
            </nav>
          </div>
        </div>
      </header>

      {/* Page content — fills remaining height */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

function RootErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <header className="flex-shrink-0 border-b bg-white">
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
