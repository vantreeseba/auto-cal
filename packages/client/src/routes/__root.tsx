import { cn } from '@/lib/utils';
import type { MyRouterContext } from '@/main.js';
import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/todos', label: 'Todos' },
  { to: '/habits', label: 'Habits' },
  { to: '/time-blocks', label: 'Time Blocks' },
  { to: '/activity-types', label: 'Activity Types' },
] as const;

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

// A custom component to render when an error occurs
function RootErrorComponent({ error }: { error: unknown }) {
  // You can use the error object to display different messages or log it
  return (
    <div>
      <h1>Something Went Wrong Globally!</h1>
      <p>{(error as Error).message}</p>
      {/* You might also include a link back to the homepage */}
    </div>
  );
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootLayout,
  errorComponent: RootErrorComponent,
});
