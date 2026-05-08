# Client Patterns

React + Vite + Apollo Client + TanStack Router + TanStack Form + ShadCN/Radix + Tailwind.

## Installed ShadCN Components

Only use components that are already installed — do not add new ones without checking first:

`button` `card` `dialog` `field` `form` `input` `label` `select` `tabs` `textarea` `tooltip`

Also present: `inline-length-edit` (custom), `route-error` (custom error boundary component).

## Error Handling Conventions

- **Mutation errors** → toast notification
- **Form validation errors** → inline, beneath the relevant field
- **Route/render crashes** → `<RouteError>` error boundary (`src/components/ui/route-error.tsx`)

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

## Nav Structure

Top nav (hidden during onboarding): **Dashboard · Todos · Habits · Time Blocks · Activity Types · Stats** + Settings icon + Sign out + dark mode toggle.

Dark mode is fully supported — toggle stored in `localStorage.theme`, falls back to `prefers-color-scheme`. All new UI **must** include `dark:` Tailwind variants. The `dark` class is toggled on `document.documentElement`.

## Onboarding Flow

New users are redirected to `/onboarding` automatically (before dashboard) if `localStorage.onboarding_done` is not set. The wizard has 4 steps:

1. Activity Types (required)
2. Time Blocks (required)
3. Habits (optional — skippable)
4. Todos (optional — skippable)

Completion sets `localStorage.onboarding_done = '1'`. Re-runnable from Settings with `?force=true`. The auth guard in `__root.tsx` handles the redirect — do not replicate this logic elsewhere.

## Routes

File-based routes under `packages/client/src/routes/`. Key routes:

| File | Path | Notes |
|------|------|-------|
| `__root.tsx` | `/` | Layout + auth guard — redirects to `/login` if no token, `/onboarding` if not set up |
| `login.tsx` | `/login` | Magic-link request form |
| `auth.verify.tsx` | `/auth/verify` | Consumes magic-link token, stores JWT, redirects |
| `onboarding.tsx` | `/onboarding?step=1` | 4-step setup wizard |
| `dashboard.tsx` | `/dashboard` | Main schedule view |
| `todos.tsx` | `/todos` | Todo list |
| `habits.tsx` | `/habits` | Habit list; nested `$habitId` route for detail |
| `time-blocks.tsx` | `/time-blocks` | Time block management |
| `activity-types.tsx` | `/activity-types` | Activity type management |
| `stats.tsx` | `/stats` | Stats overview with date range selector |
| `settings.tsx` | `/settings` | iCal feed URL + re-run onboarding wizard |

Auth flow: `requestMagicLink` → magic link logged to server console (and returned in dev) → user visits `/auth/verify?token=…` → `verifyMagicLink` returns `{ token, userId }` → store `token` as `auth_token` in `localStorage` → redirect to `/dashboard`.

## TanStack Router



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

`useAppForm` wraps TanStack Form with project-specific field components. Available fields:

| Component | Usage |
|-----------|-------|
| `form.InputField` | Text / number inputs |
| `form.TextAreaField` | Multi-line text |
| `form.SelectField` | Dropdown select |
| `form.Field` | Raw field wrapper (custom UI) |

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

## Dashboard Architecture

The dashboard is a two-panel layout (`lg:grid-cols-[1fr_320px]`):
- **Left / main**: `CalendarView` — react-big-calendar with DnD, day/week/month views
- **Right / sidebar**: `ScheduleView` — chronological list grouped by day

Both consume the same `mySchedule` data. The schedule query is **always week-scoped** (ISO Monday anchor) regardless of the calendar view mode. Timezone is synced to the user profile on every dashboard mount (fire-and-forget `myUpdateProfile`).

Time blocks load via `preloadQuery` in the route loader for faster initial paint. Schedule loads reactively as `weekStart` changes.

### CalendarView Conventions

react-big-calendar + DnD addon (`withDragAndDrop`). Week starts on Monday (`weekStartsOn: 1`), matching the server's ISO week convention.

**Event ID formats:**
- Background (time block): `${block.id}-${dayIndex}`
- Scheduled todo: `scheduled-todo-${todo.id}`
- Scheduled habit: `scheduled-habit-${habit.id}-${instanceIndex}`
- Completed todo: `completed-todo-${todo.id}`

**Event appearance:**
- Time blocks → background events (shaded, no border); hidden in month view
- Todos → prefixed `✓ `, bold border, line-through when completed
- Habits → prefixed `↻ `
- Past/completed → desaturated via `desaturateColor()` utility in CalendarView

**Drag-to-schedule:** currently only enabled for todos (`kind === 'todo'`). On drop, calls `myUpdateTodo({ id, scheduledAt: "YYYY-MM-DDTHH:mm:ss", manuallyScheduled: true })`. Naive local datetime (no `Z`). Habit drag is deferred — planned but not yet implemented.

**Filtering:** Incomplete items whose scheduled end has already passed are hidden from the calendar (they'll be rescheduled by the next writeback). They still appear in ScheduleView's unschedulable section.

**Completed todos** appear on the calendar at their actual `completedAt` time with the original estimated duration. Completed habits do not appear on the calendar.

### Uncompleting a Todo

```typescript
myUpdateTodo({ input: { id, completedAt: null } })
```

No dedicated mutation — use `myUpdateTodo` with `completedAt: null`.

### Unschedulable Items

Items with `!isScheduled` appear in ScheduleView under an "Unschedulable" heading with an amber warning icon linking to `/time-blocks`. The tooltip explains the reason (no activity type, no matching time block, or estimated length too long).

## Codegen

After adding/editing GraphQL operations:
```bash
npm run codegen   # regenerates packages/client/src/__generated__/
```

Types from `@/__generated__/graphql.js` are auto-imported — never write them by hand.
