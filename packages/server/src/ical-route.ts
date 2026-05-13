import { db } from '@auto-cal/db';
import type {
  ActivityType,
  Habit,
  HabitCompletion,
  TimeBlock,
  Todo,
} from '@auto-cal/db';
import type { Request, Response } from 'express';
import ical from 'ical-generator';
import {
  computeSchedule,
  startOfISOWeek,
  startOfISOWeekStr,
  startOfLocalMonth,
} from './services/scheduler.ts';

function addWeeks(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + n * 7);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function icalHandler(req: Request, res: Response): Promise<void> {
  const { userId } = req.query;

  if (
    !userId ||
    typeof userId !== 'string' ||
    !/^[0-9a-f-]{36}$/i.test(userId)
  ) {
    res.status(400).send('Invalid userId');
    return;
  }

  const user = await db.query.users.findFirst({ where: { id: userId } });
  if (!user) {
    res.status(404).send('User not found');
    return;
  }

  const timezone = user.timezone || 'UTC';
  const weekStartStr = startOfISOWeekStr(new Date());

  const [timeBlocks, todos, habits, activityTypes]: [
    TimeBlock[],
    Todo[],
    Habit[],
    ActivityType[],
  ] = await Promise.all([
    db.query.timeBlocks.findMany({ where: { userId } }),
    db.query.todos.findMany({
      where: {
        userId,
        completedAt: { isNull: true },
        activityTypeId: { isNotNull: true },
      },
    }),
    db.query.habits.findMany({
      where: { userId, activityTypeId: { isNotNull: true } },
    }),
    db.query.activityTypes.findMany({ where: { userId } }),
  ]);

  const activityTypeMap = new Map<string, ActivityType>(
    activityTypes.map((at) => [at.id, at]),
  );
  const habitIds = habits.map((h) => h.id);

  const cal = ical({ name: 'Auto Cal' });

  for (let w = 0; w < 2; w++) {
    const ws = addWeeks(weekStartStr, w);
    const weekStart = startOfISOWeek(new Date(`${ws}T00:00:00`));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const monthStart = startOfLocalMonth(weekStart);
    const monthEnd = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      1,
    );

    const [weekCompletions, monthCompletions]: [
      HabitCompletion[],
      HabitCompletion[],
    ] =
      habitIds.length === 0
        ? [[], []]
        : await Promise.all([
            db.query.habitCompletions.findMany({
              where: {
                habitId: { in: habitIds },
                completedAt: { isNotNull: true, gte: weekStart, lte: weekEnd },
              },
            }),
            db.query.habitCompletions.findMany({
              where: {
                habitId: { in: habitIds },
                completedAt: {
                  isNotNull: true,
                  gte: monthStart,
                  lte: monthEnd,
                },
              },
            }),
          ]);

    const weekCounts = new Map<string, number>();
    for (const c of weekCompletions) {
      weekCounts.set(c.habitId, (weekCounts.get(c.habitId) ?? 0) + 1);
    }
    const monthCounts = new Map<string, number>();
    for (const c of monthCompletions) {
      monthCounts.set(c.habitId, (monthCounts.get(c.habitId) ?? 0) + 1);
    }

    const habitInstances: Array<Habit & { instanceIndex: number }> = [];
    for (const h of habits) {
      if (!h.activityTypeId) continue;
      const counts = h.frequencyUnit === 'week' ? weekCounts : monthCounts;
      const done = counts.get(h.id) ?? 0;
      const deficit = h.frequencyCount - done;
      if (deficit <= 0) continue;
      for (let i = 0; i < deficit; i++) {
        habitInstances.push({ ...h, instanceIndex: i });
      }
    }

    const items = computeSchedule(
      ws,
      timeBlocks,
      todos,
      habitInstances,
      activityTypeMap,
      timezone,
    );

    for (const item of items) {
      if (!item.isScheduled || !item.scheduledStart || !item.scheduledEnd)
        continue;

      cal.createEvent({
        id: `${item.id}-${ws}@auto-cal`,
        // scheduledStart/End are UTC ISO strings — parse directly
        start: new Date(item.scheduledStart),
        end: new Date(item.scheduledEnd),
        summary: item.title,
        description: [
          `Type: ${item.kind === 'todo' ? 'Todo' : 'Habit'}`,
          item.activityType ? `Activity: ${item.activityType.name}` : null,
          `Priority: ${item.priority}`,
          `Estimated: ${item.estimatedLength} min`,
        ]
          .filter(Boolean)
          .join('\n'),
      });
    }
  }

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline; filename="auto-cal.ics"');
  res.send(cal.toString());
}
