import type { Habit_HabitListFragment } from '@/__generated__/graphql.js';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Pencil } from 'lucide-react';

type Habit = Habit_HabitListFragment;

type HabitItemProps = {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onSelect: (habit: Habit) => void;
};

export function HabitItem({ habit, onEdit, onSelect }: HabitItemProps) {
  return (
    <Card
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => onSelect(habit)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{habit.title}</CardTitle>
            <CardDescription>
              {habit.activityType && (
                <span className="inline-flex items-center gap-1">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: habit.activityType.color }}
                  />
                  {habit.activityType.name}
                  {' • '}
                </span>
              )}
              {habit.estimatedLength} min • {habit.frequencyCount}x per{' '}
              {habit.frequencyUnit} • Priority: {habit.priority}
            </CardDescription>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(habit);
            }}
            aria-label={`Edit ${habit.title}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      {habit.description && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{habit.description}</p>
        </CardContent>
      )}
    </Card>
  );
}
