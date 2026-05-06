import type {
  ActivityType,
  DB,
  Habit,
  HabitCompletion,
  TimeBlock,
  Todo,
} from '@auto-cal/db';
import {
  habitCompletions,
  todos,
} from '@auto-cal/db/schema';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import {
  computeSchedule,
  startOfISOWeek,
  startOfLocalMonth,
} from './scheduler.ts';

const HORIZON_MONTHS = 2;

/** Format a Date as "YYYY-MM-DD" using local date parts */
function dateToWeekStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Count habit completions by habitId within [start, end) using the given timestamp field */
function countByPeriod(
  completions: Array<{
    habitId: string;
    completedAt: Date | null;
    scheduledAt: Date | null;
  }>,
  field: 'completedAt' | 'scheduledAt',
  start: Date,
  end: Date,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const c of completions) {
    const ts = c[field];
    if (!ts) continue;
    if (ts >= start && ts < end) {
      counts.set(c.habitId, (counts.get(c.habitId) ?? 0) + 1);
    }
  }
  return counts;
}

/** Merge two count maps (add values for same key) */
function addCounts(
  a: Map<string, number>,
  b: Map<string, number>,
): Map<string, number> {
  const result = new Map(a);
  for (const [k, v] of b) {
    result.set(k, (result.get(k) ?? 0) + v);
  }
  return result;
}

export async function runSchedulerWriteback(
  db: DB,
  userId: string,
): Promise<void> {
  const now = new Date();
  const horizonEnd = new Date(now);
  horizonEnd.setMonth(horizonEnd.getMonth() + HORIZON_MONTHS);

  // ── Fetch all user data in one round-trip ──────────────────────────────────
  const [
    userTimeBlocks,
    allIncompleteTodos,
    userHabits,
    userActivityTypes,
    allActualCompletions,
  ] = (await Promise.all([
    db.query.timeBlocks.findMany({
      where: { userId },
    }),
    db.query.todos.findMany({
      where: {
        userId,
        completedAt: { isNull: true },
        activityTypeId: { isNotNull: true },
        OR: [
          { manuallyScheduled: { ne: true } },
          { manuallyScheduled: true, scheduledAt: { lt: now } },
        ],
      },
    }),
    db.query.habits.findMany({
      where: { userId, activityTypeId: { isNotNull: true } },
    }),
    db.query.activityTypes.findMany({
      where: { userId },
    }),
    // Filter through the habit relation to scope by userId — no separate query needed
    db.query.habitCompletions.findMany({
      where: {
        habit: { userId },
        completedAt: { isNotNull: true },
      },
    }),
  ])) as [TimeBlock[], Todo[], Habit[], ActivityType[], HabitCompletion[]];

  // ── Reset overdue manually-scheduled todos ─────────────────────────────────
  const overduePinnedIds = allIncompleteTodos
    .filter((t) => t.manuallyScheduled && t.scheduledAt && t.scheduledAt < now)
    .map((t) => t.id);

  if (overduePinnedIds.length > 0) {
    await db
      .update(todos)
      .set({ manuallyScheduled: false, scheduledAt: null, updatedAt: now })
      .where(inArray(todos.id, overduePinnedIds));
  }

  const userTodos = allIncompleteTodos.map((t) =>
    overduePinnedIds.includes(t.id)
      ? { ...t, manuallyScheduled: false, scheduledAt: null }
      : t,
  );

  const activityTypeMap = new Map<string, ActivityType>(
    userActivityTypes.map((at) => [at.id, at]),
  );

  // ── Iterate week-by-week over the 2-month horizon ─────────────────────────
  let todoPool = [...userTodos];
  const todoSchedules = new Map<string, Date | null>();
  const newTentativeCompletions: Array<{
    habitId: string;
    scheduledAt: Date | null;
    completedAt: null;
  }> = [];

  let weekCursor = startOfISOWeek(now);
  while (weekCursor < horizonEnd) {
    const weekStartStr = dateToWeekStr(weekCursor);
    const weekEnd = new Date(weekCursor);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const monthStart = startOfLocalMonth(weekCursor);
    const monthEnd = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      1,
    );

    const actualWeek = countByPeriod(
      allActualCompletions as Array<{
        habitId: string;
        completedAt: Date | null;
        scheduledAt: Date | null;
      }>,
      'completedAt',
      weekCursor,
      weekEnd,
    );
    const actualMonth = countByPeriod(
      allActualCompletions as Array<{
        habitId: string;
        completedAt: Date | null;
        scheduledAt: Date | null;
      }>,
      'completedAt',
      monthStart,
      monthEnd,
    );

    const tentativeWeek = countByPeriod(
      newTentativeCompletions,
      'scheduledAt',
      weekCursor,
      weekEnd,
    );
    const tentativeMonth = countByPeriod(
      newTentativeCompletions,
      'scheduledAt',
      monthStart,
      monthEnd,
    );

    const weekCounts = addCounts(actualWeek, tentativeWeek);
    const monthCounts = addCounts(actualMonth, tentativeMonth);

    const habitInstances: Array<
      (typeof userHabits)[number] & { instanceIndex: number }
    > = [];
    for (const h of userHabits) {
      if (!h.activityTypeId) continue;
      const counts = h.frequencyUnit === 'week' ? weekCounts : monthCounts;
      const done = counts.get(h.id) ?? 0;
      const deficit = h.frequencyCount - done;
      for (let i = 0; i < deficit; i++) {
        habitInstances.push({ ...h, instanceIndex: i });
      }
    }

    const items = computeSchedule(
      weekStartStr,
      userTimeBlocks,
      todoPool,
      habitInstances,
      activityTypeMap,
    );

    const placedTodoIds = new Set(
      items.filter((i) => i.kind === 'todo' && i.isScheduled).map((i) => i.id),
    );
    todoPool = todoPool.filter((t) => !placedTodoIds.has(t.id));

    for (const item of items) {
      if (item.kind === 'todo') {
        todoSchedules.set(
          item.id,
          item.scheduledStart ? new Date(item.scheduledStart) : null,
        );
      }
    }

    for (const item of items) {
      if (item.kind === 'habit' && item.isScheduled && item.scheduledStart) {
        newTentativeCompletions.push({
          habitId: item.id.replace(/-\d+$/, ''),
          scheduledAt: new Date(item.scheduledStart),
          completedAt: null,
        });
      }
    }

    weekCursor = weekEnd;
  }

  for (const todo of todoPool) {
    if (!todoSchedules.has(todo.id)) {
      todoSchedules.set(todo.id, null);
    }
  }

  // ── Write todo scheduledAt values ──────────────────────────────────────────
  await Promise.all(
    [...todoSchedules.entries()].map(([id, scheduledAt]) =>
      db
        .update(todos)
        .set({ scheduledAt, updatedAt: new Date() })
        .where(eq(todos.id, id)),
    ),
  );

  // ── Replace tentative habit completions ────────────────────────────────────
  const userHabitIds = userHabits.map((h) => h.id);
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

  if (newTentativeCompletions.length > 0) {
    await db.insert(habitCompletions).values(newTentativeCompletions);
  }
}
