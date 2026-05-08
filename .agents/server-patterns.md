# Server Patterns

Express + Apollo Server, no build step (`--experimental-strip-types`). All imports **must** include `.ts` extension.

## Scheduler Writeback — Fire-and-Forget

`runSchedulerWriteback` is called without `await` so mutations return immediately. Errors are swallowed with `.catch(console.error)` — the client never sees a scheduler failure:

```typescript
runSchedulerWriteback(context.db, context.userId).catch(console.error);
return result; // returned before writeback finishes
```

Do not await it. Do not surface scheduler errors to the client.

## Context

```typescript
// packages/server/src/context.ts
export interface Context {
  db: DB;
  userId?: string;           // undefined = not authenticated
  loaders: ReturnType<typeof createLoaders>;
}

export function createLoaders(db: DB) {
  return {
    activityType: new DataLoader<string, ActivityType | null>(async (ids) => {
      const rows = await db.query.activityTypes.findMany({
        where: inArray(activityTypes.id, [...ids]),
      });
      const byId = new Map(rows.map((r) => [r.id, r]));
      return ids.map((id) => byId.get(id) ?? null);
    }),
  };
}
```

## Public Mutations

Only two mutations bypass the `my*` scoping requirement and are accessible without authentication:

```typescript
const PUBLIC_MUTATIONS = new Set(['requestMagicLink', 'verifyMagicLink']);
```

Any new public endpoint (e.g. a webhook or health check) must be added to this set in `packages/server/src/schema/index.ts`.

## Schema Pipeline

```typescript
// packages/server/src/schema/index.ts
const { schema: drizzleSchema } = buildSchema(db, {
  prefixes: { insert: 'create', update: 'update', delete: 'delete' },
  suffixes: { list: 's', single: '' },
  singularTypes: true,
});

export const schema = applyCustomResolvers(drizzleSchema);
blockUnscopedResolvers(schema); // blocks anything not prefixed "my" or in PUBLIC_MUTATIONS
```

## Custom Resolver Pattern (extendSchema)

```typescript
// packages/server/src/schema/resolvers.ts
const extensionSDL = `
  extend type Query {
    myTodos(activityTypeId: ID, completed: Boolean): [Todo!]!
  }
  extend type Mutation {
    myCreateTodo(input: CreateTodoArgs!): Todo!
  }
  input CreateTodoArgs {
    title: String!
    priority: Int
    estimatedLength: Int!
    activityTypeId: ID
    scheduledAt: String
  }
`;

export function applyCustomResolvers(schema: GraphQLSchema): GraphQLSchema {
  const extended = extendSchema(schema, parse(extensionSDL));
  const queryType = extended.getType('Query') as GraphQLObjectType;
  const queryFields = queryType.getFields();
  const mutationType = extended.getType('Mutation') as GraphQLObjectType;
  const mutationFields = mutationType.getFields();

  queryFields.myTodos!.resolve = async (_parent, args, context: Context) => {
    if (!context.userId) throw new Error('Not authenticated');
    return context.db.query.todos.findMany({
      where: eq(todos.userId, context.userId),
    });
  };

  mutationFields.myCreateTodo!.resolve = async (_parent, args, context: Context) => {
    if (!context.userId) throw new Error('Not authenticated');
    const input = CreateTodoInput.parse(args.input); // Zod validation
    const [todo] = await context.db.insert(todos).values({ ...input, userId: context.userId }).returning();
    return todo;
  };

  return extended;
}
```

## Guard Clause Pattern

Always check auth and ownership first:

```typescript
if (!context.userId) throw new Error('Not authenticated');
const todo = await context.db.query.todos.findFirst({ where: eq(todos.id, id) });
if (!todo) throw new Error(`Todo ${id} not found`);
if (todo.userId !== context.userId) throw new Error('Forbidden');
```

## Zod Validation at Resolver Boundary

All validators live in `packages/server/src/schema/validators.ts`. Key constraints:

| Field | Rule |
|-------|------|
| `title` | min 1, max 200 |
| `description` | max 2000, optional |
| `priority` | int 0–100, default 0 |
| `estimatedLength` | int 1–1440 (minutes); optional on create — defaults to `0` in the resolver. `0` is a valid state meaning "unestimated" — the item won't be auto-scheduled until a length is set. UI should allow 0 / no estimate. |
| `frequencyCount` | int 1–30 |
| `color` | must match `#[0-9a-fA-F]{6}` |
| `daysOfWeek` | array of 0–6, min 1, max 7, unique |
| `startTime` / `endTime` | `HH:mm` format; end must be after start |
| `scheduledAt` | local datetime string (no `Z`) |

```typescript
// In resolver:
const input = CreateTodoInput.parse(args.input);
```

## Auth (JWT + Magic Links)

```typescript
// packages/server/src/auth.ts — jose library
export async function signSessionToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ sub: userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{ sub?: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { sub?: string };
  } catch {
    return null;
  }
}
```

Context extraction in `index.ts`:
```typescript
context: async ({ req }): Promise<Context> => {
  const rawToken = req.headers.authorization?.slice(7);
  if (!rawToken) return { db, loaders };
  const payload = await verifyToken(rawToken);
  if (payload?.sub) return { db, userId: payload.sub, loaders };
  return { db, loaders };
},
```

## DataLoader (N+1 Prevention)

Loaders are created per-request in context. Use them in type resolvers:

```typescript
activityType: async (parent, _args, context: Context) => {
  if (!parent.activityTypeId) return null;
  return context.loaders.activityType.load(parent.activityTypeId);
},
```

## iCal Endpoint

`GET /ical?userId=<uuid>` — public, no auth token required. Returns a `.ics` feed for the current and next week. Naive local datetimes from the scheduler are converted to UTC using `fromZonedTime(datetime, user.timezone)` from `date-fns-tz`.

The URL is intentionally public (no secret). Users are warned to treat it like a password.

## Auth — Email Not Wired in Production

Magic links are logged to the server console in both dev and prod. In dev, `requestMagicLink` also returns `magicLink` in the GraphQL response. In production the response has `magicLink: null`. There is a TODO to integrate Resend or Nodemailer — email is not yet sent.

**Convention for email-adjacent features:** log to console in dev, leave a `// TODO: send email via Resend/Nodemailer` comment for production. Do not block features on the email provider being wired up.

## Resolver File Structure

Each domain has its own resolver file exporting an `apply*Resolvers(queryFields, mutationFields)` function:

```
packages/server/src/schema/resolvers/
  index.ts          — extensionSDL + wires all apply* functions
  todos.ts          — applyTodoResolvers
  habits.ts         — applyHabitResolvers
  time-blocks.ts    — applyTimeBlockResolvers
  activity-types.ts — applyActivityTypeResolvers
  schedule.ts       — applyScheduleResolvers
  stats.ts          — applyStatsResolvers
  profile.ts        — applyProfileResolvers
  auth.ts           — applyAuthResolvers
```

New resolver domains follow the same pattern. SDL goes in `extensionSDL` in `index.ts`; resolver functions go in a new domain file.

## Scheduler Service (Pure Function)

```typescript
// packages/server/src/services/scheduler.ts
export function computeSchedule(
  weekStartStr: string,
  timeBlocks: TimeBlock[],
  todos: Todo[],
  habits: Array<Habit & { instanceIndex: number }>,
  activityTypeMap: Map<string, ActivityType>,
): ScheduledItem[] { ... }
```

Pure function — deterministic, easy to unit test.
