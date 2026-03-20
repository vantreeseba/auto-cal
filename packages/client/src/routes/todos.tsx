import { graphql } from '@/__generated__/index.js';
import { TodoList } from '@/components/domain/todo/TodoList';
import { useReadQuery } from '@apollo/client';
import { createFileRoute } from '@tanstack/react-router';

const GET_MY_TODOS = graphql(`
  query GetMyTodosV2 {
    myTodos {
      ...Todo_TodoList
    }
  }
`);

export const Route = createFileRoute('/todos')({
  component: TodosPage,
  loader: ({ context }) => ({
    GET_MY_TODOS: context.preloadQuery(GET_MY_TODOS),
  }),
});

function TodosPage() {
  const { GET_MY_TODOS } = Route.useLoaderData();
  const { data } = useReadQuery(GET_MY_TODOS);
  return (
    <div className="container mx-auto flex-1 overflow-y-auto px-4 py-6">
      <TodoList items={data?.myTodos ?? []} />
    </div>
  );
}
