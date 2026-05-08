import type { Habit_HabitListFragment } from '@/__generated__/graphql.js';
import { graphql } from '@/__generated__/index.js';
import { HabitDetail } from '@/components/domain/habit/HabitDetail';
import { HabitForm } from '@/components/domain/habit/HabitForm';
import { RouteError } from '@/components/ui/route-error';
import { useReadQuery } from '@apollo/client/react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

const GET_HABIT_FOR_DETAIL = graphql(`
  query GetMyHabits {
    myHabits {
      ...Habit_HabitList
    }
  }
`);

export const Route = createFileRoute('/habits/$habitId')({
  component: HabitDetailPage,
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
  loader: ({ context }) => ({
    habits: context.preloadQuery(GET_HABIT_FOR_DETAIL),
  }),
});

type Habit = Habit_HabitListFragment;

function HabitDetailPage() {
  const navigate = useNavigate();
  const { habitId } = Route.useParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const { habits: habitsRef } = Route.useLoaderData();

  const { data } = useReadQuery(habitsRef);
  const habit = data.myHabits.find((h) => h.id === habitId);

  if (!habit) {
    return (
      <div className="container mx-auto flex-1 overflow-y-auto px-4 py-6">
        <p className="text-muted-foreground">Habit not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex-1 overflow-y-auto px-4 py-6">
      <HabitDetail
        habit={habit}
        onBack={() => navigate({ to: '/habits' })}
        onEdit={(h) => {
          setEditingHabit(h);
          setFormOpen(true);
        }}
      />
      <HabitForm
        {...(editingHabit !== null ? { habit: editingHabit } : {})}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingHabit(null);
        }}
      />
    </div>
  );
}
