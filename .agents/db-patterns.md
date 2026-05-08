# Database Patterns

Schema lives in `packages/db/src/models/`, re-exported from `packages/db/src/schema.ts`.

## Table Definition

```typescript
// packages/db/src/models/todos.ts
export const todos = pgTable('todos', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  priority: integer('priority').notNull().default(0),
  estimatedLength: integer('estimated_length').notNull(),
  activityTypeId: uuid('activity_type_id').references(() => activityTypes.id, {
    onDelete: 'set null',
  }),
  scheduledAt: timestamp('scheduled_at'),
  completedAt: timestamp('completed_at'),
  manuallyScheduled: boolean('manually_scheduled').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Always infer types — never manually duplicate
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
```

## Enum Pattern

```typescript
// packages/db/src/models/enums.ts
export const FREQUENCY_UNITS = ['week', 'month'] as const;
export type FrequencyUnit = (typeof FREQUENCY_UNITS)[number];

// Used in schema:
frequencyUnit: text('frequency_unit').notNull().$type<FrequencyUnit>()
```

## Dual-Backend Connection

```typescript
// packages/db/src/index.ts
const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl) {
  // Production: postgres.js
  const postgres = await import('postgres');
  const client = postgres.default(databaseUrl);
  db = drizzle({ client, schema });
} else {
  // Dev: PGLite (embedded, zero-setup)
  const { PGlite } = await import('@electric-sql/pglite');
  const client = new PGlite(process.env.PGLITE_DATA_DIR);
  db = drizzle({ client, schema });
}
```

## Query Patterns

```typescript
// Single record
const user = await db._query.users.findFirst({
  where: eq(users.id, userId),
});

// List with conditions
const items = await db._query.todos.findMany({
  where: and(
    eq(todos.userId, context.userId),
    isNull(todos.completedAt),
  ),
  orderBy: [desc(todos.priority), desc(todos.createdAt)],
});

// Insert + return
const [row] = await db.insert(todos).values({ ...input, userId }).returning();

// Update
await db
  .update(todos)
  .set({ completedAt: new Date(), updatedAt: new Date() })
  .where(and(eq(todos.id, id), eq(todos.userId, userId)));

// Delete
await db.delete(todos).where(and(eq(todos.id, id), eq(todos.userId, userId)));
```

## Seed Pattern

```typescript
// packages/db/src/seed.ts
export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function seedDemoUser(): Promise<void> {
  const existing = await db.select().from(users).where(eq(users.id, DEMO_USER_ID)).limit(1);
  if (existing.length === 0) {
    await db.insert(users).values({ id: DEMO_USER_ID, email: DEMO_USER_EMAIL });
  }
}
```

## Migrations

```bash
npm run db:generate   # after schema changes
npm run db:migrate    # apply migrations
npm run db:studio     # GUI
```

Migration files live in `packages/db/drizzle/` — never edit manually.

## Foreign Key Conventions

- User-owned resources: `references(() => users.id, { onDelete: 'cascade' })`
- Optional references: `references(() => activityTypes.id, { onDelete: 'set null' })`
- All PKs: `uuid('id').primaryKey().defaultRandom()`
- All timestamps: Postgres `timestamp` type (not `timestamptz`)
