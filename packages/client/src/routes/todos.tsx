import { TODO_LIST_FRAGMENT } from '@/components/domain/todo/TodoList';
import { TodoList } from '@/components/domain/todo/TodoList';
import { RouteError } from '@/components/ui/route-error';
import { gql, useQuery } from '@apollo/client';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

const GET_MY_TODOS = gql`
  query GetMyTodos($orderBy: String) {
    myTodos(orderBy: $orderBy) {
      ...Todo_TodoList
    }
  }
  ${TODO_LIST_FRAGMENT}
`;

export const Route = createFileRoute('/todos')({
  component: TodosPage,
  errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
});

function TodosPage() {
  const [orderBy, setOrderBy] = useState('priority_desc');
  const { data, loading, error } = useQuery(GET_MY_TODOS, {
    variables: { orderBy },
    fetchPolicy: 'cache-and-network',
  });
  return (
    <div className="container mx-auto flex-1 overflow-y-auto px-4 py-6">
      <TodoList
        items={data?.myTodos ?? []}
        loading={loading}
        error={error ?? null}
        orderBy={orderBy}
        onOrderByChange={setOrderBy}
      />
    </div>
  );
}
