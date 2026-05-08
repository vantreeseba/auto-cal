# Project: Auto Cal

Auto Cal is a smart todo and habit scheduling application. Users create todos (single-time tasks) and habits (repeated tasks) that are automatically scheduled within user-defined time blocks based on priority and activity type.

Monorepo: `packages/db` (Drizzle + PGLite), `packages/server` (Express + Apollo), `packages/client` (React + Vite).

## Commands

```bash
# Dev
npm run dev              # start frontend + backend
npm run dev:server       # GraphQL server only (localhost:4000)
npm run dev:client       # React client only (localhost:3000)

# Quality
npm run typecheck        # tsc --noEmit across all packages
npm run lint             # biome check .
npm run lint:fix         # biome check --apply .

# Database
npm run db:generate      # drizzle-kit generate (after schema changes)
npm run db:migrate       # drizzle-kit migrate
npm run db:studio        # Drizzle Studio GUI

# GraphQL
npm run codegen          # generate TS types from operations (server must be running)
npm run codegen:server   # generate server-side resolver types

# Build
npm run build            # codegen + vite + tsc (run before docker build)
npm run build:docker     # docker build -t auto-cal .
npm test                 # vitest
```

## Tech Stack

| Choice | Why |
|--------|-----|
| **Biome** | Single tool replacing ESLint + Prettier; enforces `useImportType`, `noUnusedImports`, consistent formatting |
| **drizzle-graphql** | Auto-generates GraphQL schema from Drizzle tables — zero duplication; we extend with custom resolvers |
| **PGLite** | Embedded Postgres, zero setup for local dev and single-node deploys; swap to full Postgres via `DATABASE_URL` |
| **--experimental-strip-types** | Node 22+ runs TypeScript directly — no tsc watch, no build step for the server; requires `.ts` extensions in all imports |
| **Auth** | Magic-link + JWT (jose) is live. `requestMagicLink` / `verifyMagicLink` mutations are public. `DEMO_USER_ID` env var is a dev fallback only. |

## Key Conventions

**Type inference — never duplicate types manually:**
```typescript
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
```

**Enum pattern:**
```typescript
export const FREQUENCY_UNITS = ['week', 'month'] as const;
export type FrequencyUnit = (typeof FREQUENCY_UNITS)[number];
```

**Guard clause order — auth → existence → ownership:**
```typescript
if (!context.userId) throw new Error('Not authenticated');
const todo = await context.db.query.todos.findFirst({ where: eq(todos.id, id) });
if (!todo) throw new Error(`Todo ${id} not found`);
if (todo.userId !== context.userId) throw new Error('Forbidden');
```

**Zod validation at resolver boundary:**
```typescript
const input = CreateTodoInput.parse(args.input); // throws ZodError if invalid
```

**Never swallow errors:**
```typescript
try {
  await someOperation();
} catch (cause) {
  throw new Error('Failed to complete operation', { cause });
}
```

## Agent File Convention

All files related to project structure, tasks, planning, and feature tracking live in `.agents/`. Agents must read from and write to `.agents/` for any such files — never create them at the repo root.

Always add new `.agents/` files to the reference list below.

## Agent Reference Files

- [`.agents/project-structure.md`](.agents/project-structure.md) — Full package layout, DB schema tables, GraphQL operations, client components, resolver pipeline, directory tree
- [`.agents/db-patterns.md`](.agents/db-patterns.md) — Drizzle table definitions, type inference, query/insert/update/delete patterns, dual-backend connection, migrations
- [`.agents/server-patterns.md`](.agents/server-patterns.md) — GraphQL schema pipeline, resolver authoring, guard clauses, Zod validation, JWT auth, DataLoader usage
- [`.agents/graphql-patterns.md`](.agents/graphql-patterns.md) — Schema extension SDL, core/custom types, key queries and mutations, naming conventions, cache invalidation
- [`.agents/client-patterns.md`](.agents/client-patterns.md) — Apollo Client setup, TanStack Router, colocated operations, fragment colocation, TanStack Form, ShadCN/Tailwind component patterns, codegen
- [`.agents/scheduling.md`](.agents/scheduling.md) — Scheduling algorithm, writeback service, pre-placement lock, habit instance generation
- [`.agents/deployment.md`](.agents/deployment.md) — Docker setup, environment variables, PGLite vs Postgres switching
- [`.agents/todo.md`](.agents/todo.md) — Open feature requests, issues, and deferred work items
