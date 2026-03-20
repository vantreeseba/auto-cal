import type { Todo_TodoListFragment } from '@/__generated__/graphql.js';
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
import { TodoForm } from './TodoForm';
import { TodoItem } from './TodoItem';

export const TODO_LIST_FRAGMENT = graphql(`
  fragment Todo_TodoList on Todo {
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
    scheduledAt
    completedAt
    createdAt
  }
`);

type Todo = Todo_TodoListFragment;

type TodoListProps = {
  items: Todo[];
  loading?: boolean;
  error?: Error | null;
};

export function TodoList({ items, loading, error }: TodoListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const visibleItems = showCompleted
    ? items
    : items.filter((t) => t.completedAt === null);

  const completedCount = items.filter((t) => t.completedAt !== null).length;

  function openCreate() {
    setEditingTodo(null);
    setFormOpen(true);
  }

  function openEdit(todo: Todo) {
    setEditingTodo(todo);
    setFormOpen(true);
  }

  function handleFormOpenChange(open: boolean) {
    setFormOpen(open);
    if (!open) setEditingTodo(null);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Todos</CardTitle>
              <CardDescription>
                Single-time tasks scheduled in your time blocks
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {completedCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowCompleted((v) => !v)}
                  className="text-muted-foreground"
                >
                  {showCompleted
                    ? `Hide completed (${completedCount})`
                    : `Show completed (${completedCount})`}
                </Button>
              )}
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                New Todo
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-muted-foreground">Loading todos…</p>}
          {error && (
            <p className="text-destructive">
              Error loading todos: {error.message}
            </p>
          )}
          {!loading && visibleItems.length === 0 && (
            <p className="text-muted-foreground">
              {showCompleted
                ? 'No todos yet. Create your first one!'
                : items.length > 0
                  ? 'All todos completed! 🎉'
                  : 'No todos yet. Create your first one!'}
            </p>
          )}
          <div className="space-y-2">
            {visibleItems.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onEdit={openEdit} />
            ))}
          </div>
        </CardContent>
      </Card>

      <TodoForm
        {...(editingTodo !== null ? { todo: editingTodo } : {})}
        open={formOpen}
        onOpenChange={handleFormOpenChange}
      />
    </>
  );
}
