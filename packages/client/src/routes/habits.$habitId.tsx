import type { Habit_HabitListFragment } from '@/__generated__/graphql.js';
import { graphql } from '@/__generated__/index.js';
import { HabitDetail } from '@/components/domain/habit/HabitDetail';
import { HabitForm } from '@/components/domain/habit/HabitForm';
import { useReadQuery } from '@apollo/client';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

const GET_HABIT_FOR_DETAIL = graphql(`
  query GetMyHabitsForDetail($id:String!) {
    habit(where: {id: {eq: $id} }) {
      ...Habit_HabitList
    }
  }
`);

export const Route = createFileRoute('/habits/$habitId')({
  component: HabitDetailPage,
  loader: ({ params, context }) => ({
    GET_HABIT_FOR_DETAIL: context.preloadQuery(GET_HABIT_FOR_DETAIL, {
      variables: { id: params.habitId },
    }),
  }),
});

type Habit = Habit_HabitListFragment;

function HabitDetailPage() {
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const { GET_HABIT_FOR_DETAIL } = Route.useLoaderData();

  const { data } = useReadQuery(GET_HABIT_FOR_DETAIL);

  return (
    <div className="container mx-auto flex-1 overflow-y-auto px-4 py-6">
      <HabitDetail
        habit={data.habit}
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
