import type {
  TodoOrderBy,
  Todo_TodoListFragment,
} from '@/__generated__/graphql.js';
import { graphql } from '@/__generated__/index.js';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClipboardList, Plus } from 'lucide-react';
import { useState } from 'react';
import { TodoForm } from './TodoForm';
import { TodoItem } from './TodoItem';

export type { TodoOrderBy };

const SORT_OPTIONS: { value: string; label: string; orderBy: TodoOrderBy }[] = [
  {
    value: 'priority_desc',
    label: 'Priority: High → Low',
    orderBy: {
      priority: { direction: 'desc', priority: 1 },
      createdAt: { direction: 'desc', priority: 2 },
    },
  },
  {
    value: 'priority_asc',
    label: 'Priority: Low → High',
    orderBy: {
      priority: { direction: 'asc', priority: 1 },
      createdAt: { direction: 'desc', priority: 2 },
    },
  },
  {
    value: 'scheduled_asc',
    label: 'Scheduled time',
    orderBy: {
      scheduledAt: { direction: 'asc', priority: 1 },
      priority: { direction: 'desc', priority: 2 },
    },
  },
  {
    value: 'created_desc',
    label: 'Newest first',
    orderBy: { createdAt: { direction: 'desc', priority: 1 } },
  },
  {
    value: 'created_asc',
    label: 'Oldest first',
    orderBy: { createdAt: { direction: 'asc', priority: 1 } },
  },
  {
    value: 'title_asc',
    label: 'Title A → Z',
    orderBy: { title: { direction: 'asc', priority: 1 } },
  },
];

export const TODO_LIST_FRAGMENT = graphql(`
  fragment Todo_TodoList on Todo {
    id
    title
    description
    priority
    estimatedLength
    list {
      id
      name
    }
    activityType {
      id
      name
      color
    }
    dueAt
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
  sortKey?: string;
  onSortChange?: (key: string, orderBy: TodoOrderBy) => void;
};

export function TodoList({
  items,
  loading,
  error,
  sortKey = 'priority_desc',
  onSortChange,
}: TodoListProps) {
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
              {onSortChange && (
                <Select
                  value={sortKey}
                  onValueChange={(key) => {
                    const opt = SORT_OPTIONS.find((o) => o.value === key);
                    if (opt) onSortChange(key, opt.orderBy);
                  }}
                >
                  <SelectTrigger className="h-8 w-[180px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="text-xs"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
            <p className="text-destructive text-sm">
              Error loading todos: {error.message}
            </p>
          )}
          {!loading &&
            visibleItems.length === 0 &&
            (items.length > 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                All todos completed! 🎉
              </p>
            ) : (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <div className="rounded-full bg-muted p-3">
                  <ClipboardList className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">No todos yet</p>
                  <p className="text-sm text-muted-foreground">
                    Add your first todo to get started
                  </p>
                </div>
                <Button size="sm" onClick={openCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create todo
                </Button>
              </div>
            ))}
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
