import { todos } from '@auto-cal/db/schema';
import { eq } from 'drizzle-orm';
import type { GraphQLObjectType } from 'graphql';
import type { InnerOrder, TodoOrderBy } from '../../__generated__/resolvers.ts';
import type { Context } from '../../context.ts';
import { runSchedulerWriteback } from '../../services/scheduler-writeback.ts';
import { CreateTodoInput, UpdateTodoInput } from '../validators.ts';

type Fields = ReturnType<GraphQLObjectType['getFields']>;

function buildTodoOrderBy(
  orderBy?: TodoOrderBy,
): Record<string, 'asc' | 'desc'> {
  if (!orderBy) return { priority: 'desc', createdAt: 'desc' };
  const entries = Object.entries(orderBy)
    .filter((e): e is [string, InnerOrder] => e[1] != null)
    .sort(([, a], [, b]) => a.priority - b.priority);
  if (entries.length === 0) return { priority: 'desc', createdAt: 'desc' };
  return Object.fromEntries(
    entries.map(([field, inner]) => [field, inner.direction]),
  );
}

export function applyTodoResolvers(
  queryFields: Fields,
  mutationFields: Fields,
): void {
  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  queryFields.myTodos!.resolve = async (
    _parent,
    args: {
      activityTypeId?: string;
      completed?: boolean;
      orderBy?: TodoOrderBy;
    },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    const where: Record<string, unknown> = { userId: context.userId };
    if (args.activityTypeId) where.activityTypeId = args.activityTypeId;
    if (args.completed === true) where.completedAt = { isNotNull: true };
    else if (args.completed === false) where.completedAt = { isNull: true };
    return context.db.query.todos.findMany({
      where,
      orderBy: buildTodoOrderBy(args.orderBy),
    });
  };

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
        activityTypeId: input.activityTypeId,
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
    const existing = await context.db.query.todos.findFirst({
      where: { id: input.id },
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
        ...(input.manuallyScheduled !== undefined && {
          manuallyScheduled: input.manuallyScheduled,
        }),
        ...('completedAt' in input && {
          completedAt:
            input.completedAt === null
              ? null
              : new Date(input.completedAt as string),
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
    args: { id: string; completedAt?: string },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    const existing = await context.db.query.todos.findFirst({
      where: { id: args.id },
    });
    if (!existing) throw new Error(`Todo ${args.id} not found`);
    if (existing.userId !== context.userId) throw new Error('Forbidden');
    const completedAt = args.completedAt
      ? new Date(args.completedAt)
      : new Date();
    // Move scheduledAt to match completedAt — the calendar record reflects
    // *when the work actually happened*, not when it was originally planned.
    // If completed early, this frees the original future slot for the
    // scheduler to backfill on the next writeback.
    const [completed] = await context.db
      .update(todos)
      .set({
        completedAt,
        scheduledAt: completedAt,
        updatedAt: new Date(),
      })
      .where(eq(todos.id, args.id))
      .returning();
    if (!completed) throw new Error(`Failed to complete todo ${args.id}`);
    runSchedulerWriteback(context.db, context.userId).catch(console.error);
    return completed;
  };

  // biome-ignore lint/style/noNonNullAssertion: field is defined in SDL above
  mutationFields.myDeleteTodo!.resolve = async (
    _parent,
    args: { id: string },
    context: Context,
  ) => {
    if (!context.userId) throw new Error('Not authenticated');
    const existing = await context.db.query.todos.findFirst({
      where: { id: args.id },
    });
    if (!existing) throw new Error(`Todo ${args.id} not found`);
    if (existing.userId !== context.userId) throw new Error('Forbidden');
    await context.db.delete(todos).where(eq(todos.id, args.id));
    runSchedulerWriteback(context.db, context.userId).catch(console.error);
    return true;
  };
}
