import type { TodoListFieldsFragment } from '@/__generated__/graphql.js';
import { graphql } from '@/__generated__/index.js';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useMutation } from '@apollo/client';
import { Check, Pencil } from 'lucide-react';

const COMPLETE_TODO = graphql(`
  mutation CompleteTodo($id: ID!) {
    myCompleteTodo(id: $id) {
      id
      completedAt
    }
  }
`);

type Todo = TodoListFieldsFragment;

type TodoItemProps = {
  todo: Todo;
  onEdit: (todo: Todo) => void;
};

export function TodoItem({ todo, onEdit }: TodoItemProps) {
  const isCompleted = todo.completedAt !== null;

  const [completeTodo, { loading: completing }] = useMutation(COMPLETE_TODO, {
    refetchQueries: ['GetMyTodos'],
  });

  return (
    <Card className={isCompleted ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle
              className={`text-lg ${isCompleted ? 'line-through text-muted-foreground' : ''}`}
            >
              {todo.title}
            </CardTitle>
            <CardDescription>
              {todo.activityType && (
                <span className="inline-flex items-center gap-1">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: todo.activityType.color }}
                  />
                  {todo.activityType.name}
                  {' • '}
                </span>
              )}
              {todo.estimatedLength} min • Priority: {todo.priority}
              {isCompleted && (
                <span className="ml-2 text-green-600 font-medium">✓ Done</span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            {!isCompleted && (
              <Button
                size="icon"
                variant="ghost"
                disabled={completing}
                onClick={() => completeTodo({ variables: { id: todo.id } })}
                aria-label={`Mark ${todo.title} as complete`}
                className="text-muted-foreground hover:text-green-600"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onEdit(todo)}
              aria-label={`Edit ${todo.title}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {todo.description && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{todo.description}</p>
        </CardContent>
      )}
    </Card>
  );
}
