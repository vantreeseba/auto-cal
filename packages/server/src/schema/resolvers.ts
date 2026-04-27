import {
  type Todo,
  activityTypes,
  habitCompletions,
  habits,
  timeBlocks,
  todos,
} from '@auto-cal/db/schema';
import { and, desc, eq, gte, isNotNull, isNull, lte, sql } from 'drizzle-orm';
import {
  type GraphQLObjectType,
  type GraphQLSchema,
  extendSchema,
  parse,
} from 'graphql';
import { z } from 'zod';
import type { Context } from '../context.ts';

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
  scheduledAt: z.string().datetime().optional(),
});

const UpdateTodoInput = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  priority: z.number().int().min(0).max(100).optional(),
  estimatedLength: z.number().int().min(1).max(1440).optional(),
  activityTypeId: z.string().uuid().nullable().optional(),
  scheduledAt: z.string().datetime().optional(),
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
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

const CompleteHabitInput = z.object({
  habitId: z.string().uuid(),
  scheduledAt: z.string().datetime().optional(),
});

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
  }

  input CompleteHabitArgs {
    habitId: ID!
    scheduledAt: String
  }

  extend type Query {
    myActivityTypes: [ActivityType!]!
    myTodos(activityTypeId: ID, completed: Boolean): [Todo!]!
    myHabits(activityTypeId: ID): [Habit!]!
    myTimeBlocks(activityTypeId: ID, containsDay: Int): [TimeBlock!]!
    activityTypeStats(startDate: String, endDate: String): [ActivityTypeStats!]!
    habitStats(habitId: ID, startDate: String, endDate: String): [HabitStats!]!
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
    myCompleteHabit(input: CompleteHabitArgs!): HabitCompletion!
    myCreateTimeBlock(input: CreateTimeBlockArgs!): TimeBlock!
    myDeleteTimeBlock(id: ID!): Boolean!
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

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  queryFields.myTodos!.resolve = async (
    _parent,
    args: { activityTypeId?: string; completed?: boolean },
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
      orderBy: [desc(todos.priority), desc(todos.createdAt)],
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
    const userActivityTypes = await context.db._query.activityTypes.findMany({
      where: eq(activityTypes.userId, context.userId),
    });
    const results = [];
    for (const activityType of userActivityTypes) {
      const todoConditions = [
        eq(todos.userId, context.userId),
        eq(todos.activityTypeId, activityType.id),
      ];
      if (args.startDate)
        todoConditions.push(gte(todos.createdAt, new Date(args.startDate)));
      if (args.endDate)
        todoConditions.push(lte(todos.createdAt, new Date(args.endDate)));
      const allTodos = await context.db._query.todos.findMany({
        where: and(...todoConditions),
      });
      const completedTodos = allTodos.filter(
        (t: Todo) => t.completedAt !== null,
      );
      const habitConditions = [
        eq(habits.userId, context.userId),
        eq(habits.activityTypeId, activityType.id),
      ];
      const allHabits = await context.db._query.habits.findMany({
        where: and(...habitConditions),
      });
      results.push({
        activityTypeId: activityType.id,
        activityTypeName: activityType.name,
        totalTodos: allTodos.length,
        completedTodos: completedTodos.length,
        totalHabits: allHabits.length,
      });
    }
    return results;
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
    const results = [];
    for (const habit of userHabits) {
      const completionConditions = [eq(habitCompletions.habitId, habit.id)];
      if (args.startDate)
        completionConditions.push(
          gte(habitCompletions.completedAt, new Date(args.startDate)),
        );
      if (args.endDate)
        completionConditions.push(
          lte(habitCompletions.completedAt, new Date(args.endDate)),
        );
      const completions = await context.db._query.habitCompletions.findMany({
        where: and(...completionConditions),
      });
      results.push({
        habitId: habit.id,
        title: habit.title,
        completionRate: completions.length / habit.frequencyCount,
        totalCompletions: completions.length,
      });
    }
    return results;
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
        updatedAt: new Date(),
      })
      .where(eq(todos.id, input.id))
      .returning();
    if (!updated) throw new Error(`Failed to update todo ${input.id}`);
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
    return true;
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
      })
      .returning();
    if (!block) throw new Error('Failed to create time block');
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
    return true;
  };

  return extended;
}
