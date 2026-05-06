# GraphQL Patterns

## Schema Generation Pipeline

1. `buildSchema(db)` auto-generates base schema from Drizzle tables via `@vantreeseba/drizzle-graphql`
2. `applyCustomResolvers()` extends with `my*` scoped queries/mutations via `extendSchema`
3. `blockUnscopedResolvers()` locks down any unscoped fields (not prefixed `my`, not in `PUBLIC_MUTATIONS`)

Generated schema written to `packages/server/src/__generated__/schema.graphql` via:
```bash
npm run codegen:server
```

Client types generated from that schema + client operations via:
```bash
npm run codegen
```

## Naming Conventions

| Purpose | Naming Pattern | Example |
|---------|---------------|---------|
| User-scoped queries | `my<Resource>` | `myTodos`, `myProfile` |
| User-scoped mutations | `my<Action><Resource>` | `myCreateTodo`, `myUpdateHabit` |
| Public mutations | Literal name | `requestMagicLink`, `verifyMagicLink` |
| Input types | `<Action><Resource>Args` | `CreateTodoArgs`, `UpdateHabitArgs` |

## Extending the Schema

Add new fields by extending `extensionSDL` in `packages/server/src/schema/resolvers.ts`:

```typescript
const extensionSDL = `
  extend type Query {
    myNewThing(id: ID!): NewThing
  }
  extend type Mutation {
    myCreateNewThing(input: CreateNewThingArgs!): NewThing!
  }
  input CreateNewThingArgs {
    name: String!
    value: Int!
  }
  type NewThing {
    id: ID!
    name: String!
    value: Int!
  }
`;
```

Then attach resolvers inside `applyCustomResolvers`:
```typescript
queryFields.myNewThing!.resolve = async (_parent, args, context: Context) => {
  if (!context.userId) throw new Error('Not authenticated');
  // ...
};
```

## Core Types (from Drizzle)

```graphql
type Todo {
  id: String!
  userId: String!
  title: String!
  description: String
  priority: Int!
  estimatedLength: Int!
  activityTypeId: String
  scheduledAt: DateTime
  completedAt: DateTime
  manuallyScheduled: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  activityType: ActivityType
}

type Habit {
  id: String!
  userId: String!
  title: String!
  frequencyCount: Int!
  frequencyUnit: String!   # "week" | "month"
  estimatedLength: Int!
  priority: Int!
  activityType: ActivityType
}

type TimeBlock {
  id: String!
  daysOfWeek: [Int!]!      # 0=Sun … 6=Sat
  startTime: String!        # "HH:mm"
  endTime: String!          # "HH:mm"
  priority: Int!
  activityType: ActivityType
}

type ActivityType {
  id: String!
  name: String!
  color: String!            # hex color
}
```

## Custom Types (from extensionSDL)

```graphql
type ScheduledItem {
  id: ID!
  kind: ScheduledItemKind!  # TODO | HABIT
  title: String!
  priority: Int!
  estimatedLength: Int!
  activityTypeId: ID
  activityType: ActivityType
  scheduledStart: String    # naive ISO "YYYY-MM-DDTHH:mm:ss"
  scheduledEnd: String
  isScheduled: Boolean!
  isOverdue: Boolean!
  completedAt: DateTime
}

type ActivityTypeStats {
  activityTypeId: ID!
  activityType: ActivityType
  totalTodos: Int!
  completedTodos: Int!
  totalEstimatedMinutes: Int!
  completedEstimatedMinutes: Int!
}
```

## Key Queries

```graphql
query MySchedule($weekStart: String, $timezone: String) {
  mySchedule(weekStart: $weekStart, timezone: $timezone) {
    id kind title priority estimatedLength
    scheduledStart scheduledEnd isScheduled isOverdue
    activityType { id name color }
  }
}

query MyTodos($activityTypeId: ID, $completed: Boolean, $orderBy: TodoOrderBy) {
  myTodos(activityTypeId: $activityTypeId, completed: $completed, orderBy: $orderBy) {
    id title description priority estimatedLength
    scheduledAt completedAt manuallyScheduled
    activityType { id name color }
  }
}
```

## Key Mutations

```graphql
mutation CreateTodo($input: CreateTodoArgs!) {
  myCreateTodo(input: $input) { id title priority scheduledAt }
}

mutation UpdateTodo($input: UpdateTodoArgs!) {
  myUpdateTodo(input: $input) { id title priority scheduledAt completedAt }
}

mutation CompleteTodo($id: ID!) {
  myCompleteTodo(id: $id) { id completedAt }
}

mutation RequestMagicLink($email: String!) {
  requestMagicLink(email: $email) { message }
}

mutation VerifyMagicLink($token: String!) {
  verifyMagicLink(token: $token) { sessionToken }
}
```

## Cache Invalidation

Use `refetchQueries` by operation name:
```typescript
useMutation(CREATE_TODO, { refetchQueries: ['GetMyTodos', 'MySchedule'] });
```
