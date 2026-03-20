import type { Habit_HabitListFragment } from '@/__generated__/graphql.js';
import { graphql } from '@/__generated__/index.js';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { HabitForm } from './HabitForm';
import { HabitItem } from './HabitItem';

export const HABIT_LIST_FRAGMENT = graphql(`
  fragment Habit_HabitList on Habit {
    id
    title
    description
    priority
    estimatedLength
    activityType {
      id
      name
      color
    }
    frequencyCount
    frequencyUnit
    createdAt
  }
`);

type Habit = Habit_HabitListFragment;

type HabitListProps = {
  items: Habit[];
  onSelect: (habit: Habit) => void;
};

export function HabitList({ items, onSelect }: HabitListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  function openCreate() {
    setEditingHabit(null);
    setFormOpen(true);
  }

  function openEdit(habit: Habit) {
    setEditingHabit(habit);
    setFormOpen(true);
  }

  function handleFormOpenChange(open: boolean) {
    setFormOpen(open);
    if (!open) setEditingHabit(null);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Habits</CardTitle>
              <CardDescription>
                Recurring tasks scheduled regularly
              </CardDescription>
            </div>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Habit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 && (
            <p className="text-muted-foreground">
              No habits yet. Create your first one!
            </p>
          )}
          <div className="space-y-2">
            {items.map((habit) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                onEdit={openEdit}
                onSelect={onSelect}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <HabitForm
        {...(editingHabit !== null ? { habit: editingHabit } : {})}
        open={formOpen}
        onOpenChange={handleFormOpenChange}
      />
    </>
  );
}
