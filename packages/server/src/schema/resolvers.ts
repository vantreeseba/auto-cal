import {
  activityTypes,
  habitCompletions,
  habits,
  timeBlocks,
  todos,
  users,
} from '@auto-cal/db/schema';
import {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  isNull,
  lte,
  sql,
} from 'drizzle-orm';
import {
  type GraphQLObjectType,
  type GraphQLSchema,
  extendSchema,
  parse,
} from 'graphql';
import { z } from 'zod';
import type { Context } from '../context.ts';
import type { InnerOrder, TodoOrderBy } from '../__generated__/resolvers.ts';
import {
  signMagicToken,
  signSessionToken,
  verifyToken,
} from '../auth.ts';
import {
  computeSchedule,
  startOfISOWeek,
  startOfISOWeekStr,
  startOfLocalMonth,
} from '../services/scheduler.ts';
import { runSchedulerWriteback } from '../services/scheduler-writeback.ts';

// Zod validation schemas
const CreateActivityTypeInput = z.object({
  name: z.string().min(1).max(100),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color')
    .default('#6366f1'),
});

const UpdateActivityTypeInput = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color')
    .optional(),
});

const CreateTodoInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: z.number().int().min(0).max(100).default(0),
  estimatedLength: z.number().int().min(1).max(1440).optional(),
  activityTypeId: z.string().uuid().optional(),
  scheduledAt: z.string().optional(), // naive local-time ISO — no Z suffix
});

const UpdateTodoInput = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  priority: z.number().int().min(0).max(100).optional(),
  estimatedLength: z.number().int().min(1).max(1440).optional(),
  activityTypeId: z.string().uuid().nullable().optional(),
  scheduledAt: z.string().optional(), // naive local-time ISO — no Z suffix
  isPinnedSchedule: z.boolean().optional(),
  completedAt: z.string().nullable().optional(),
});

const CreateHabitInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: z.number().int().min(0).max(100).default(0),
  estimatedLength: z.number().int().min(1).max(1440).optional(),
  activityTypeId: z.string().uuid().optional(),
  frequencyCount: z.number().int().positive().min(1).max(30),
  frequencyUnit: z.enum(['week', 'month'] as const),
});

const CreateTimeBlockInput = z
  .object({
    activityTypeId: z.string().uuid().optional(),
    daysOfWeek: z
      .array(z.number().int().min(0).max(6))
      .min(1)
      .max(7)
      .refine((days) => new Set(days).size === days.length, {
        message: 'Days of week must be unique',
      }),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    priority: z.number().int().min(0).max(100).default(0),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

const CompleteHabitInput = z.object({
  habitId: z.string().uuid(),
  scheduledAt: z.string().optional(), // naive local-time ISO from the scheduler — no Z suffix
});

const UpdateHabitInput = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  priority: z.number().int().min(0).max(100).optional(),
  estimatedLength: z.number().int().min(1).max(1440).optional(),
  activityTypeId: z.string().uuid().nullable().optional(),
  frequencyCount: z.number().int().positive().min(1).max(30).optional(),
  frequencyUnit: z.enum(['week', 'month'] as const).optional(),
});

const UpdateTimeBlockInput = z
  .object({
    id: z.string().uuid(),
    activityTypeId: z.string().uuid().nullable().optional(),
    daysOfWeek: z
      .array(z.number().int().min(0).max(6))
      .min(1)
      .max(7)
      .refine((days) => new Set(days).size === days.length, {
        message: 'Days of week must be unique',
      })
      .optional(),
    startTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional(),
    endTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional(),
    priority: z.number().int().min(0).max(100).optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) return data.endTime > data.startTime;
      return true;
    },
    { message: 'End time must be after start time', path: ['endTime'] },
  );

// SDL extension
const extensionSDL = `
  type ActivityTypeStats {
    activityTypeId: String!
    activityTypeName: String!
    totalTodos: Int!
    completedTodos: Int!
    totalHabits: Int!
  }

  type HabitStats {
    habitId: String!
    title: String!
    completionRate: Float!
    totalCompletions: Int!
  }

  type HabitPeriod {
    label: String!
    periodStart: String!
    periodEnd: String!
    completions: Int!
    target: Int!
    rate: Float!
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
    periods: [HabitPeriod!]!
  }

  enum ScheduledItemKind {
    todo
    habit
  }

  type ScheduledItem {
    kind: ScheduledItemKind!
    id: ID!
    title: String!
    priority: Int!
    estimatedLength: Int!
    activityType: ActivityType
    scheduledStart: String
    scheduledEnd: String
    isScheduled: Boolean!
    isOverdue: Boolean!
    completedAt: String
  }

  input CreateActivityTypeArgs {
    name: String!
    color: String
  }

  input UpdateActivityTypeArgs {
    id: ID!
    name: String
    color: String
  }

  input CreateTodoArgs {
    title: String!
    description: String
    priority: Int
    estimatedLength: Int
    activityTypeId: ID
    scheduledAt: String
  }

  input UpdateTodoArgs {
    id: ID!
    title: String
    description: String
    priority: Int
    estimatedLength: Int
    activityTypeId: ID
    scheduledAt: String
    isPinnedSchedule: Boolean
    completedAt: String
  }

  input CreateHabitArgs {
    title: String!
    description: String
    priority: Int
    estimatedLength: Int
    activityTypeId: ID
    frequencyCount: Int!
    frequencyUnit: String!
  }

  input CreateTimeBlockArgs {
    activityTypeId: ID
    daysOfWeek: [Int!]!
    startTime: String!
    endTime: String!
    priority: Int
  }

  input UpdateHabitArgs {
    id: ID!
    title: String
    description: String
    priority: Int
    estimatedLength: Int
    activityTypeId: ID
    frequencyCount: Int
    frequencyUnit: String
  }

  input UpdateTimeBlockArgs {
    id: ID!
    activityTypeId: ID
    daysOfWeek: [Int!]
    startTime: String
    endTime: String
    priority: Int
  }

  input CompleteHabitArgs {
    habitId: ID!
    scheduledAt: String
  }

  extend type Todo {
    activityType: ActivityType
  }

  extend type Habit {
    activityType: ActivityType
  }

  extend type TimeBlock {
    activityType: ActivityType
  }

  extend type Query {
    myActivityTypes: [ActivityType!]!
    myTodos(activityTypeId: ID, completed: Boolean, orderBy: TodoOrderBy): [Todo!]!
    myHabits(activityTypeId: ID): [Habit!]!
    myTimeBlocks(activityTypeId: ID, containsDay: Int): [TimeBlock!]!
    activityTypeStats(startDate: String, endDate: String): [ActivityTypeStats!]!
    habitStats(habitId: ID, startDate: String, endDate: String): [HabitStats!]!
    myHabitDetail(habitId: ID!, periods: Int): HabitDetail!
    mySchedule(weekStart: String, timezone: String): [ScheduledItem!]!
  }

  extend type Mutation {
    myCreateActivityType(input: CreateActivityTypeArgs!): ActivityType!
    myUpdateActivityType(input: UpdateActivityTypeArgs!): ActivityType!
    myDeleteActivityType(id: ID!): Boolean!
    myCreateTodo(input: CreateTodoArgs!): Todo!
    myUpdateTodo(input: UpdateTodoArgs!): Todo!
    myCompleteTodo(id: ID!): Todo!
    myDeleteTodo(id: ID!): Boolean!
    myCreateHabit(input: CreateHabitArgs!): Habit!
    myDeleteHabit(id: ID!): Boolean!
    myUpdateHabit(input: UpdateHabitArgs!): Habit!
    myUpdateTimeBlock(input: UpdateTimeBlockArgs!): TimeBlock!
    myCompleteHabit(input: CompleteHabitArgs!): HabitCompletion!
    myCreateTimeBlock(input: CreateTimeBlockArgs!): TimeBlock!
    myDeleteTimeBlock(id: ID!): Boolean!
    myReschedule(weekStart: String): Boolean!
    myUpdateProfile(timezone: String!): Boolean!
    requestMagicLink(email: String!): RequestMagicLinkResult!
    verifyMagicLink(token: String!): VerifyMagicLinkResult!
  }

  type RequestMagicLinkResult {
    ok: Boolean!
    magicLink: String
  }

  type VerifyMagicLinkResult {
    token: String!
    userId: ID!
  }
`;

export function applyCustomResolvers(schema: GraphQLSchema): GraphQLSchema {
  const extended = extendSchema(schema, parse(extensionSDL));

  const queryType = extended.getType('Query') as GraphQLObjectType;
  const mutationType = extended.getType('Mutation') as GraphQLObjectType;
  const queryFields = queryType.getFields();
  const mutationFields = mutationType.getFields();

  // --- ActivityType Queries ---

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  queryFields.myActivityTypes!.resolve = async (
    _parent,
    _args,
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    return context.db._query.activityTypes.findMany({
      where: eq(activityTypes.userId, context.userId),
      orderBy: [activityTypes.name],
    });
  };

  // --- Todo Queries ---

  const TODO_COLUMN_MAP = {
    id: todos.id,
    title: todos.title,
    priority: todos.priority,
    estimatedLength: todos.estimatedLength,
    scheduledAt: todos.scheduledAt,
    completedAt: todos.completedAt,
    createdAt: todos.createdAt,
    updatedAt: todos.updatedAt,
  } as const;

  function buildTodoOrderBy(orderBy?: TodoOrderBy) {
    if (!orderBy) return [desc(todos.priority), desc(todos.createdAt)];
    const entries = Object.entries(orderBy)
      .filter((e): e is [string, InnerOrder] => e[1] != null)
      .sort(([, a], [, b]) => a.priority - b.priority);
    if (entries.length === 0) return [desc(todos.priority), desc(todos.createdAt)];
    return entries.map(([field, inner]) => {
      const col = TODO_COLUMN_MAP[field as keyof typeof TODO_COLUMN_MAP];
      return inner.direction === 'asc' ? asc(col) : desc(col);
    });
  }

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  queryFields.myTodos!.resolve = async (
    _parent,
    args: { activityTypeId?: string; completed?: boolean; orderBy?: TodoOrderBy },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    const conditions = [eq(todos.userId, context.userId)];
    if (args.activityTypeId)
      conditions.push(eq(todos.activityTypeId, args.activityTypeId));
    if (args.completed === true) conditions.push(isNotNull(todos.completedAt));
    else if (args.completed === false)
      conditions.push(isNull(todos.completedAt));
    return context.db._query.todos.findMany({
      where: and(...conditions),
      orderBy: buildTodoOrderBy(args.orderBy),
    });
  };

  // --- Habit Queries ---

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  queryFields.myHabits!.resolve = async (
    _parent,
    args: { activityTypeId?: string },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    const conditions = [eq(habits.userId, context.userId)];
    if (args.activityTypeId)
      conditions.push(eq(habits.activityTypeId, args.activityTypeId));
    return context.db._query.habits.findMany({
      where: and(...conditions),
      orderBy: [desc(habits.priority), desc(habits.createdAt)],
    });
  };

  // --- Time Block Queries ---

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  queryFields.myTimeBlocks!.resolve = async (
    _parent,
    args: { activityTypeId?: string; containsDay?: number },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    const conditions = [eq(timeBlocks.userId, context.userId)];
    if (args.activityTypeId)
      conditions.push(eq(timeBlocks.activityTypeId, args.activityTypeId));
    if (args.containsDay !== undefined && args.containsDay !== null) {
      conditions.push(
        sql`${timeBlocks.daysOfWeek} @> ARRAY[${sql.param(args.containsDay)}]::integer[]`,
      );
    }
    return context.db._query.timeBlocks.findMany({
      where: and(...conditions),
      orderBy: [timeBlocks.startTime],
    });
  };

  // --- ActivityType Stats Query ---

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  queryFields.activityTypeStats!.resolve = async (
    _parent,
    args: { startDate?: string; endDate?: string },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');

    const start = args.startDate ? new Date(args.startDate) : null;
    const end = args.endDate ? new Date(args.endDate) : null;

    const [userActivityTypes, allTodos, allHabits] = await Promise.all([
      context.db._query.activityTypes.findMany({
        where: eq(activityTypes.userId, context.userId),
      }),
      context.db._query.todos.findMany({
        where: and(eq(todos.userId, context.userId), isNotNull(todos.activityTypeId)),
      }),
      context.db._query.habits.findMany({
        where: and(eq(habits.userId, context.userId), isNotNull(habits.activityTypeId)),
      }),
    ]);

    const todosByType = new Map<string, typeof allTodos>();
    for (const todo of allTodos) {
      if (!todo.activityTypeId) continue;
      const bucket = todosByType.get(todo.activityTypeId) ?? [];
      bucket.push(todo);
      todosByType.set(todo.activityTypeId, bucket);
    }

    const habitsByType = new Map<string, number>();
    for (const habit of allHabits) {
      if (!habit.activityTypeId) continue;
      habitsByType.set(habit.activityTypeId, (habitsByType.get(habit.activityTypeId) ?? 0) + 1);
    }

    return userActivityTypes.map((at) => {
      const typeTodos = todosByType.get(at.id) ?? [];
      // totalTodos: created within the date range (or all-time if no filter)
      const totalTodos = typeTodos.filter((t) => {
        if (start && t.createdAt < start) return false;
        if (end && t.createdAt > end) return false;
        return true;
      }).length;
      // completedTodos: completedAt within the date range (or all completed if no filter)
      const completedTodos = typeTodos.filter((t) => {
        if (!t.completedAt) return false;
        if (start && t.completedAt < start) return false;
        if (end && t.completedAt > end) return false;
        return true;
      }).length;
      return {
        activityTypeId: at.id,
        activityTypeName: at.name,
        totalTodos,
        completedTodos,
        totalHabits: habitsByType.get(at.id) ?? 0,
      };
    });
  };

  // --- Habit Stats Query ---

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  queryFields.habitStats!.resolve = async (
    _parent,
    args: { habitId?: string; startDate?: string; endDate?: string },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');

    const habitConditions = [eq(habits.userId, context.userId)];
    if (args.habitId) habitConditions.push(eq(habits.id, args.habitId));
    const userHabits = await context.db._query.habits.findMany({
      where: and(...habitConditions),
    });

    if (userHabits.length === 0) return [];

    const completionConditions = [
      inArray(habitCompletions.habitId, userHabits.map((h) => h.id)),
      isNotNull(habitCompletions.completedAt),
    ];
    if (args.startDate)
      completionConditions.push(gte(habitCompletions.completedAt, new Date(args.startDate)));
    if (args.endDate)
      completionConditions.push(lte(habitCompletions.completedAt, new Date(args.endDate)));

    const allCompletions = await context.db._query.habitCompletions.findMany({
      where: and(...completionConditions),
    });

    const completionsByHabit = new Map<string, number>();
    for (const c of allCompletions) {
      completionsByHabit.set(c.habitId, (completionsByHabit.get(c.habitId) ?? 0) + 1);
    }

    return userHabits.map((habit) => {
      const totalCompletions = completionsByHabit.get(habit.id) ?? 0;
      return {
        habitId: habit.id,
        title: habit.title,
        completionRate: totalCompletions / habit.frequencyCount,
        totalCompletions,
      };
    });
  };

  // --- Habit Detail Query ---

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  queryFields.myHabitDetail!.resolve = async (
    _parent,
    args: { habitId: string; periods?: number },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');

    const habit = await context.db._query.habits.findFirst({
      where: eq(habits.id, args.habitId),
    });
    if (!habit) throw new Error(`Habit ${args.habitId} not found`);
    if (habit.userId !== context.userId) throw new Error('Forbidden');

    const activityType = habit.activityTypeId
      ? await context.db._query.activityTypes.findFirst({
          where: eq(activityTypes.id, habit.activityTypeId),
        })
      : null;

    const numPeriods = Math.min(Math.max(args.periods ?? 8, 1), 26);

    const now = new Date();
    const isWeekly = habit.frequencyUnit === 'week';

    function getPeriodBounds(index: number): {
      start: Date;
      end: Date;
      label: string;
    } {
      if (isWeekly) {
        const weekStart = startOfISOWeek(now);
        const start = new Date(weekStart);
        start.setDate(start.getDate() - index * 7);
        const end = new Date(start);
        end.setDate(end.getDate() + 7);
        const label =
          index === 0
            ? 'This week'
            : index === 1
              ? 'Last week'
              : `${index}w ago`;
        return { start, end, label };
      }
      // monthly
      const year = now.getFullYear();
      const month = now.getMonth();
      const targetMonth = month - index;
      const start = new Date(year, targetMonth, 1);
      const end = new Date(year, targetMonth + 1, 1);
      const label = start.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
      return { start, end, label };
    }

    const allCompletions = await context.db._query.habitCompletions.findMany({
      where: and(
        eq(habitCompletions.habitId, args.habitId),
        isNotNull(habitCompletions.completedAt),
      ),
    });

    const totalCompletions = allCompletions.length;
    const allTimeRate = totalCompletions / habit.frequencyCount;

    const periods = Array.from({ length: numPeriods }, (_, i) => {
      const { start, end, label } = getPeriodBounds(i);
      const count = allCompletions.filter((c) => {
        if (!c.completedAt) return false;
        return c.completedAt >= start && c.completedAt < end;
      }).length;
      return {
        label,
        periodStart: start.toISOString().replace('Z', ''),
        periodEnd: end.toISOString().replace('Z', ''),
        completions: count,
        target: habit.frequencyCount,
        rate: count / habit.frequencyCount,
      };
    }).reverse();

    return {
      habitId: habit.id,
      title: habit.title,
      description: habit.description ?? null,
      priority: habit.priority,
      estimatedLength: habit.estimatedLength,
      frequencyCount: habit.frequencyCount,
      frequencyUnit: habit.frequencyUnit,
      activityType: activityType ?? null,
      totalCompletions,
      allTimeRate,
      periods,
    };
  };

  // --- Schedule Query ---

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  queryFields.mySchedule!.resolve = async (
    _parent,
    args: { weekStart?: string; timezone?: string },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');

    // If timezone provided, persist it to the user record (fire-and-forget)
    if (args.timezone) {
      context.db
        .update(users)
        .set({ timezone: args.timezone, updatedAt: new Date() })
        .where(eq(users.id, context.userId))
        .catch(console.error);
    }

    // Validate and determine week start as both a "YYYY-MM-DD" string and a Date
    const weekStartStr = args.weekStart
      ? (() => {
          const dateStr = z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'weekStart must be YYYY-MM-DD')
            .parse(args.weekStart);
          const parsed = new Date(`${dateStr}T00:00:00`);
          if (Number.isNaN(parsed.getTime())) throw new Error('Invalid weekStart date');
          return startOfISOWeekStr(parsed);
        })()
      : startOfISOWeekStr(new Date());

    const weekStart = startOfISOWeek(new Date(`${weekStartStr}T00:00:00`));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const monthStart = startOfLocalMonth(weekStart);
    const monthEnd = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      1,
    );

    // Fetch user-scoped data first (habits needed to scope completions)
    const [
      userTimeBlocks,
      allIncompleteTodos,
      userCompletedTodos,
      userHabits,
      userActivityTypes,
    ] = await Promise.all([
      context.db._query.timeBlocks.findMany({
        where: eq(timeBlocks.userId, context.userId),
      }),
      context.db._query.todos.findMany({
        where: and(
          eq(todos.userId, context.userId),
          isNull(todos.completedAt),
          isNotNull(todos.activityTypeId),
        ),
        orderBy: [desc(todos.priority)],
      }),
      context.db._query.todos.findMany({
        where: and(
          eq(todos.userId, context.userId),
          isNotNull(todos.completedAt),
          isNotNull(todos.activityTypeId),
        ),
      }),
      context.db._query.habits.findMany({
        where: and(
          eq(habits.userId, context.userId),
          isNotNull(habits.activityTypeId),
        ),
      }),
      context.db._query.activityTypes.findMany({
        where: eq(activityTypes.userId, context.userId),
      }),
    ]);

    const now = new Date();

    // Split todos: pinned show at their stored scheduledAt; unpinned go through the scheduler.
    // Overdue pinned todos (past scheduledAt, not completed) lose their pin and re-enter the
    // scheduler so they get placed at the next available future slot.
    const overduePinnedIds = allIncompleteTodos
      .filter((t) => t.isPinnedSchedule && t.scheduledAt && t.scheduledAt < now)
      .map((t) => t.id);

    if (overduePinnedIds.length > 0) {
      context.db
        .update(todos)
        .set({ isPinnedSchedule: false, scheduledAt: null, updatedAt: now })
        .where(inArray(todos.id, overduePinnedIds))
        .catch(console.error);
    }

    const pinnedTodos = allIncompleteTodos.filter(
      (t) => t.isPinnedSchedule && t.scheduledAt && !overduePinnedIds.includes(t.id),
    );
    const userTodos = allIncompleteTodos.filter(
      (t) => !t.isPinnedSchedule || overduePinnedIds.includes(t.id),
    );

    // habit_completions has no userId — scope by the user's own habit IDs
    const userHabitIds = userHabits.map((h) => h.id);

    // Guard: if user has no habits, skip completion queries entirely
    const [weekCompletions, monthCompletions] =
      userHabitIds.length === 0
        ? [[], []]
        : await Promise.all([
            context.db._query.habitCompletions.findMany({
              where: and(
                inArray(habitCompletions.habitId, userHabitIds),
                isNotNull(habitCompletions.completedAt),
                gte(habitCompletions.completedAt, weekStart),
                lte(habitCompletions.completedAt, weekEnd),
              ),
            }),
            context.db._query.habitCompletions.findMany({
              where: and(
                inArray(habitCompletions.habitId, userHabitIds),
                isNotNull(habitCompletions.completedAt),
                gte(habitCompletions.completedAt, monthStart),
                lte(habitCompletions.completedAt, monthEnd),
              ),
            }),
          ]);

    // Build activity type lookup map
    const activityTypeMap = new Map(userActivityTypes.map((at) => [at.id, at]));

    // Build completion count maps
    const weekCompletionCounts = new Map<string, number>();
    for (const c of weekCompletions) {
      weekCompletionCounts.set(
        c.habitId,
        (weekCompletionCounts.get(c.habitId) ?? 0) + 1,
      );
    }
    const monthCompletionCounts = new Map<string, number>();
    for (const c of monthCompletions) {
      monthCompletionCounts.set(
        c.habitId,
        (monthCompletionCounts.get(c.habitId) ?? 0) + 1,
      );
    }

    // Expand habits into instances — one per remaining occurrence needed this period
    const habitInstances: Array<
      (typeof userHabits)[number] & { instanceIndex: number }
    > = [];
    for (const h of userHabits) {
      if (!h.activityTypeId) continue; // skip unassignable habits
      const counts =
        h.frequencyUnit === 'week'
          ? weekCompletionCounts
          : monthCompletionCounts;
      const done = counts.get(h.id) ?? 0;
      const deficit = h.frequencyCount - done;
      if (deficit <= 0) continue;
      for (let i = 0; i < deficit; i++) {
        habitInstances.push({ ...h, instanceIndex: i });
      }
    }

    // Compute schedule — returns naive ISO strings (no Z suffix) for local-time rendering
    const items = computeSchedule(
      weekStartStr,
      userTimeBlocks,
      userTodos,
      habitInstances,
      activityTypeMap,
    );

    // Attach completedAt for todo items
    const todoCompletedAtMap = new Map(
      userCompletedTodos.map((t) => [t.id, t.completedAt]),
    );

    const scheduledItems = items.map((item) => ({
      ...item,
      completedAt:
        item.kind === 'todo'
          ? (todoCompletedAtMap.get(item.id)?.toISOString().replace('Z', '') ?? null)
          : null,
    }));

    // Pinned todos bypass the algorithm — appear at their stored scheduledAt
    const pinnedItems = pinnedTodos.map((t) => {
      const start = t.scheduledAt!;
      const end = new Date(start.getTime() + t.estimatedLength * 60_000);
      return {
        kind: 'todo' as const,
        id: t.id,
        title: t.title,
        priority: t.priority,
        estimatedLength: t.estimatedLength,
        activityType: t.activityTypeId ? (activityTypeMap.get(t.activityTypeId) ?? null) : null,
        scheduledStart: start.toISOString().replace('Z', ''),
        scheduledEnd: end.toISOString().replace('Z', ''),
        isScheduled: true,
        isOverdue: false,
        completedAt: null,
      };
    });

    return [...scheduledItems, ...pinnedItems];
  };

  // --- ActivityType Mutations ---

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  mutationFields.myCreateActivityType!.resolve = async (
    _parent,
    args: { input: unknown },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    const input = CreateActivityTypeInput.parse(args.input);
    const [activityType] = await context.db
      .insert(activityTypes)
      .values({
        userId: context.userId,
        name: input.name,
        color: input.color,
      })
      .returning();
    if (!activityType) throw new Error('Failed to create activity type');
    return activityType;
  };

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  mutationFields.myUpdateActivityType!.resolve = async (
    _parent,
    args: { input: unknown },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    const input = UpdateActivityTypeInput.parse(args.input);
    const existing = await context.db._query.activityTypes.findFirst({
      where: eq(activityTypes.id, input.id),
    });
    if (!existing) throw new Error(`ActivityType ${input.id} not found`);
    if (existing.userId !== context.userId) throw new Error('Forbidden');
    const [updated] = await context.db
      .update(activityTypes)
      .set({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.color !== undefined && { color: input.color }),
        updatedAt: new Date(),
      })
      .where(eq(activityTypes.id, input.id))
      .returning();
    if (!updated) throw new Error(`Failed to update activity type ${input.id}`);
    return updated;
  };

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  mutationFields.myDeleteActivityType!.resolve = async (
    _parent,
    args: { id: string },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    const existing = await context.db._query.activityTypes.findFirst({
      where: eq(activityTypes.id, args.id),
    });
    if (!existing) throw new Error(`ActivityType ${args.id} not found`);
    if (existing.userId !== context.userId) throw new Error('Forbidden');
    await context.db.delete(activityTypes).where(eq(activityTypes.id, args.id));
    return true;
  };

  // --- Todo Mutations ---

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  mutationFields.myCreateTodo!.resolve = async (
    _parent,
    args: { input: unknown },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    const input = CreateTodoInput.parse(args.input);
    const [todo] = await context.db
      .insert(todos)
      .values({
        userId: context.userId,
        title: input.title,
        description: input.description,
        priority: input.priority,
        estimatedLength: input.estimatedLength ?? 0,
        activityTypeId: input.activityTypeId ?? null,
        scheduledAt: input.scheduledAt
          ? new Date(input.scheduledAt)
          : undefined,
      })
      .returning();
    if (!todo) throw new Error('Failed to create todo');
    runSchedulerWriteback(context.db, context.userId).catch(console.error);
    return todo;
  };

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  mutationFields.myUpdateTodo!.resolve = async (
    _parent,
    args: { input: unknown },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    const input = UpdateTodoInput.parse(args.input);
    const existing = await context.db._query.todos.findFirst({
      where: eq(todos.id, input.id),
    });
    if (!existing) throw new Error(`Todo ${input.id} not found`);
    if (existing.userId !== context.userId) throw new Error('Forbidden');
    const [updated] = await context.db
      .update(todos)
      .set({
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.priority !== undefined && { priority: input.priority }),
        ...(input.estimatedLength !== undefined && {
          estimatedLength: input.estimatedLength,
        }),
        ...(input.activityTypeId !== undefined && {
          activityTypeId: input.activityTypeId,
        }),
        ...(input.scheduledAt !== undefined && {
          scheduledAt: new Date(input.scheduledAt),
        }),
        ...(input.isPinnedSchedule !== undefined && {
          isPinnedSchedule: input.isPinnedSchedule,
        }),
        ...('completedAt' in input && {
          completedAt: input.completedAt === null ? null : new Date(input.completedAt as string),
        }),
        updatedAt: new Date(),
      })
      .where(eq(todos.id, input.id))
      .returning();
    if (!updated) throw new Error(`Failed to update todo ${input.id}`);
    runSchedulerWriteback(context.db, context.userId).catch(console.error);
    return updated;
  };

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  mutationFields.myCompleteTodo!.resolve = async (
    _parent,
    args: { id: string },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    const existing = await context.db._query.todos.findFirst({
      where: eq(todos.id, args.id),
    });
    if (!existing) throw new Error(`Todo ${args.id} not found`);
    if (existing.userId !== context.userId) throw new Error('Forbidden');
    const [completed] = await context.db
      .update(todos)
      .set({ completedAt: new Date(), updatedAt: new Date() })
      .where(eq(todos.id, args.id))
      .returning();
    if (!completed) throw new Error(`Failed to complete todo ${args.id}`);
    return completed;
  };

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  mutationFields.myDeleteTodo!.resolve = async (
    _parent,
    args: { id: string },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    const existing = await context.db._query.todos.findFirst({
      where: eq(todos.id, args.id),
    });
    if (!existing) throw new Error(`Todo ${args.id} not found`);
    if (existing.userId !== context.userId) throw new Error('Forbidden');
    await context.db.delete(todos).where(eq(todos.id, args.id));
    runSchedulerWriteback(context.db, context.userId).catch(console.error);
    return true;
  };

  // --- Habit Mutations ---

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  mutationFields.myCreateHabit!.resolve = async (
    _parent,
    args: { input: unknown },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    const input = CreateHabitInput.parse(args.input);
    const [habit] = await context.db
      .insert(habits)
      .values({
        userId: context.userId,
        title: input.title,
        description: input.description,
        priority: input.priority,
        estimatedLength: input.estimatedLength ?? 0,
        activityTypeId: input.activityTypeId ?? null,
        frequencyCount: input.frequencyCount,
        frequencyUnit: input.frequencyUnit,
      })
      .returning();
    if (!habit) throw new Error('Failed to create habit');
    runSchedulerWriteback(context.db, context.userId).catch(console.error);
    return habit;
  };

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  mutationFields.myDeleteHabit!.resolve = async (
    _parent,
    args: { id: string },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    const existing = await context.db._query.habits.findFirst({
      where: eq(habits.id, args.id),
    });
    if (!existing) throw new Error(`Habit ${args.id} not found`);
    if (existing.userId !== context.userId) throw new Error('Forbidden');
    await context.db.delete(habits).where(eq(habits.id, args.id));
    runSchedulerWriteback(context.db, context.userId).catch(console.error);
    return true;
  };

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  mutationFields.myUpdateHabit!.resolve = async (
    _parent,
    args: { input: unknown },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    const input = UpdateHabitInput.parse(args.input);
    const existing = await context.db._query.habits.findFirst({
      where: eq(habits.id, input.id),
    });
    if (!existing) throw new Error(`Habit ${input.id} not found`);
    if (existing.userId !== context.userId) throw new Error('Forbidden');
    const [updated] = await context.db
      .update(habits)
      .set({
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.priority !== undefined && { priority: input.priority }),
        ...(input.estimatedLength !== undefined && {
          estimatedLength: input.estimatedLength,
        }),
        ...(input.activityTypeId !== undefined && {
          activityTypeId: input.activityTypeId,
        }),
        ...(input.frequencyCount !== undefined && {
          frequencyCount: input.frequencyCount,
        }),
        ...(input.frequencyUnit !== undefined && {
          frequencyUnit: input.frequencyUnit,
        }),
        updatedAt: new Date(),
      })
      .where(eq(habits.id, input.id))
      .returning();
    if (!updated) throw new Error(`Failed to update habit ${input.id}`);
    runSchedulerWriteback(context.db, context.userId).catch(console.error);
    return updated;
  };

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  mutationFields.myUpdateTimeBlock!.resolve = async (
    _parent,
    args: { input: unknown },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    const input = UpdateTimeBlockInput.parse(args.input);
    const existing = await context.db._query.timeBlocks.findFirst({
      where: eq(timeBlocks.id, input.id),
    });
    if (!existing) throw new Error(`TimeBlock ${input.id} not found`);
    if (existing.userId !== context.userId) throw new Error('Forbidden');
    const [updated] = await context.db
      .update(timeBlocks)
      .set({
        ...(input.activityTypeId !== undefined && {
          activityTypeId: input.activityTypeId,
        }),
        ...(input.daysOfWeek !== undefined && { daysOfWeek: input.daysOfWeek }),
        ...(input.startTime !== undefined && { startTime: input.startTime }),
        ...(input.endTime !== undefined && { endTime: input.endTime }),
        ...(input.priority !== undefined && { priority: input.priority }),
        updatedAt: new Date(),
      })
      .where(eq(timeBlocks.id, input.id))
      .returning();
    if (!updated) throw new Error(`Failed to update time block ${input.id}`);
    runSchedulerWriteback(context.db, context.userId).catch(console.error);
    return updated;
  };

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  mutationFields.myCompleteHabit!.resolve = async (
    _parent,
    args: { input: unknown },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    const input = CompleteHabitInput.parse(args.input);
    const habit = await context.db._query.habits.findFirst({
      where: eq(habits.id, input.habitId),
    });
    if (!habit) throw new Error(`Habit ${input.habitId} not found`);
    if (habit.userId !== context.userId) throw new Error('Forbidden');
    const [completion] = await context.db
      .insert(habitCompletions)
      .values({
        habitId: input.habitId,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
        completedAt: new Date(),
      })
      .returning();
    if (!completion) throw new Error('Failed to record habit completion');
    return completion;
  };

  // --- Time Block Mutations ---

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  mutationFields.myCreateTimeBlock!.resolve = async (
    _parent,
    args: { input: unknown },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    const input = CreateTimeBlockInput.parse(args.input);
    const [block] = await context.db
      .insert(timeBlocks)
      .values({
        userId: context.userId,
        activityTypeId: input.activityTypeId ?? null,
        daysOfWeek: input.daysOfWeek,
        startTime: input.startTime,
        endTime: input.endTime,
        priority: input.priority,
      })
      .returning();
    if (!block) throw new Error('Failed to create time block');
    runSchedulerWriteback(context.db, context.userId).catch(console.error);
    return block;
  };

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  mutationFields.myDeleteTimeBlock!.resolve = async (
    _parent,
    args: { id: string },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    const existing = await context.db._query.timeBlocks.findFirst({
      where: eq(timeBlocks.id, args.id),
    });
    if (!existing) throw new Error(`Time block ${args.id} not found`);
    if (existing.userId !== context.userId) throw new Error('Forbidden');
    await context.db.delete(timeBlocks).where(eq(timeBlocks.id, args.id));
    runSchedulerWriteback(context.db, context.userId).catch(console.error);
    return true;
  };

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  mutationFields.myReschedule!.resolve = async (
    _parent,
    args: { weekStart?: string },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    await runSchedulerWriteback(context.db, context.userId, args.weekStart);
    return true;
  };

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  mutationFields.myUpdateProfile!.resolve = async (
    _parent,
    args: { timezone: string },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    const validTimezones = Intl.supportedValuesOf('timeZone');
    if (!validTimezones.includes(args.timezone)) {
      throw new Error(`Invalid timezone: ${args.timezone}`);
    }
    await context.db
      .update(users)
      .set({ timezone: args.timezone, updatedAt: new Date() })
      .where(eq(users.id, context.userId));
    return true;
  };

  // --- Auth Mutations (public — no userId required) ---

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  mutationFields.requestMagicLink!.resolve = async (
    _parent,
    args: { email: string },
    context: Context,
  ) => {
    const email = z.string().email().parse(args.email).toLowerCase();
    const token = await signMagicToken(email);
    const baseUrl = process.env.APP_URL ?? 'http://localhost:3000';
    const magicLink = `${baseUrl}/auth/verify?token=${token}`;

    if (process.env.NODE_ENV === 'production') {
      // TODO: integrate Resend or Nodemailer
      console.log(`[auth] Magic link for ${email}: ${magicLink}`);
      return { ok: true, magicLink: null };
    }

    console.log(`\n[auth] Magic link for ${email}:\n${magicLink}\n`);
    return { ok: true, magicLink };
  };

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  mutationFields.verifyMagicLink!.resolve = async (
    _parent,
    args: { token: string },
    context: Context,
  ) => {
    const payload = await verifyToken(args.token);
    if (!payload?.email) throw new Error('Invalid or expired magic link');

    let user = await context.db._query.users.findFirst({
      where: eq(users.email, payload.email),
    });
    if (!user) {
      const [created] = await context.db
        .insert(users)
        .values({ email: payload.email })
        .returning();
      if (!created) throw new Error('Failed to create user');
      user = created;
    }

    const sessionToken = await signSessionToken(user.id, user.email);
    return { token: sessionToken, userId: user.id };
  };

  // --- ActivityType Field Resolvers ---

  type RowWithActivityTypeId = { activityTypeId?: string | null };

  function resolveActivityType(parent: RowWithActivityTypeId, _args: unknown, context: Context) {
    if (!parent.activityTypeId) return null;
    return context.loaders.activityType.load(parent.activityTypeId);
  }

  const todoType = extended.getType('Todo') as GraphQLObjectType;
  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  todoType.getFields().activityType!.resolve = resolveActivityType;

  const habitType = extended.getType('Habit') as GraphQLObjectType;
  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  habitType.getFields().activityType!.resolve = resolveActivityType;

  const timeBlockType = extended.getType('TimeBlock') as GraphQLObjectType;
  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  timeBlockType.getFields().activityType!.resolve = resolveActivityType;

  return extended;
}
