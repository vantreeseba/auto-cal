import { RouteError } from '@/components/ui/route-error';
import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/habits')({
  component: HabitsLayout,
  errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
});

function HabitsLayout() {
  return <Outlet />;
}
