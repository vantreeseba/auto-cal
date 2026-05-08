# Client Patterns

React + Vite + Apollo Client + TanStack Router + TanStack Form + ShadCN/Radix + Tailwind.

## Apollo Client Setup

```typescript
// packages/client/src/main.tsx
const httpLink = new HttpLink({
  uri: '/graphql',
  fetch: (uri, options) => {
    const token = localStorage.getItem('auth_token');
    const headers = new Headers(options?.headers as HeadersInit | undefined);
    if (token) headers.set('authorization', `Bearer ${token}`);
    return fetch(uri as RequestInfo, { ...(options as RequestInit), headers });
  },
});

const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors?.some((e) => e.message.includes('Not authenticated'))) {
    localStorage.removeItem('auth_token');
    window.location.replace('/login');
  }
});

const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: { watchQuery: { fetchPolicy: 'cache-and-network' } },
});
```

## TanStack Router

File-based routes under `packages/client/src/routes/`.

```typescript
// packages/client/src/routes/__root.tsx
export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootLayout,
  beforeLoad: async ({ location }) => {
    if (!localStorage.getItem('auth_token') && !location.pathname.startsWith('/login')) {
      throw redirect({ to: '/login' });
    }
  },
});
```

Router context carries `apolloClient` and `preloadQuery`:
```typescript
// packages/client/src/main.tsx
const router = createRouter({
  routeTree,
  context: {
    apolloClient: client,
    preloadQuery: createQueryPreloader(client),
  },
});
```

## GraphQL Operations (Colocated)

Operations live next to the component that uses them. Use `graphql()` from codegen output:

```typescript
import { graphql } from '@/__generated__/index.js';
import { useMutation, useQuery } from '@apollo/client';

const MY_TODOS = graphql(`
  query GetMyTodos($completed: Boolean) {
    myTodos(completed: $completed) {
      id
      title
      priority
      estimatedLength
      completedAt
      activityType { id name color }
    }
  }
`);

const CREATE_TODO = graphql(`
  mutation CreateTodo($input: CreateTodoArgs!) {
    myCreateTodo(input: $input) {
      id
      title
      priority
      estimatedLength
      activityType { id name color }
    }
  }
`);

// Usage
const { data, loading } = useQuery(MY_TODOS, { variables: { completed: false } });
const [createTodo] = useMutation(CREATE_TODO, { refetchQueries: ['GetMyTodos'] });
```

## Fragment Colocation

```typescript
// Colocate data requirements with the component
const TODO_ITEM_FRAGMENT = graphql(`
  fragment Todo_TodoListFragment on Todo {
    id
    title
    priority
    estimatedLength
    completedAt
    activityType { id name color }
  }
`);

type TodoItemProps = {
  todo: Todo_TodoListFragment;
};
```

## Form Pattern (TanStack Form)

```typescript
import { useAppForm } from '@/hooks/form-hook';

const form = useAppForm({
  defaultValues: { title: '', priority: 0, estimatedLength: 30 },
  onSubmit: async ({ value }) => {
    await createTodo({ variables: { input: value } });
  },
});

// In JSX:
<form.Field name="title">
  {(field) => <form.InputField field={field} label="Title" />}
</form.Field>
```

The `useAppForm` hook is defined in `packages/client/src/hooks/form-hook.ts` and wraps TanStack Form with project-specific UI field components.

## Component Structure

```
packages/client/src/components/
  ui/          — ShadCN primitives (Button, Card, Input, etc.)
  domain/      — Feature components organized by entity
    todo/      — TodoItem, TodoForm, TodoList
    habit/     — HabitItem, HabitForm
    time-block/ — TimeBlockItem, TimeBlockForm
```

## ShadCN + Tailwind Conventions

```typescript
import { cn } from '@/lib/utils';

// cn() merges class names with tailwind-merge + clsx
className={cn('base-classes', condition && 'conditional-class', className)}
```

Card layout pattern:
```tsx
<Card>
  <CardHeader className="pb-2">
    <CardTitle>{title}</CardTitle>
    <CardDescription>{description}</CardDescription>
  </CardHeader>
  <CardContent className="space-y-2">
    {/* content */}
  </CardContent>
  <CardFooter>
    {/* actions */}
  </CardFooter>
</Card>
```

## Utility Functions

```typescript
// packages/client/src/lib/utils.ts
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function priorityLabel(priority: number): string {
  if (priority >= 100) return 'Urgent';
  if (priority >= 50) return 'High';
  if (priority >= 25) return 'Medium';
  return 'Low';
}
```

## Codegen

After adding/editing GraphQL operations:
```bash
npm run codegen   # regenerates packages/client/src/__generated__/
```

Types from `@/__generated__/graphql.js` are auto-imported — never write them by hand.
