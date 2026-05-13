import type { TodoList_TodoListListFragment } from '@/__generated__/graphql.js';
import { graphql } from '@/__generated__/index.js';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ListTodo, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { TodoListForm } from './TodoListForm';

export const TODO_LIST_LIST_FRAGMENT = graphql(`
  fragment TodoList_TodoListList on TodoList {
    id
    name
    description
    defaultPriority
    defaultEstimatedLength
    activityType {
      id
      name
      color
    }
  }
`);

type TodoList = TodoList_TodoListListFragment;

type TodoListListProps = {
  items: TodoList[];
};

export function TodoListList({ items }: TodoListListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TodoList | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(list: TodoList) {
    setEditing(list);
    setFormOpen(true);
  }

  function handleFormOpenChange(open: boolean) {
    setFormOpen(open);
    if (!open) setEditing(null);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Todo Lists</CardTitle>
              <CardDescription>
                Group todos by activity. Each list has an activity type and
                defaults for new todos.
              </CardDescription>
            </div>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New List
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="rounded-full bg-muted p-3">
                <ListTodo className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">No todo lists yet</p>
                <p className="text-sm text-muted-foreground">
                  Create one to start adding todos
                </p>
              </div>
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create list
              </Button>
            </div>
          )}
          <div className="space-y-2">
            {items.map((list) => (
              <div
                key={list.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  {list.activityType && (
                    <span
                      className="inline-block h-4 w-4 rounded-full border border-border"
                      style={{ backgroundColor: list.activityType.color }}
                    />
                  )}
                  <div>
                    <span className="text-sm font-medium">{list.name}</span>
                    {list.description && (
                      <p className="text-xs text-muted-foreground">
                        {list.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Defaults: priority {list.defaultPriority} ·{' '}
                      {list.defaultEstimatedLength}m
                    </p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openEdit(list)}
                  aria-label={`Edit ${list.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <TodoListForm
        {...(editing !== null ? { list: editing } : {})}
        open={formOpen}
        onOpenChange={handleFormOpenChange}
      />
    </>
  );
}
