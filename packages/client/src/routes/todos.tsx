import { TODO_LIST_FRAGMENT, type TodoOrderBy } from '@/components/domain/todo/TodoList';
import { TodoList } from '@/components/domain/todo/TodoList';
import { RouteError } from '@/components/ui/route-error';
import { gql, useQuery } from '@apollo/client';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

const GET_MY_TODOS = gql`
  query GetMyTodos($orderBy: TodoOrderBy) {
    myTodos(orderBy: $orderBy) {
      ...Todo_TodoList
    }
  }
  ${TODO_LIST_FRAGMENT}
`;

const DEFAULT_ORDER_BY: TodoOrderBy = {
  priority: { direction: 'desc', priority: 1 },
  createdAt: { direction: 'desc', priority: 2 },
};

export const Route = createFileRoute('/todos')({
  component: TodosPage,
  errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
});

function TodosPage() {
  const [sortKey, setSortKey] = useState('priority_desc');
  const [orderBy, setOrderBy] = useState<TodoOrderBy>(DEFAULT_ORDER_BY);
  const { data, loading, error } = useQuery(GET_MY_TODOS, {
    variables: { orderBy },
    fetchPolicy: 'cache-and-network',
  });

  function handleSortChange(key: string, nextOrderBy: TodoOrderBy) {
    setSortKey(key);
    setOrderBy(nextOrderBy);
  }

  return (
    <div className="container mx-auto flex-1 overflow-y-auto px-4 py-6">
      <TodoList
        items={data?.myTodos ?? []}
        loading={loading}
        error={error ?? null}
        sortKey={sortKey}
        onSortChange={handleSortChange}
      />
    </div>
  );
}
