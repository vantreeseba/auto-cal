# Server Patterns

Express + Apollo Server, no build step (`--experimental-strip-types`). All imports **must** include `.ts` extension.

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
      const rows = await db._query.activityTypes.findMany({
        where: inArray(activityTypes.id, [...ids]),
      });
      const byId = new Map(rows.map((r) => [r.id, r]));
      return ids.map((id) => byId.get(id) ?? null);
    }),
  };
}
```

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
    return context.db._query.todos.findMany({
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
const todo = await context.db._query.todos.findFirst({ where: eq(todos.id, id) });
if (!todo) throw new Error(`Todo ${id} not found`);
if (todo.userId !== context.userId) throw new Error('Forbidden');
```

## Zod Validation at Resolver Boundary

```typescript
// packages/server/src/schema/validators.ts
export const CreateTodoInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: z.number().int().min(0).max(100).default(0),
  estimatedLength: z.number().int().min(1).max(1440),
  activityTypeId: z.string().uuid().optional(),
  scheduledAt: z.string().datetime().optional(),
});

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
