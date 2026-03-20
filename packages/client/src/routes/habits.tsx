import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/habits')({
  component: HabitsLayout,
});

function HabitsLayout() {
  return <Outlet />;
}
