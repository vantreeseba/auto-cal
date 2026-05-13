import type {
  ActivityType,
  Habit,
  HabitCompletion,
  TimeBlock,
  Todo,
  TodoList,
  User,
} from '@auto-cal/db';
import { db } from '@auto-cal/db';
import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { icalHandler } from './ical-route.ts';

vi.mock('@auto-cal/db', () => ({
  db: {
    query: {
      users: { findFirst: vi.fn() },
      timeBlocks: { findMany: vi.fn() },
      todos: { findMany: vi.fn() },
      todoLists: { findMany: vi.fn() },
      habits: { findMany: vi.fn() },
      activityTypes: { findMany: vi.fn() },
      habitCompletions: { findMany: vi.fn() },
    },
  },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const VALID_SECRET = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

function makeReq(query: Record<string, unknown> = {}): Request {
  return { query } as unknown as Request;
}

function makeRes() {
  const res = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: '',
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    send(body: string) {
      res.body = body;
      return res;
    },
    setHeader(name: string, value: string) {
      res.headers[name] = value;
    },
  };
  return res as typeof res & Response;
}

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'test@example.com',
    timezone: 'UTC',
    icalSecret: VALID_SECRET,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeTimeBlock(overrides: Partial<TimeBlock> = {}): TimeBlock {
  return {
    id: 'tb-1',
    userId: 'user-1',
    activityTypeId: 'at-work',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    startTime: '09:00',
    endTime: '17:00',
    priority: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeActivityType(overrides: Partial<ActivityType> = {}): ActivityType {
  return {
    id: 'at-work',
    userId: 'user-1',
    name: 'Work',
    color: '#6366f1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeTodoList(overrides: Partial<TodoList> = {}): TodoList {
  return {
    id: 'list-1',
    userId: 'user-1',
    name: 'Work Tasks',
    description: null,
    activityTypeId: 'at-work',
    defaultPriority: 0,
    defaultEstimatedLength: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 'todo-1',
    userId: 'user-1',
    listId: 'list-1',
    title: 'Write tests',
    description: null,
    priority: 1,
    estimatedLength: 60,
    dueAt: null,
    scheduledAt: null,
    completedAt: null,
    manuallyScheduled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-1',
    userId: 'user-1',
    title: 'Morning run',
    description: null,
    activityTypeId: 'at-work',
    frequencyCount: 3,
    frequencyUnit: 'week',
    estimatedLength: 30,
    priority: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeCompletion(habitId = 'habit-1'): HabitCompletion {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    habitId,
    scheduledAt: null,
    completedAt: now,
    createdAt: now,
  };
}

function setupEmptyDb(user: User = makeUser()) {
  vi.mocked(db.query.users.findFirst).mockResolvedValue(user);
  vi.mocked(db.query.timeBlocks.findMany).mockResolvedValue([]);
  vi.mocked(db.query.todos.findMany).mockResolvedValue([]);
  vi.mocked(db.query.todoLists.findMany).mockResolvedValue([]);
  vi.mocked(db.query.habits.findMany).mockResolvedValue([]);
  vi.mocked(db.query.activityTypes.findMany).mockResolvedValue([]);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('icalHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('secret validation', () => {
    it('returns 400 when secret is missing', async () => {
      const res = makeRes();
      await icalHandler(makeReq(), res);
      expect(res.statusCode).toBe(400);
      expect(res.body).toBe('Invalid secret');
    });

    it('returns 400 when secret is an array', async () => {
      const res = makeRes();
      await icalHandler(makeReq({ secret: ['a', 'b'] }), res);
      expect(res.statusCode).toBe(400);
      expect(res.body).toBe('Invalid secret');
    });

    it('returns 400 when secret is too short', async () => {
      const res = makeRes();
      await icalHandler(makeReq({ secret: 'too-short' }), res);
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 when secret contains invalid characters', async () => {
      const res = makeRes();
      await icalHandler(makeReq({ secret: 'g1b2c3d4-e5f6-7890-abcd-ef1234567890' }), res);
      expect(res.statusCode).toBe(400);
    });

    it('does not query the database on invalid secret', async () => {
      await icalHandler(makeReq({ secret: 'bad' }), makeRes());
      expect(db.query.users.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('user lookup', () => {
    it('returns 404 when user is not found', async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue(undefined);
      const res = makeRes();
      await icalHandler(makeReq({ secret: VALID_SECRET }), res);
      expect(res.statusCode).toBe(404);
      expect(res.body).toBe('User not found');
    });

    it('queries by the provided secret', async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue(undefined);
      await icalHandler(makeReq({ secret: VALID_SECRET }), makeRes());
      expect(db.query.users.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { icalSecret: VALID_SECRET } }),
      );
    });
  });

  describe('calendar generation', () => {
    it('returns correct Content-Type and Content-Disposition headers', async () => {
      setupEmptyDb();
      const res = makeRes();
      await icalHandler(makeReq({ secret: VALID_SECRET }), res);
      expect(res.headers['Content-Type']).toBe('text/calendar; charset=utf-8');
      expect(res.headers['Content-Disposition']).toBe('inline; filename="auto-cal.ics"');
    });

    it('returns a valid iCal envelope', async () => {
      setupEmptyDb();
      const res = makeRes();
      await icalHandler(makeReq({ secret: VALID_SECRET }), res);
      expect(res.body).toContain('BEGIN:VCALENDAR');
      expect(res.body).toContain('END:VCALENDAR');
    });

    it('produces no events when user has no todos or habits', async () => {
      setupEmptyDb();
      const res = makeRes();
      await icalHandler(makeReq({ secret: VALID_SECRET }), res);
      expect(res.body).not.toContain('BEGIN:VEVENT');
    });

    it('skips habitCompletions queries when user has no habits', async () => {
      setupEmptyDb();
      await icalHandler(makeReq({ secret: VALID_SECRET }), makeRes());
      expect(db.query.habitCompletions.findMany).not.toHaveBeenCalled();
    });

    it('generates events for todos that fit in a time block', async () => {
      const user = makeUser();
      vi.mocked(db.query.users.findFirst).mockResolvedValue(user);
      vi.mocked(db.query.timeBlocks.findMany).mockResolvedValue([makeTimeBlock()]);
      vi.mocked(db.query.todos.findMany).mockResolvedValue([makeTodo()]);
      vi.mocked(db.query.todoLists.findMany).mockResolvedValue([makeTodoList()]);
      vi.mocked(db.query.habits.findMany).mockResolvedValue([]);
      vi.mocked(db.query.activityTypes.findMany).mockResolvedValue([makeActivityType()]);

      const res = makeRes();
      await icalHandler(makeReq({ secret: VALID_SECRET }), res);
      expect(res.body).toContain('BEGIN:VEVENT');
      expect(res.body).toContain('Write tests');
    });

    it('maps todo activity type through its list', async () => {
      const user = makeUser();
      const todoList = makeTodoList({ activityTypeId: 'at-work' });
      const todo = makeTodo({ listId: 'list-1' });
      vi.mocked(db.query.users.findFirst).mockResolvedValue(user);
      vi.mocked(db.query.timeBlocks.findMany).mockResolvedValue([makeTimeBlock()]);
      vi.mocked(db.query.todos.findMany).mockResolvedValue([todo]);
      vi.mocked(db.query.todoLists.findMany).mockResolvedValue([todoList]);
      vi.mocked(db.query.habits.findMany).mockResolvedValue([]);
      vi.mocked(db.query.activityTypes.findMany).mockResolvedValue([makeActivityType()]);

      const res = makeRes();
      await icalHandler(makeReq({ secret: VALID_SECRET }), res);
      expect(res.body).toContain('BEGIN:VEVENT');
    });

    it('generates events for habits with a remaining deficit', async () => {
      const habit = makeHabit({ frequencyCount: 3, frequencyUnit: 'week' });
      vi.mocked(db.query.users.findFirst).mockResolvedValue(makeUser());
      vi.mocked(db.query.timeBlocks.findMany).mockResolvedValue([makeTimeBlock()]);
      vi.mocked(db.query.todos.findMany).mockResolvedValue([]);
      vi.mocked(db.query.todoLists.findMany).mockResolvedValue([]);
      vi.mocked(db.query.habits.findMany).mockResolvedValue([habit]);
      vi.mocked(db.query.activityTypes.findMany).mockResolvedValue([makeActivityType()]);
      vi.mocked(db.query.habitCompletions.findMany).mockResolvedValue([]);

      const res = makeRes();
      await icalHandler(makeReq({ secret: VALID_SECRET }), res);
      expect(res.body).toContain('BEGIN:VEVENT');
      expect(res.body).toContain('Morning run');
    });

    it('suppresses habit events when deficit is zero', async () => {
      const habit = makeHabit({ frequencyCount: 2, frequencyUnit: 'week' });
      const completions = [makeCompletion(), makeCompletion()];
      vi.mocked(db.query.users.findFirst).mockResolvedValue(makeUser());
      vi.mocked(db.query.timeBlocks.findMany).mockResolvedValue([makeTimeBlock()]);
      vi.mocked(db.query.todos.findMany).mockResolvedValue([]);
      vi.mocked(db.query.todoLists.findMany).mockResolvedValue([]);
      vi.mocked(db.query.habits.findMany).mockResolvedValue([habit]);
      vi.mocked(db.query.activityTypes.findMany).mockResolvedValue([makeActivityType()]);
      vi.mocked(db.query.habitCompletions.findMany).mockResolvedValue(completions);

      const res = makeRes();
      await icalHandler(makeReq({ secret: VALID_SECRET }), res);
      expect(res.body).not.toContain('BEGIN:VEVENT');
    });

    it('queries habit completions for both week and month windows', async () => {
      const habit = makeHabit();
      vi.mocked(db.query.users.findFirst).mockResolvedValue(makeUser());
      vi.mocked(db.query.timeBlocks.findMany).mockResolvedValue([makeTimeBlock()]);
      vi.mocked(db.query.todos.findMany).mockResolvedValue([]);
      vi.mocked(db.query.todoLists.findMany).mockResolvedValue([]);
      vi.mocked(db.query.habits.findMany).mockResolvedValue([habit]);
      vi.mocked(db.query.activityTypes.findMany).mockResolvedValue([makeActivityType()]);
      vi.mocked(db.query.habitCompletions.findMany).mockResolvedValue([]);

      await icalHandler(makeReq({ secret: VALID_SECRET }), makeRes());
      // Called twice per week loop iteration (week + month window), across 2 weeks = 4 total
      expect(db.query.habitCompletions.findMany).toHaveBeenCalledTimes(4);
    });

    it('accepts a non-UTC user timezone without error', async () => {
      setupEmptyDb(makeUser({ timezone: 'America/New_York' }));
      const res = makeRes();
      await icalHandler(makeReq({ secret: VALID_SECRET }), res);
      expect(res.body).toContain('BEGIN:VCALENDAR');
    });

    it('uses monthCounts for habits with monthly frequency', async () => {
      const habit = makeHabit({ frequencyCount: 2, frequencyUnit: 'month' });
      vi.mocked(db.query.users.findFirst).mockResolvedValue(makeUser());
      vi.mocked(db.query.timeBlocks.findMany).mockResolvedValue([makeTimeBlock()]);
      vi.mocked(db.query.todos.findMany).mockResolvedValue([]);
      vi.mocked(db.query.todoLists.findMany).mockResolvedValue([]);
      vi.mocked(db.query.habits.findMany).mockResolvedValue([habit]);
      vi.mocked(db.query.activityTypes.findMany).mockResolvedValue([makeActivityType()]);
      // 0 completions this month → 2 deficit → events generated
      vi.mocked(db.query.habitCompletions.findMany).mockResolvedValue([]);

      const res = makeRes();
      await icalHandler(makeReq({ secret: VALID_SECRET }), res);
      expect(res.body).toContain('BEGIN:VEVENT');
      expect(res.body).toContain('Morning run');
    });

    it('omits the Activity line from event description when activityType is unknown', async () => {
      // Pass an empty activityTypes list so the scheduler cannot resolve the type
      const todoList = makeTodoList({ activityTypeId: 'at-work' });
      vi.mocked(db.query.users.findFirst).mockResolvedValue(makeUser());
      vi.mocked(db.query.timeBlocks.findMany).mockResolvedValue([makeTimeBlock()]);
      vi.mocked(db.query.todos.findMany).mockResolvedValue([makeTodo()]);
      vi.mocked(db.query.todoLists.findMany).mockResolvedValue([todoList]);
      vi.mocked(db.query.habits.findMany).mockResolvedValue([]);
      vi.mocked(db.query.activityTypes.findMany).mockResolvedValue([]);

      const res = makeRes();
      await icalHandler(makeReq({ secret: VALID_SECRET }), res);
      expect(res.body).toContain('BEGIN:VEVENT');
      expect(res.body).not.toContain('Activity:');
    });

    it('produces no events when todos have no matching time block', async () => {
      // Todo is Work activity type but time block is for a different type
      const mismatchedBlock = makeTimeBlock({ activityTypeId: 'at-exercise' });
      const exerciseType = makeActivityType({ id: 'at-exercise', name: 'Exercise' });
      vi.mocked(db.query.users.findFirst).mockResolvedValue(makeUser());
      vi.mocked(db.query.timeBlocks.findMany).mockResolvedValue([mismatchedBlock]);
      vi.mocked(db.query.todos.findMany).mockResolvedValue([makeTodo()]);
      vi.mocked(db.query.todoLists.findMany).mockResolvedValue([makeTodoList()]);
      vi.mocked(db.query.habits.findMany).mockResolvedValue([]);
      vi.mocked(db.query.activityTypes.findMany).mockResolvedValue([makeActivityType(), exerciseType]);

      const res = makeRes();
      await icalHandler(makeReq({ secret: VALID_SECRET }), res);
      expect(res.body).not.toContain('BEGIN:VEVENT');
    });
  });
});
