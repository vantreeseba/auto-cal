import type {
  TodoList_TodoListListFragment,
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
import { ListTodo, Plus } from 'lucide-react';
import { useState } from 'react';
import { TodoListCard } from './TodoListCard';
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
type Todo = Todo_TodoListFragment;

type TodoListListProps = {
  lists: TodoList[];
  todosByListId: Map<string, Todo[]>;
};

export function TodoListList({ lists, todosByListId }: TodoListListProps) {
  const [creatingList, setCreatingList] = useState(false);

  if (lists.length === 0) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Todos</CardTitle>
            <CardDescription>
              Lists group todos by activity type. Create one to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
              <Button size="sm" onClick={() => setCreatingList(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create list
              </Button>
            </div>
          </CardContent>
        </Card>

        <TodoListForm open={creatingList} onOpenChange={setCreatingList} />
      </>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Todos</h2>
          <p className="text-sm text-muted-foreground">
            One card per list. Click a list title to edit it; click the pencil
            on a todo to open the full form.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreatingList(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New List
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {lists.map((list) => (
          <TodoListCard
            key={list.id}
            list={list}
            todos={todosByListId.get(list.id) ?? []}
          />
        ))}
      </div>

      <TodoListForm open={creatingList} onOpenChange={setCreatingList} />
    </>
  );
}
