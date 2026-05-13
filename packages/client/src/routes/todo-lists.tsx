import { graphql } from '@/__generated__/index.js';
import { TodoListList } from '@/components/domain/todo-list/TodoListList';
import { RouteError } from '@/components/ui/route-error';
import { useQuery } from '@apollo/client/react';
import { createFileRoute } from '@tanstack/react-router';

const GET_MY_TODO_LISTS = graphql(`
  query GetMyTodoLists {
    myTodoLists {
      ...TodoList_TodoListList
    }
  }
`);

export const Route = createFileRoute('/todo-lists')({
  component: TodoListsPage,
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
});

function TodoListsPage() {
  const { data, loading, error } = useQuery(GET_MY_TODO_LISTS, {
    fetchPolicy: 'cache-and-network',
  });

  return (
    <div className="container mx-auto flex-1 overflow-y-auto px-4 py-6">
      {error && (
        <p className="text-destructive text-sm">
          Error loading todo lists: {error.message}
        </p>
      )}
      {loading && !data && (
        <p className="text-muted-foreground text-sm">Loading…</p>
      )}
      <TodoListList items={data?.myTodoLists ?? []} />
    </div>
  );
}
