import type { ActivityType, Habit, TimeBlock, Todo } from '@auto-cal/db';
import { describe, expect, it } from 'vitest';
import { computeSchedule, startOfISOWeekStr } from './scheduler.ts';

// Fixed reference week: 2026-04-27 is a Monday
const WEEK_START = '2026-04-27';

const WORK_TYPE_ID = '00000000-0000-0000-0000-000000000001';
const GYM_TYPE_ID = '00000000-0000-0000-0000-000000000002';

const baseActivityType: ActivityType = {
  id: WORK_TYPE_ID,
  name: 'Work',
  color: '#6366f1',
  userId: 'user-1',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const gymActivityType: ActivityType = {
  id: GYM_TYPE_ID,
  name: 'Gym',
  color: '#10b981',
  userId: 'user-1',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const activityTypeMap = new Map<string, ActivityType>([
  [WORK_TYPE_ID, baseActivityType],
  [GYM_TYPE_ID, gymActivityType],
]);

// Monday time block: 09:00–12:00 (180 min)
const mondayBlock: TimeBlock = {
  id: 'block-mon',
  userId: 'user-1',
  activityTypeId: WORK_TYPE_ID,
  daysOfWeek: [1], // Monday
  startTime: '09:00',
  endTime: '12:00',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

// Tuesday time block: 09:00–12:00 (180 min)
const tuesdayBlock: TimeBlock = {
  id: 'block-tue',
  userId: 'user-1',
  activityTypeId: WORK_TYPE_ID,
  daysOfWeek: [2], // Tuesday
  startTime: '09:00',
  endTime: '12:00',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

function makeTodo(overrides: Partial<Todo> & { id: string }): Todo {
  return {
    userId: 'user-1',
    title: 'Test Todo',
    description: null,
    priority: 50,
    estimatedLength: 60,
    activityTypeId: WORK_TYPE_ID,
    scheduledAt: null,
    completedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function makeHabit(overrides: Partial<Habit> & { id: string }): Habit {
  return {
    userId: 'user-1',
    title: 'Test Habit',
    description: null,
    priority: 50,
    estimatedLength: 30,
    activityTypeId: WORK_TYPE_ID,
    frequencyCount: 2,
    frequencyUnit: 'week',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('startOfISOWeekStr', () => {
  it('returns same Monday for a Monday input', () => {
    expect(startOfISOWeekStr('2026-04-27')).toBe('2026-04-27');
  });

  it('returns Monday for a Wednesday input', () => {
    expect(startOfISOWeekStr('2026-04-29')).toBe('2026-04-27');
  });

  it('returns Monday for a Sunday input', () => {
    expect(startOfISOWeekStr('2026-05-03')).toBe('2026-04-27');
  });

  it('returns Monday for a Friday input', () => {
    expect(startOfISOWeekStr('2026-05-01')).toBe('2026-04-27');
  });
});

describe('computeSchedule', () => {
  it('returns empty array when no todos and no habits', () => {
    const result = computeSchedule(
      WEEK_START,
      [mondayBlock],
      [],
      [],
      activityTypeMap,
    );
    expect(result).toHaveLength(0);
  });

  it('returns unscheduled items when no time blocks', () => {
    const todo = makeTodo({ id: 'todo-1' });
    const result = computeSchedule(WEEK_START, [], [todo], [], activityTypeMap);
    expect(result).toHaveLength(1);
    expect(result[0]?.isScheduled).toBe(false);
    expect(result[0]?.scheduledStart).toBeNull();
    expect(result[0]?.scheduledEnd).toBeNull();
  });

  it('schedules a todo into a matching time block', () => {
    const todo = makeTodo({ id: 'todo-1', estimatedLength: 60 });
    const result = computeSchedule(
      WEEK_START,
      [mondayBlock],
      [todo],
      [],
      activityTypeMap,
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.isScheduled).toBe(true);
    expect(result[0]?.scheduledStart).toBe('2026-04-27T09:00:00');
    expect(result[0]?.scheduledEnd).toBe('2026-04-27T10:00:00');
  });

  it('leaves todo unscheduled when estimated length exceeds slot capacity', () => {
    const todo = makeTodo({ id: 'todo-1', estimatedLength: 240 }); // 240 > 180 min slot
    const result = computeSchedule(
      WEEK_START,
      [mondayBlock],
      [todo],
      [],
      activityTypeMap,
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.isScheduled).toBe(false);
  });

  it('schedules higher-priority todo into the earlier slot', () => {
    // Each todo needs 180 min (fills an entire 3-hour block), so they can't share
    const lowPrioTodo = makeTodo({
      id: 'todo-low',
      priority: 10,
      estimatedLength: 180,
    });
    const highPrioTodo = makeTodo({
      id: 'todo-high',
      priority: 90,
      estimatedLength: 180,
    });

    // Two blocks: Monday and Tuesday (each 180 min)
    const result = computeSchedule(
      WEEK_START,
      [mondayBlock, tuesdayBlock],
      [lowPrioTodo, highPrioTodo],
      [],
      activityTypeMap,
    );

    const high = result.find((r) => r.id === 'todo-high');
    const low = result.find((r) => r.id === 'todo-low');

    expect(high?.isScheduled).toBe(true);
    expect(low?.isScheduled).toBe(true);
    // Higher priority gets the earlier slot (Monday)
    expect(high?.scheduledStart).toBe('2026-04-27T09:00:00');
    // Lower priority gets Tuesday slot
    expect(low?.scheduledStart).toBe('2026-04-28T09:00:00');
  });

  it('packs multiple todos consecutively into the same block', () => {
    const todo1 = makeTodo({
      id: 'todo-1',
      priority: 100,
      estimatedLength: 60,
    });
    const todo2 = makeTodo({ id: 'todo-2', priority: 50, estimatedLength: 60 });
    const result = computeSchedule(
      WEEK_START,
      [mondayBlock],
      [todo1, todo2],
      [],
      activityTypeMap,
    );

    const t1 = result.find((r) => r.id === 'todo-1');
    const t2 = result.find((r) => r.id === 'todo-2');

    expect(t1?.isScheduled).toBe(true);
    expect(t2?.isScheduled).toBe(true);
    expect(t1?.scheduledStart).toBe('2026-04-27T09:00:00');
    expect(t1?.scheduledEnd).toBe('2026-04-27T10:00:00');
    expect(t2?.scheduledStart).toBe('2026-04-27T10:00:00');
    expect(t2?.scheduledEnd).toBe('2026-04-27T11:00:00');
  });

  it('leaves todo unscheduled when activityTypeId is not in time blocks', () => {
    const unknownTypeId = '99999999-9999-9999-9999-999999999999';
    const unknownType: ActivityType = {
      id: unknownTypeId,
      name: 'Unknown',
      color: '#ffffff',
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mapWithUnknown = new Map<string, ActivityType>([
      [WORK_TYPE_ID, baseActivityType],
      [unknownTypeId, unknownType],
    ]);
    // mondayBlock only covers WORK_TYPE_ID, not unknownTypeId
    const todo = makeTodo({
      id: 'todo-1',
      activityTypeId: unknownTypeId,
      estimatedLength: 30,
    });
    const result = computeSchedule(
      WEEK_START,
      [mondayBlock],
      [todo],
      [],
      mapWithUnknown,
    );
    expect(result[0]?.isScheduled).toBe(false);
  });

  it('leaves todo unscheduled when activityTypeId is not in activityTypeMap', () => {
    const missingTypeId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const todo = makeTodo({
      id: 'todo-1',
      activityTypeId: missingTypeId,
      estimatedLength: 30,
    });
    const result = computeSchedule(
      WEEK_START,
      [mondayBlock],
      [todo],
      [],
      activityTypeMap,
    );
    expect(result[0]?.isScheduled).toBe(false);
  });

  it('spreads two habit instances across different days', () => {
    // Habit with frequencyCount=2, one block per day on Mon & Tue
    const habit = makeHabit({
      id: 'habit-1',
      estimatedLength: 30,
      frequencyCount: 2,
    });
    const result = computeSchedule(
      WEEK_START,
      [mondayBlock, tuesdayBlock],
      [],
      [habit],
      activityTypeMap,
    );

    expect(result).toHaveLength(2);
    const days = result.map((r) => r.dayOfWeek);
    // The two instances should be on different days
    expect(new Set(days).size).toBe(2);
    expect(result.every((r) => r.isScheduled)).toBe(true);
  });

  it('marks habit instance unscheduled when no matching block remains', () => {
    // Each block only fits one 90-min habit instance (90 min block).
    // Habit needs 3 instances but only 2 small blocks → third is unscheduled.
    const smallMondayBlock: TimeBlock = {
      ...mondayBlock,
      id: 'block-small-mon',
      startTime: '09:00',
      endTime: '10:30', // 90 min
    };
    const smallTuesdayBlock: TimeBlock = {
      ...tuesdayBlock,
      id: 'block-small-tue',
      startTime: '09:00',
      endTime: '10:30', // 90 min
    };
    const habit = makeHabit({
      id: 'habit-1',
      estimatedLength: 90,
      frequencyCount: 3,
    });
    const result = computeSchedule(
      WEEK_START,
      [smallMondayBlock, smallTuesdayBlock],
      [],
      [habit],
      activityTypeMap,
    );

    expect(result).toHaveLength(3);
    const scheduled = result.filter((r) => r.isScheduled);
    const unscheduled = result.filter((r) => !r.isScheduled);
    expect(scheduled).toHaveLength(2);
    expect(unscheduled).toHaveLength(1);
  });

  it('skips completed todos', () => {
    const completed = makeTodo({
      id: 'todo-1',
      estimatedLength: 30,
      completedAt: new Date('2026-04-20'),
    });
    const result = computeSchedule(
      WEEK_START,
      [mondayBlock],
      [completed],
      [],
      activityTypeMap,
    );
    // Completed todos are filtered out — no items in result
    expect(result).toHaveLength(0);
  });

  it('includes overdue todo (past scheduledAt) in normal scheduling', () => {
    const overdue = makeTodo({
      id: 'todo-overdue',
      estimatedLength: 60,
      scheduledAt: new Date('2020-01-01'), // far in the past
    });
    const result = computeSchedule(
      WEEK_START,
      [mondayBlock],
      [overdue],
      [],
      activityTypeMap,
    );
    expect(result).toHaveLength(1);
    // Should still be scheduled into available slot
    expect(result[0]?.isScheduled).toBe(true);
  });
});
