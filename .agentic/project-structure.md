# Project Structure — Auto Cal

## 1. Project Overview

Auto Cal is a smart todo and habit scheduling application. Users create **todos** (single-time tasks) and **habits** (repeated tasks) that are automatically scheduled within user-defined **time blocks** based on priority and activity type. The system tracks completion rates and provides insights by activity type.

The app is built as a **monorepo** with three packages:

| Package | Role |
|---------|------|
| `packages/db/` | Drizzle ORM schema, PGLite database layer |
| `packages/server/` | Node.js GraphQL API (Express + Apollo Server) |
| `packages/client/` | React + Vite + Apollo Client + ShadCN UI |

Key technology decisions: **Biome** for linting/formatting, **drizzle-graphql** for zero-duplication schema generation, **PGLite** for embedded Postgres (zero local setup), **experimental-strip-types** for zero-build-step Node server, and **--experimental-strip-types** for the server.

---

## 2. Package Structure

### `packages/db/` — Database Schema

```
packages/db/
├── src/
│   ├── index.ts          # PGLite singleton + Drizzle instance
│   └── models/
│       ├── enums.ts      # Enum constants (ACTIVITY_TYPES, FREQUENCY_UNITS)
│       ├── index.ts      # Re-exports all models
│       ├── users.ts      # Users table
│       ├── todos.ts      # Todos table
│       ├── activity_types.ts  # Activity types table
│       ├── habits.ts     # Habits table
│       ├── time_blocks.ts      # Time blocks table
│       └── habit_completions.ts  # Habit completions table
└── drizzle/              # Generated migrations (never edit manually)
```

### `packages/server/` — GraphQL Server

```
packages/server/
└── src/
    ├── index.ts           # Express + Apollo Server setup
    ├── context.ts         # GraphQL context (db, userId)
    └── schema/
        ├── index.ts       # buildSchema pipeline (drizzle-graphql auto-generated)
        └── resolvers.ts   # Custom queries, mutations, type extensions
```

Important conventions:
- Imports **must** include `.ts` extension
- Built for Node 22+ with `--experimental-strip-types` (zero build step)

### `packages/client/` — React Frontend

```
packages/client/
├── src/
│   ├── main.tsx           # App entry point, Apollo Provider setup
│   ├── App.tsx            # Main application component with tabs
│   ├── lib/utils.ts       # cn() utility for className merging
│   ├── components/
│   │   ├── domain/todo/   # Todo domain components
│   │   │   ├── TodoList.tsx
│   │   │   ├── TodoItem.tsx
│   │   │   └── TodoForm.tsx
│   │   └── ui/            # ShadCN UI components (Button, Card, Dialog, etc.)
│   ├── routes/
│   │   └── todos.tsx      # '/todos' route with GET_MY_TODOS query
│   └── __generated__/     # GraphQL Codegen output (gitignored)
│       ├── gql.ts         # ~30 typed GraphQL operations (~520 lines)
│       └── graphql.ts     # TypeScript types for GraphQL operations (generated)
└── (generated files)      # ~250 JS files (build output)
```

---

## 3. Database Schema

### 3.1 `todos` Table

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | Primary Key, `defaultRandom()` |
| `userId` | UUID | FK → users (cascade delete) |
| `title` | text | notNull |
| `description` | text | nullable |
| `priority` | integer | default 0 |
| `estimatedLength` | integer | notNull (minutes) |
| `activityTypeId` | UUID | FK → activity_types (set null) |
| `scheduledAt` | timestamp | nullable |
| `completedAt` | timestamp | nullable |
| `createdAt` | timestamp | defaultNow() |
| `updatedAt` | timestamp | defaultNow() |

**Inferred types:**
```typescript
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
```

### 3.2 `todos` Relations

- **User** (`todos.userId` → `users.id`) — cascade delete
- **ActivityType** (`todos.activityTypeId` → `activity_types.id`) — set null on delete

### 3.3 Other Tables

**`users`**

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | Primary Key |

**`activity_types`**

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| (activity type fields) | varies | per implementation |

**`habits`**

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| (habit-specific fields) | varies | per implementation |

**`time_blocks`**

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| (time block fields) | varies | per implementation |

**`habit_completions`**

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| (completion fields) | varies | per implementation |

All user-owned resources use **cascade deletes** for referential integrity. All timestamps use the Postgres `timestamp` type.

---

## 4. GraphQL Schema

The GraphQL schema is generated from the Drizzle tables via `drizzle-graphql`'s `buildSchema(db)`, then extended with custom resolvers and types.

### 4.1 Query: `myTodos`

Fetches the authenticated user's todos with filtering and ordering.

**Input Arguments:**

| Argument | Type | Description |
|----------|------|-------------|
| `activityTypeId` | `String` (optional) | Filter by activity type |
| `completed` | `Boolean` (optional) | Filter by completion status |

**Return type:** `[Todo!]!`

**Resolver logic:**
- Guard clause: rejects if no `context.userId`
- Query `todos` filtered by `userId`, `activityTypeId` (if provided), and `completed` status
- Ordered by **priority descending**, then **createdAt descending**

### 4.2 Mutation: `myCreateTodo`

Creates a new todo.

**Input (`CreateTodoInput`):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `String!` | Yes | Todo title |
| `description` | `String` | No | Optional description |
| `priority` | `Int` | No | Default: 0 |
| `estimatedLength` | `Int!` | Yes | Estimated duration in minutes |
| `activityTypeId` | `String` | No | Optional activity type |
| `scheduledAt` | `String` | No | Optional scheduled time |

**Return type:** `Todo` (includes `activityType` via custom resolver)

**Resolver logic:**
1. Guard clause: rejects if no `context.userId`
2. Zod validation: `CreateTodoInput.parse(input)` at resolver boundary
3. Insert into `todos` with `userId` from context
4. Returns the created todo with the associated `activityType` populated

### 4.3 Mutation: `myUpdateTodo`

Updates an existing todo.

**Input (`UpdateTodoInput`):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `String!` | Yes | Todo ID to update |
| `title` | `String` | No | New title |
| `description` | `String` | No | New description |
| `priority` | `Int` | No | New priority |
| `estimatedLength` | `Int` | No | New estimated length |
| `activityTypeId` | `String` | No | New activity type |
| `scheduledAt` | `String` | No | New scheduled time |

**Return type:** `Todo`

**Resolver logic:**
1. Auth + ownership checks
2. Zod validation
3. Partial update on existing todo
4. Returns updated todo with `activityType`

### 4.4 Mutation: `myCompleteTodo`

Marks a todo as complete.

**Input:**

| Field | Type | Required |
|-------|------|----------|
| `id` | `String!` | Yes |

**Return type:** `Todo` (with `completedAt` set)

**Resolver logic:**
1. Auth + ownership checks
2. Update `completedAt` to current timestamp
3. Return updated todo

### 4.5 Mutation: `myDeleteTodo`

Deletes a todo.

**Input:**

| Field | Type | Required |
|-------|------|----------|
| `id` | `String!` | Yes |

**Return type:** `Boolean`

**Resolver logic:**
1. Auth + ownership checks
2. Hard delete from `todos` table
3. Returns `true` on success

### 4.6 Extended Types

| Type | Additional Fields |
|------|-------------------|
| `Todo` | `activityType: ActivityType` — resolved in custom resolver via activity lookup |

---

## 5. Client Components

### 5.1 Routes

| Path | File | Query | Component |
|------|------|-------|-----------|
| `/todos` | `src/routes/todos.tsx` | `GET_MY_TODOS` | `<TodoList>` |

### 5.2 Todo Domain Components

#### `<TodoList>` — `src/components/domain/todo/TodoList.tsx`

- Displays the `GET_MY_TODOS` data via `Todo_TodoListFragment` fragment
- Provides controls to show/hide completedTodos
- "New Todo" button to open the create dialog

#### `<TodoItem>` — `src/components/domain/todo/TodoItem.tsx`

- Card displaying a single todo with:
  - **Title** — primary display text
  - **Activity type badge** — color-coded by activity
  - **Estimated length** — displayed as duration
  - **Priority** — shown visually by level
  - **Completion state** — clickable completion toggle
- Uses the `COMPLETE_TODO` mutation for inline completion
- Accepts an `onEdit` callback to open the edit form

#### `<TodoForm>` — `src/components/domain/todo/TodoForm.tsx`

- Dialog-based form for creating and updating todos
- Fields:
  - **Title** — text input
  - **Description** — text area
  - **Activity type** — `ActivityTypeSelect` dropdown
  - **Priority** — selector (Low / Medium / High / Urgent)
  - **Duration** — range selector (15 min to 480 min)
- Handles both creation and update via `CREATE_TODO` and `UPDATE_TODO` mutations

### 5.3 ShadCN UI Components (used by todo components)

`Button`, `Card`, `Dialog`, `Form`, and related primitives from `src/components/ui/`.

---

## 6. Server Resolvers — Todo Implementation

Todo resolvers live in `packages/server/src/schema/resolvers.ts` and follow a consistent pattern:

### Resolver Pipeline

```
Resolver entry point
  → Guard clause (auth check: if (!context.userId) throw)
  → Guard clause (ownership check: userId === context.userId)
  → Zod validation (parse input at boundary)
  → Database operation (drizzle query)
  → Return result with custom joins (activityType)
```

### Key Implementation Details

1. **Schema extension** — Each resolver adds SDL to the auto-generated base schema:
   ```typescript
   const extended = extendSchema(schema, parse(`
     extend type Query { myTodos: [todos!]! }
     extend type Mutation { myCreateTodo(...): Todo }
   `));
   ```

2. **Activity type resolution** — The `activityType` field on `Todo` is resolved in the custom resolver by joining to `activity_types`, not in the base drizzle-graphql schema.

3. **Zod validation** — All mutation inputs use Zod schemas at the resolver boundary:
   ```typescript
   const input = CreateTodoInput.parse(args.input);
   ```

4. **Error handling** — Never suppressed. Fail fast:
   ```typescript
   if (!context.userId) throw new Error('Not authenticated');
   if (todo.userId !== context.userId) throw new Error('Forbidden');
   ```

---

## 7. Key Patterns

### Type Inference (No Manual Duplication)

Types are inferred directly from the Drizzle schema:

```typescript
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
```

These are re-exported from `packages/db/src/models/index.ts` and consumed by the server and client packages.

### Enum Pattern

```typescript
// packages/db/src/models/enums.ts
export const ACTIVITY_TYPES = ['work', 'exercise', 'learning'] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];
```

### Validation Pattern (Zod at Resolver Boundary)

Every mutation validates its input with Zod before touching the database:

```typescript
const input = CreateTodoInput.parse(args.input); // throws ZodError if invalid
```

### Guard Clause Pattern

Checks are performed in order — auth, existence, ownership — with early returns:

```typescript
// 1. Auth
if (!context.userId) throw new Error('Not authenticated');

// 2. Existence
const todo = await context.db.query.todos.findFirst({
  where: eq(todos.id, id),
});
if (!todo) throw new Error(`Todo ${id} not found`);

// 3. Ownership
if (todo.userId !== context.userId) throw new Error('Forbidden');
```

### drizzle-graphql Schema Generation

The base GraphQL schema is auto-generated from the Drizzle tables, then extended:

```typescript
const drizzleSchema = buildSchema(db);    // auto-generated from tables
export const schema = applyCustomResolvers(drizzleSchema); // extend with custom logic
```

This eliminates the need to manually write type fields, query definitions, and mutation signatures for CRUD operations.

### UUID for All IDs

Every primary key uses `uuid` with `pgUUID` and `defaultRandom()`. No auto-incrementing integers.

### GraphQL Operations Colocated with Components

Operations use `gql` from `@apollo/client` and live alongside the components that consume them. There is no centralized `queries.ts` file.

### GraphQL Codegen

TypeScript types for GraphQL operations are auto-generated and kept in `src/__generated__/`:
- `gql.ts` — compiled GraphQL operations
- `graphql.ts` — TypeScript types

Regenerate after adding/modifying operations:

```bash
npm run codegen  # requires server running
```

---

## 8. Generated Types Structure

Generated code lives in `packages/client/src/__generated__/` and is **gitignored** (never committed).

```
packages/client/src/__generated__/
├── gql.ts        # Compiled GraphQL operations (~30 operations, ~520 lines)
└── graphql.ts    # TypeScript types for operations (~200 lines)
```

### How Types Flow Through the Stack

```
1. GraphQL operations (gql tagged) in components
       ↓
2. GraphQL Codegen reads operations
       ↓
3. graphql.ts — TypeScript types generated (queries, mutations, inputs)
       ↓
4. TypeScript types consumed by components via auto-import
```

The generated `graphql.ts` types include:
- Typed query results (e.g., `GetMyTodosQuery`, `GetMyTodosQueryVariables`)
- Typed mutation inputs/outputs (e.g., `CreateTodoMutation`, `UpdateTodoMutation`)
- Fragment types for component data requirements

### Regenerating Types

```bash
npm run codegen
```

Requires the GraphQL server to be running (port 4000).

---

## 9. Commands

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start everything (frontend + backend) via concurrently |
| `npm run dev:server` | Start GraphQL server only (localhost:4000) |
| `npm run dev:client` | Start React client only (localhost:3000) |

### Type Checking & Linting

| Command | Description |
|---------|-------------|
| `npm run typecheck` | `tsc --noEmit` across all packages |
| `npm run lint` | `biome check .` |
| `npm run lint:fix` | `biome check --apply .` |

### Database

| Command | Description |
|---------|-------------|
| `npm run db:generate` | `drizzle-kit generate` (after schema changes) |
| `npm run db:migrate` | `drizzle-kit migrate` |
| `npm run db:studio` | Open Drizzle Studio GUI |

### GraphQL

| Command | Description |
|---------|-------------|
| `npm run codegen` | Generate TypeScript types from GraphQL operations (requires server running) |

### Build & Deploy

| Command | Description |
|---------|-------------|
| `npm run build` | Build client and server for production |
| `npm run build:docker` | Build Docker image |
| `npm test` | Run vitest |

---

## Appendix: Directory Tree (High-Level)

```
auto-cal/
├── AGENTS.md
├── AGENTS.md
├── sst.config.ts
├── package.json
├── pnpm-workspace.yaml
├── packages/
│   ├── db/
│   │   ├── src/
│   │   │   ├── index.ts          # PGLite singleton
│   │   │   └── models/
│   │   │       ├── enums.ts
│   │   │       ├── index.ts      # Re-exports
│   │   │       ├── users.ts
│   │   │       ├── todos.ts
│   │   │       ├── activity_types.ts
│   │   │       ├── habits.ts
│   │   │       ├── time_blocks.ts
│   │   │       └── habit_completions.ts
│   │   └── drizzle/
│   │       └── migrations/
│   ├── server/
│   │   └── src/
│   │       ├── index.ts
│   │       ├── context.ts
│   │       └── schema/
│   │           ├── index.ts
│   │           └── resolvers.ts
│   └── client/
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── lib/
│           │   └── utils.ts
│           ├── __generated__/
│           │   ├── gql.ts
│           │   └── graphql.ts
│           ├── components/
│           │   ├── domain/todo/
│           │   │   ├── TodoList.tsx
│           │   │   ├── TodoItem.tsx
│           │   │   └── TodoForm.tsx
│           │   └── ui/
│           └── routes/
│               └── todos.tsx
└── .agentic/
    └── project-structure.md       # ← This file
```
