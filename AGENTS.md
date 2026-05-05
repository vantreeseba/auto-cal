# Project: Auto Cal

## What this is

Auto Cal is a smart todo and habit scheduling application. Users create todos (single-time tasks) and habits (repeated tasks) that are automatically scheduled within user-defined time blocks based on priority and activity type. The system tracks completion rates and provides insights by activity type.

## Commands

### Development
- `npm run dev` — start everything (frontend + backend) via concurrently
- `npm run dev:server` — start GraphQL server only (localhost:4000)
- `npm run dev:client` — start React client only (localhost:3000)

### Type Checking & Linting
- `npm run typecheck` — tsc --noEmit across all packages
- `npm run lint` — biome check .
- `npm run lint:fix` — biome check --apply .

### Database
- `npm run db:generate` — drizzle-kit generate (after schema changes)
- `npm run db:migrate` — drizzle-kit migrate
- `npm run db:studio` — open Drizzle Studio GUI

### GraphQL
- `npm run codegen` — generate TypeScript types from GraphQL operations (requires server running)

### Build & Deploy
- `npm run build` — build client and server for production
- `npm run build:docker` — build Docker image
- `npm test` — vitest

## Package Structure

### `packages/db/`
**Drizzle ORM schema and database layer**

- `src/schema.ts` — All table definitions (users, todos, habits, time_blocks, habit_completions)
- `src/index.ts` — PGLite database singleton with Drizzle instance
- `drizzle/` — Generated migration files (never edit manually)

**Key Patterns:**
- Types inferred from schema using `$inferSelect` and `$inferInsert` — never duplicate
- `as const` arrays for enum-like values (ACTIVITY_TYPES, FREQUENCY_UNITS)
- All timestamps use Postgres `timestamp` type
- Foreign keys with cascade deletes for user-owned resources

### `packages/server/`
**Node.js GraphQL API with Express + Apollo Server**

- Runs with `--experimental-strip-types` (zero-build-step)
- Import paths MUST include `.ts` extension
- `src/index.ts` — Express + Apollo Server setup
- `src/context.ts` — GraphQL context interface (db, userId)
- `src/schema/index.ts` — Schema extension pipeline using drizzle-graphql
- `src/schema/resolvers.ts` — Custom queries, mutations, and type extensions

**Key Patterns:**
- Schema auto-generated from Drizzle via `buildSchema(db)`
- Custom resolvers extend the base schema using GraphQL schema extension pattern
- Guard clauses first: `if (!context.userId) throw new Error('Not authenticated')`
- Zod validation on ALL mutation inputs at resolver boundary
- Ownership checks before all mutations: verify `userId === context.userId`
- Never suppress errors — fail fast and loud

**Auth (Current):**
- Simple demo user ID from `Authorization: Bearer <user-id>` header
- In production: would verify JWT and extract userId from token claims

### `packages/client/`
**React + Vite + Apollo Client + TanStack Router + ShadCN**

- `src/main.tsx` — App entry point, Apollo Provider setup
- `src/App.tsx` — Main application component with tabs
- `src/components/ui/` — ShadCN UI components (Button, Card, Tabs, etc.)
- `src/lib/utils.ts` — Utility functions (cn for className merging)
- `src/__generated__/` — GraphQL Codegen output (gitignored, regenerated on demand)

**Key Patterns:**
- GraphQL operations colocated with components — NO centralized `queries.ts`
- Use `gql` from `@apollo/client` for queries/mutations
- After updating operations, run `npm run codegen` to regenerate types
- ShadCN components use Radix UI primitives + Tailwind CSS
- `cn()` utility for className composition

**Future:**
- Will migrate to TanStack Router for file-based routing
- URL state for filters (activity type, completion status, date ranges)
- Fragment colocation pattern for data requirements

## Tech Stack Philosophy

### Why Biome?
Replaces ESLint + Prettier with a single, faster tool. Enforces:
- `useImportType: error` — all type-only imports must use `import type`
- `noUnusedImports: error` — auto-removed on lint:fix
- Consistent formatting with zero config

### Why drizzle-graphql?
Auto-generates GraphQL schema from Drizzle tables — zero duplication. We extend the base schema with custom resolvers rather than hand-writing the entire schema.

### Why PGLite?
Embedded Postgres — no separate database server needed. Perfect for:
- Local development (zero setup)
- Embedded deployments
- Testing

**Switching to full Postgres:** Set the `DATABASE_URL` environment variable (e.g. `postgresql://user:password@localhost:5432/autocal`) and the runtime will automatically use the `postgres.js` driver instead of PGLite. If `DATABASE_URL` is not set, `PGLITE_DATA_DIR` is required and PGLite is used. See `.env.example` and `docker-compose.yml` for both modes.

### Why --experimental-strip-types?
Node 22+ can run TypeScript directly without a build step. Benefits:
- Faster development (no tsc watch process)
- Simpler deployment
- Requires `.ts` extensions in imports

## Key Conventions

### Type Inference
Types inferred from Drizzle schema — never manually duplicate:
```typescript
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
```

### Enum Pattern
```typescript
export const ACTIVITY_TYPES = ['work', 'exercise', 'learning', ...] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];
```

### Validation Pattern
All mutation inputs validated with Zod at resolver boundary:
```typescript
const input = CreateTodoInput.parse(args.input); // throws ZodError if invalid
```

### Guard Clause Pattern
Auth and ownership checks first:
```typescript
if (!context.userId) throw new Error('Not authenticated');
const todo = await context.db.query.todos.findFirst({ where: eq(todos.id, id) });
if (!todo) throw new Error(`Todo ${id} not found`);
if (todo.userId !== context.userId) throw new Error('Forbidden');
```

### Error Handling
Never swallow errors. Always re-throw with context:
```typescript
try {
  await someOperation();
} catch (cause) {
  throw new Error('Failed to complete operation', { cause });
}
```

## Scheduling Logic (Future Implementation)

The core scheduling algorithm (not yet implemented) will:

1. **Collect Available Time Blocks**
   - Query user's time blocks for the target date range
   - Group by activity type

2. **Gather Unscheduled Tasks**
   - Incomplete todos
   - Habits due for completion (based on frequency)

3. **Sort by Priority**
   - Higher priority items scheduled first
   - Within same priority, sort by estimated length (shorter first)

4. **Auto-Schedule**
   - Match task activity type to time block activity type
   - Find first available slot that fits estimated length
   - Assign `scheduledAt` timestamp
   - If no slot available, leave unscheduled (user can adjust blocks or priorities)

5. **Re-Scheduling on Priority Change**
   - When todo/habit priority increases beyond existing scheduled items:
     - Bump lower priority items out of their slots
     - Re-run scheduling algorithm

This will be implemented as:
- `packages/server/src/services/scheduler.ts` — core scheduling logic
- `packages/server/src/schema/resolvers.ts` — call scheduler on create/update mutations
- Scheduled items stored in `scheduledAt` field on todos table
- Habit instances generated on-demand based on frequency

## GraphQL Schema Extension Pattern

We use a pipeline approach to extend the auto-generated schema:

```typescript
const drizzleSchema = buildSchema(db); // auto-generated from Drizzle
export const schema = applyCustomResolvers(drizzleSchema); // extend with custom resolvers
```

Each `apply*` function takes a `GraphQLSchema` and returns an extended `GraphQLSchema`:
```typescript
export function applyCustomResolvers(schema: GraphQLSchema): GraphQLSchema {
  const extended = extendSchema(schema, parse(`
    extend type Query {
      myTodos: [todos!]!
    }
  `));
  
  const queryType = extended.getType('Query') as GraphQLObjectType;
  queryType.getFields().myTodos.resolve = async (_parent, _args, context: Context) => {
    if (!context.userId) throw new Error('Not authenticated');
    return context.db.query.todos.findMany({ where: eq(todos.userId, context.userId) });
  };
  
  return extended;
}
```

This keeps the codebase maintainable as the schema grows.

## Testing Strategy (Not Yet Implemented)

When adding tests:
- Use Vitest for unit and integration tests
- Test resolvers with mock context (db, userId)
- Test services in isolation (pure functions where possible)
- Test scheduling algorithm with known inputs/outputs
- Use PGLite for integration tests (fast, no setup)

## Deployment Notes

### Docker
- Multi-stage build: client built separately, server uses --experimental-strip-types
- PGLite data persisted to volume at `/app/pgdata`
- Migrations run on container startup
- Serves GraphQL API and static client from same Express server

### Environment Variables
- `PORT` — server port (default 4000)
- `DATABASE_URL` — Postgres connection string (e.g. `postgresql://user:pass@host:5432/db`); when set, uses postgres.js driver
- `PGLITE_DATA_DIR` — path to PGLite data directory; required when `DATABASE_URL` is not set
- `NODE_ENV` — production/development
- `DEMO_USER_ID` — demo user for development (no auth yet)

## Future Enhancements

1. **Authentication**
   - Magic link login
   - JWT-based sessions
   - Proper userId extraction from token

2. **TanStack Router**
   - File-based routing
   - URL state for filters
   - Type-safe navigation

3. **Scheduling Algorithm**
   - Auto-schedule todos and habits
   - Priority-based rescheduling
   - Conflict resolution

4. **Notifications**
   - Upcoming task reminders
   - Habit due notifications
   - Completion streak tracking

5. **Analytics**
   - Completion rate trends
   - Activity type distribution
   - Productivity insights

6. **Mobile App**
   - React Native + NativeWind
   - Shared GraphQL types
    - Push notifications

## Project Documentation

For detailed project structure, schema definitions, and code patterns, see [`.agentic/project-structure.md`](.agentic/project-structure.md).