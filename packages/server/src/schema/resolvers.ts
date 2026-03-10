import {
  type GraphQLObjectType,
  type GraphQLSchema,
  extendSchema,
  parse,
} from 'graphql';
import { eq, and, gte, lte, count, desc } from 'drizzle-orm';
import {
  todos,
  habits,
  habitCompletions,
  timeBlocks,
} from '@auto-cal/db/schema';
import type { Context } from '../context.ts';
import { z } from 'zod';
import {
  ACTIVITY_TYPES,
  FREQUENCY_UNITS,
  type ActivityType,
  type FrequencyUnit,
} from '@auto-cal/db/schema';

// Input validation schemas
const CreateTodoInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: z.number().int().min(0).max(100).default(0),
  estimatedLength: z.number().int().min(1).max(1440), // max 24 hours
  activityType: z.enum(ACTIVITY_TYPES),
});

const UpdateTodoInput = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  priority: z.number().int().min(0).max(100).optional(),
  estimatedLength: z.number().int().min(1).max(1440).optional(),
  activityType: z.enum(ACTIVITY_TYPES).optional(),
  scheduledAt: z.string().datetime().optional(),
});

const CreateHabitInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: z.number().int().min(0).max(100).default(0),
  estimatedLength: z.number().int().min(1).max(1440),
  activityType: z.enum(ACTIVITY_TYPES),
  frequencyCount: z.number().int().min(1).max(30),
  frequencyUnit: z.enum(FREQUENCY_UNITS),
});

const CreateTimeBlockInput = z.object({
  activityType: z.enum(ACTIVITY_TYPES),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

const CompleteHabitInput = z.object({
  habitId: z.string().uuid(),
  scheduledAt: z.string().datetime().optional(),
});

export function applyCustomResolvers(
  schema: GraphQLSchema,
): GraphQLSchema {
  // Extend the schema with custom mutations and queries
  const extended = extendSchema(
    schema,
    parse(`
    type ActivityStats {
      activityType: String!
      totalTodos: Int!
      completedTodos: Int!
      totalHabits: Int!
      completedHabits: Int!
    }

    type HabitStats {
      habitId: String!
      targetCount: Int!
      completedCount: Int!
      completionRate: Float!
    }

    extend type Query {
      myTodos(activityType: String, completed: Boolean): [todos!]!
      myHabits(activityType: String): [habits!]!
      myTimeBlocks(activityType: String, dayOfWeek: Int): [time_blocks!]!
      activityStats(startDate: String, endDate: String): [ActivityStats!]!
      habitStats(habitId: String!, startDate: String!, endDate: String!): HabitStats!
    }

    extend type Mutation {
      createTodo(input: CreateTodoInput!): todos!
      updateTodo(input: UpdateTodoInput!): todos!
      completeTodo(id: String!): todos!
      deleteTodo(id: String!): Boolean!
      
      createHabit(input: CreateHabitInput!): habits!
      deleteHabit(id: String!): Boolean!
      completeHabit(input: CompleteHabitInput!): habit_completions!
      
      createTimeBlock(input: CreateTimeBlockInput!): time_blocks!
      deleteTimeBlock(id: String!): Boolean!
    }

    input CreateTodoInput {
      title: String!
      description: String
      priority: Int
      estimatedLength: Int!
      activityType: String!
    }

    input UpdateTodoInput {
      id: String!
      title: String
      description: String
      priority: Int
      estimatedLength: Int
      activityType: String
      scheduledAt: String
    }

    input CreateHabitInput {
      title: String!
      description: String
      priority: Int
      estimatedLength: Int!
      activityType: String!
      frequencyCount: Int!
      frequencyUnit: String!
    }

    input CreateTimeBlockInput {
      activityType: String!
      dayOfWeek: Int!
      startTime: String!
      endTime: String!
    }

    input CompleteHabitInput {
      habitId: String!
      scheduledAt: String
    }
  `),
  );

  // Add resolvers to Query type
  const queryType = extended.getType('Query') as GraphQLObjectType;
  const queryFields = queryType.getFields();

  queryFields.myTodos.resolve = async (_parent, args, context: Context) => {
    if (!context.userId) throw new Error('Not authenticated');

    const conditions = [eq(todos.userId, context.userId)];

    if (args.activityType) {
      conditions.push(eq(todos.activityType, args.activityType));
    }

    if (args.completed === true) {
      conditions.push(eq(todos.completedAt, null));
    } else if (args.completed === false) {
      conditions.push(eq(todos.completedAt, null));
    }

    return context.db.query.todos.findMany({
      where: and(...conditions),
      orderBy: [desc(todos.priority), desc(todos.createdAt)],
    });
  };

  queryFields.myHabits.resolve = async (_parent, args, context: Context) => {
    if (!context.userId) throw new Error('Not authenticated');

    const conditions = [eq(habits.userId, context.userId)];

    if (args.activityType) {
      conditions.push(eq(habits.activityType, args.activityType));
    }

    return context.db.query.habits.findMany({
      where: and(...conditions),
      orderBy: [desc(habits.priority), desc(habits.createdAt)],
    });
  };

  queryFields.myTimeBlocks.resolve = async (
    _parent,
    args,
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');

    const conditions = [eq(timeBlocks.userId, context.userId)];

    if (args.activityType) {
      conditions.push(eq(timeBlocks.activityType, args.activityType));
    }

    if (args.dayOfWeek !== undefined) {
      conditions.push(eq(timeBlocks.dayOfWeek, args.dayOfWeek));
    }

    return context.db.query.timeBlocks.findMany({
      where: and(...conditions),
      orderBy: [timeBlocks.dayOfWeek, timeBlocks.startTime],
    });
  };

  queryFields.activityStats.resolve = async (
    _parent,
    args,
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');

    // This is a simplified version - would need more complex aggregation
    const stats: Array<{
      activityType: string;
      totalTodos: number;
      completedTodos: number;
      totalHabits: number;
      completedHabits: number;
    }> = [];

    for (const activityType of ACTIVITY_TYPES) {
      const allTodos = await context.db.query.todos.findMany({
        where: and(
          eq(todos.userId, context.userId),
          eq(todos.activityType, activityType),
        ),
      });

      const completedTodos = allTodos.filter((t) => t.completedAt !== null);

      const allHabits = await context.db.query.habits.findMany({
        where: and(
          eq(habits.userId, context.userId),
          eq(habits.activityType, activityType),
        ),
      });

      stats.push({
        activityType,
        totalTodos: allTodos.length,
        completedTodos: completedTodos.length,
        totalHabits: allHabits.length,
        completedHabits: 0, // Placeholder - would need completion calculation
      });
    }

    return stats;
  };

  queryFields.habitStats.resolve = async (
    _parent,
    args,
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');

    const habit = await context.db.query.habits.findFirst({
      where: eq(habits.id, args.habitId),
    });

    if (!habit) throw new Error(`Habit ${args.habitId} not found`);
    if (habit.userId !== context.userId) throw new Error('Forbidden');

    const completions = await context.db.query.habitCompletions.findMany({
      where: and(
        eq(habitCompletions.habitId, args.habitId),
        gte(habitCompletions.completedAt, new Date(args.startDate)),
        lte(habitCompletions.completedAt, new Date(args.endDate)),
      ),
    });

    return {
      habitId: args.habitId,
      targetCount: habit.frequencyCount,
      completedCount: completions.length,
      completionRate: completions.length / habit.frequencyCount,
    };
  };

  // Add resolvers to Mutation type
  const mutationType = extended.getType('Mutation') as GraphQLObjectType;
  const mutationFields = mutationType.getFields();

  mutationFields.createTodo.resolve = async (
    _parent,
    args,
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');

    const input = CreateTodoInput.parse(args.input);

    const [todo] = await context.db
      .insert(todos)
      .values({
        ...input,
        userId: context.userId,
      })
      .returning();

    if (!todo) throw new Error('Failed to create todo');

    return todo;
  };

  mutationFields.updateTodo.resolve = async (
    _parent,
    args,
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');

    const input = UpdateTodoInput.parse(args.input);

    const existing = await context.db.query.todos.findFirst({
      where: eq(todos.id, input.id),
    });

    if (!existing) throw new Error(`Todo ${input.id} not found`);
    if (existing.userId !== context.userId) throw new Error('Forbidden');

    const { id, ...updates } = input;

    const [updated] = await context.db
      .update(todos)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(todos.id, id))
      .returning();

    if (!updated) throw new Error('Failed to update todo');

    return updated;
  };

  mutationFields.completeTodo.resolve = async (
    _parent,
    args,
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');

    const existing = await context.db.query.todos.findFirst({
      where: eq(todos.id, args.id),
    });

    if (!existing) throw new Error(`Todo ${args.id} not found`);
    if (existing.userId !== context.userId) throw new Error('Forbidden');

    const [updated] = await context.db
      .update(todos)
      .set({ completedAt: new Date(), updatedAt: new Date() })
      .where(eq(todos.id, args.id))
      .returning();

    if (!updated) throw new Error('Failed to complete todo');

    return updated;
  };

  mutationFields.deleteTodo.resolve = async (
    _parent,
    args,
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');

    const existing = await context.db.query.todos.findFirst({
      where: eq(todos.id, args.id),
    });

    if (!existing) throw new Error(`Todo ${args.id} not found`);
    if (existing.userId !== context.userId) throw new Error('Forbidden');

    await context.db.delete(todos).where(eq(todos.id, args.id));

    return true;
  };

  mutationFields.createHabit.resolve = async (
    _parent,
    args,
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');

    const input = CreateHabitInput.parse(args.input);

    const [habit] = await context.db
      .insert(habits)
      .values({
        ...input,
        userId: context.userId,
      })
      .returning();

    if (!habit) throw new Error('Failed to create habit');

    return habit;
  };

  mutationFields.deleteHabit.resolve = async (
    _parent,
    args,
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');

    const existing = await context.db.query.habits.findFirst({
      where: eq(habits.id, args.id),
    });

    if (!existing) throw new Error(`Habit ${args.id} not found`);
    if (existing.userId !== context.userId) throw new Error('Forbidden');

    await context.db.delete(habits).where(eq(habits.id, args.id));

    return true;
  };

  mutationFields.completeHabit.resolve = async (
    _parent,
    args,
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');

    const input = CompleteHabitInput.parse(args.input);

    const habit = await context.db.query.habits.findFirst({
      where: eq(habits.id, input.habitId),
    });

    if (!habit) throw new Error(`Habit ${input.habitId} not found`);
    if (habit.userId !== context.userId) throw new Error('Forbidden');

    const [completion] = await context.db
      .insert(habitCompletions)
      .values({
        habitId: input.habitId,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      })
      .returning();

    if (!completion) throw new Error('Failed to record habit completion');

    return completion;
  };

  mutationFields.createTimeBlock.resolve = async (
    _parent,
    args,
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');

    const input = CreateTimeBlockInput.parse(args.input);

    const [timeBlock] = await context.db
      .insert(timeBlocks)
      .values({
        ...input,
        userId: context.userId,
      })
      .returning();

    if (!timeBlock) throw new Error('Failed to create time block');

    return timeBlock;
  };

  mutationFields.deleteTimeBlock.resolve = async (
    _parent,
    args,
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');

    const existing = await context.db.query.timeBlocks.findFirst({
      where: eq(timeBlocks.id, args.id),
    });

    if (!existing) throw new Error(`Time block ${args.id} not found`);
    if (existing.userId !== context.userId) throw new Error('Forbidden');

    await context.db.delete(timeBlocks).where(eq(timeBlocks.id, args.id));

    return true;
  };

  return extended;
}
