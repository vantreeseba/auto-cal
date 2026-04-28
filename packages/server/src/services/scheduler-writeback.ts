import type { DB } from '@auto-cal/db';
import {
  activityTypes,
  habitCompletions,
  habits,
  timeBlocks,
  todos,
} from '@auto-cal/db/schema';
import { and, eq, inArray, isNotNull, isNull, ne } from 'drizzle-orm';
import {
  computeSchedule,
  startOfISOWeek,
  startOfISOWeekStr,
  startOfLocalMonth,
} from './scheduler.ts';

export async function runSchedulerWriteback(
  db: DB,
  userId: string,
  weekStartStr?: string, // "YYYY-MM-DD", defaults to current ISO week
): Promise<void> {
  const resolvedWeekStartStr =
    weekStartStr ?? startOfISOWeekStr(new Date());

  const weekStart = startOfISOWeek(new Date(`${resolvedWeekStartStr}T00:00:00`));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const monthStart = startOfLocalMonth(weekStart);
  const monthEnd = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    1,
  );

  // Fetch all user data in parallel
  const [
    userTimeBlocks,
    userTodos,
    userHabits,
    userActivityTypes,
  ] = await Promise.all([
    db._query.timeBlocks.findMany({
      where: eq(timeBlocks.userId, userId),
    }),
    db._query.todos.findMany({
      where: and(
        eq(todos.userId, userId),
        isNull(todos.completedAt),
        isNotNull(todos.activityTypeId),
        ne(todos.isPinnedSchedule, true),
      ),
    }),
    db._query.habits.findMany({
      where: and(
        eq(habits.userId, userId),
        isNotNull(habits.activityTypeId),
      ),
    }),
    db._query.activityTypes.findMany({
      where: eq(activityTypes.userId, userId),
    }),
  ]);

  const userHabitIds = userHabits.map((h) => h.id);

  // Fetch actual (non-tentative) completions for week and month periods
  const [weekActualCompletions, monthActualCompletions] =
    userHabitIds.length === 0
      ? [[], []]
      : await Promise.all([
          db._query.habitCompletions.findMany({
            where: and(
              inArray(habitCompletions.habitId, userHabitIds),
              isNotNull(habitCompletions.completedAt),
              // completedAt >= weekStart: filter by date range
              // We use a raw condition since drizzle gte requires non-null
            ),
          }),
          db._query.habitCompletions.findMany({
            where: and(
              inArray(habitCompletions.habitId, userHabitIds),
              isNotNull(habitCompletions.completedAt),
            ),
          }),
        ]);

  // Filter by date range in memory (completedAt is now Date | null)
  const weekCompletions = weekActualCompletions.filter((c) => {
    if (!c.completedAt) return false;
    return c.completedAt >= weekStart && c.completedAt <= weekEnd;
  });

  const monthCompletions = monthActualCompletions.filter((c) => {
    if (!c.completedAt) return false;
    return c.completedAt >= monthStart && c.completedAt <= monthEnd;
  });

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

  // Expand habits into instances
  const habitInstances: Array<(typeof userHabits)[number] & { instanceIndex: number }> = [];
  for (const h of userHabits) {
    if (!h.activityTypeId) continue;
    const counts =
      h.frequencyUnit === 'week' ? weekCompletionCounts : monthCompletionCounts;
    const done = counts.get(h.id) ?? 0;
    const deficit = h.frequencyCount - done;
    if (deficit <= 0) continue;
    for (let i = 0; i < deficit; i++) {
      habitInstances.push({ ...h, instanceIndex: i });
    }
  }

  // Compute schedule
  const items = computeSchedule(
    resolvedWeekStartStr,
    userTimeBlocks,
    userTodos,
    habitInstances,
    activityTypeMap,
  );

  // Update todos.scheduledAt for all incomplete todos
  const todoItems = items.filter((item) => item.kind === 'todo');
  await Promise.all(
    todoItems.map((item) =>
      db
        .update(todos)
        .set({
          scheduledAt: item.scheduledStart ? new Date(item.scheduledStart) : null,
          updatedAt: new Date(),
        })
        .where(eq(todos.id, item.id)),
    ),
  );

  // Delete existing tentative habit_completion rows for the week (completedAt IS NULL)
  if (userHabitIds.length > 0) {
    await db
      .delete(habitCompletions)
      .where(
        and(
          inArray(habitCompletions.habitId, userHabitIds),
          isNull(habitCompletions.completedAt),
        ),
      );
  }

  // Insert new tentative habit_completion rows for each scheduled habit instance
  const habitItems = items.filter(
    (item) => item.kind === 'habit' && item.isScheduled && item.scheduledStart,
  );

  if (habitItems.length > 0) {
    await db.insert(habitCompletions).values(
      habitItems.map((item) => ({
        // Strip the "-N" suffix to get the real habitId
        habitId: item.id.replace(/-\d+$/, ''),
        scheduledAt: item.scheduledStart ? new Date(item.scheduledStart) : null,
        completedAt: null, // tentative — no completedAt
      })),
    );
  }
}
