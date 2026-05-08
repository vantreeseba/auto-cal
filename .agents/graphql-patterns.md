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
  color: String!            # hex color with # prefix, e.g. "#6366f1" (default)
}

type User {
  id: String!
  email: String!
  timezone: String!         # IANA zone string, default "UTC"
  createdAt: DateTime!
  updatedAt: DateTime!
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
  activityTypeId: String!
  activityTypeName: String!
  totalTodos: Int!
  completedTodos: Int!
  totalHabits: Int!
}
```

## Key Queries

```graphql
# timezone is optional — if provided, saves to the user's profile for future use
# Returns both incomplete todos and completed todos whose scheduledAt falls in the week.
# Completed items always appear in the week their scheduledAt was — they never disappear.
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

## Additional Types

```graphql
type HabitCompletion {
  id: ID!
  habitId: ID!
  scheduledAt: DateTime   # set for tentative (scheduler-generated) completions
  completedAt: DateTime   # set for actual completions; null = tentative
  createdAt: DateTime!
}

type HabitDetail {
  habitId: ID!
  title: String!
  description: String
  priority: Int!
  estimatedLength: Int!
  frequencyCount: Int!
  frequencyUnit: String!
  activityType: ActivityType
  totalCompletions: Int!
  allTimeRate: Float!
  periods: [HabitPeriod!]!  # most recent first → reversed to chronological
}

type HabitPeriod {
  label: String!           # "This week", "Last week", "2w ago", or month name
  periodStart: String!
  periodEnd: String!
  completions: Int!
  target: Int!
  rate: Float!
}

type StatsOverview {
  weightedScore: Float     # (habitScore + todoScore) / 2; null if no data
  habitScore: Float
  todoScore: Float
  habits: [HabitStatSummary!]!
  todos: TodoStatSummary!
}
```

## Additional Queries

```graphql
# periods: number of weeks/months to return (default 8, max 26)
query MyHabitDetail($habitId: ID!, $periods: Int) {
  myHabitDetail(habitId: $habitId, periods: $periods) {
    habitId title description priority estimatedLength
    frequencyCount frequencyUnit allTimeRate totalCompletions
    activityType { id name color }
    periods { label completions target rate }
  }
}

# containsDay: 0=Sun…6=Sat — filter time blocks that include that day
query MyTimeBlocks($activityTypeId: ID, $containsDay: Int) {
  myTimeBlocks(activityTypeId: $activityTypeId, containsDay: $containsDay) {
    id daysOfWeek startTime endTime priority
    activityType { id name color }
  }
}

# startDate/endDate: ISO strings; omit startDate for all-time
query MyStats($startDate: String, $endDate: String) {
  myStats(startDate: $startDate, endDate: $endDate) {
    weightedScore habitScore todoScore
    habits { habitId title completionRate completions target frequencyUnit activityType { color } }
    todos { total completed overdue completionRate }
  }
}
```

## TodoOrderBy

`myTodos` accepts an `orderBy` argument generated by drizzle-graphql. Any todo field can be a key with value `asc` or `desc`. Defaults to `{ priority: 'desc', createdAt: 'desc' }`.

```graphql
query MyTodos($orderBy: TodoOrderBy) {
  myTodos(orderBy: $orderBy) { id title priority scheduledAt }
}
# e.g. variables: { orderBy: { scheduledAt: "asc" } }
```

Sortable fields: `priority`, `scheduledAt`, `completedAt`, `estimatedLength`, `createdAt`, `title`.

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
  requestMagicLink(email: $email) {
    ok
    magicLink   # dev only — null in production; link always logged to server console
  }
}

mutation VerifyMagicLink($token: String!) {
  verifyMagicLink(token: $token) {
    token    # JWT session token — store as auth_token in localStorage
    userId
  }
}

mutation UpdateProfile($timezone: String!) {
  myUpdateProfile(timezone: $timezone)
}
```

## Cache Invalidation

Use `refetchQueries` by operation name:
```typescript
useMutation(CREATE_TODO, { refetchQueries: ['GetMyTodos', 'MySchedule'] });
```
