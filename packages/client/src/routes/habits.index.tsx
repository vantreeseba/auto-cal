import { graphql } from '@/__generated__/index.js';
import { HabitList } from '@/components/domain/habit/HabitList';
import { RouteError } from '@/components/ui/route-error';
import { useReadQuery } from '@apollo/client';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const GET_MY_HABITS = graphql(`
  query GetMyHabits {
    myHabits {
      ...Habit_HabitList
    }
  }
`);

export const Route = createFileRoute('/habits/')({
  component: HabitsPage,
  errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
  loader: ({ context }) => ({
    GET_MY_HABITS: context.preloadQuery(GET_MY_HABITS),
  }),
});

function HabitsPage() {
  const { GET_MY_HABITS } = Route.useLoaderData();
  const { data } = useReadQuery(GET_MY_HABITS);
  const navigate = useNavigate();
  return (
    <div className="container mx-auto flex-1 overflow-y-auto px-4 py-6">
      <HabitList
        items={data?.myHabits ?? []}
        onSelect={(habit) =>
          navigate({ to: '/habits/$habitId', params: { habitId: habit.id } })
        }
      />
    </div>
  );
}
