import type { ActivityType, Habit, TimeBlock, Todo } from '@auto-cal/db';

export interface ScheduledItem {
  id: string;
  type: 'todo' | 'habit';
  title: string;
  activityTypeId: string | null;
  estimatedLength: number;
  isScheduled: boolean;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  dayOfWeek: number | null;
}

/**
 * Returns the ISO week start (Monday) date string for the given date string.
 * E.g. '2026-04-29' (Wednesday) → '2026-04-27' (Monday)
 */
export function startOfISOWeekStr(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function minutesToTimeStr(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Compute a schedule for one week starting at weekStartStr (ISO date, must be Monday).
 *
 * Algorithm:
 * 1. Build a map of free time per (day, timeBlock).
 * 2. Sort todos by priority descending, then createdAt ascending.
 * 3. For each todo, try to find the earliest slot that fits.
 * 4. For habits, spread instances across different days.
 */
export function computeSchedule(
  weekStartStr: string,
  timeBlocks: TimeBlock[],
  todos: Todo[],
  habits: Habit[],
  activityTypeMap: Map<string, ActivityType>,
): ScheduledItem[] {
  const now = new Date();
  const weekStart = new Date(`${weekStartStr}T00:00:00`);

  // Build slot availability: Map<blockId+day, { dayDate, startMin, remainingMin }>
  type SlotKey = `${string}-${number}`;
  const slots = new Map<
    SlotKey,
    {
      blockId: string;
      dayOfWeek: number;
      dateStr: string;
      startMin: number;
      cursorMin: number;
      endMin: number;
    }
  >();

  for (const block of timeBlocks) {
    for (const dow of block.daysOfWeek) {
      const dayDate = new Date(weekStart);
      // ISO weeks: weekStart is Monday (dow=1). getDay() 0=Sun,1=Mon,...
      // dow: 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
      // Monday offset = 0, Tuesday = 1, ... Sunday = 6
      const offset = dow === 0 ? 6 : dow - 1;
      dayDate.setDate(weekStart.getDate() + offset);
      const dateStr = dayDate.toISOString().slice(0, 10);
      const key: SlotKey = `${block.id}-${dow}`;
      slots.set(key, {
        blockId: block.id,
        dayOfWeek: dow,
        dateStr,
        startMin: timeToMinutes(block.startTime),
        cursorMin: timeToMinutes(block.startTime),
        endMin: timeToMinutes(block.endTime),
      });
    }
  }

  const result: ScheduledItem[] = [];

  // Helper: find a slot for an item with given activityTypeId and duration
  function findSlot(
    activityTypeId: string | null,
    durationMin: number,
    preferNotDays?: Set<number>,
  ): {
    dateStr: string;
    startMin: number;
    endMin: number;
    dayOfWeek: number;
  } | null {
    // Find matching blocks
    const matchingBlocks = timeBlocks.filter((b) => {
      if (!activityTypeId) return true;
      return b.activityTypeId === activityTypeId;
    });

    // Sort slots: prefer days not in preferNotDays, then by date
    const candidateKeys = Array.from(slots.keys()).filter((k) => {
      const slot = slots.get(k);
      if (!slot) return false;
      return matchingBlocks.some((b) => b.id === slot.blockId);
    });

    // Prefer days not already used by this habit
    candidateKeys.sort((a, b) => {
      const slotA = slots.get(a);
      const slotB = slots.get(b);
      if (!slotA || !slotB) return 0;
      const aPref = preferNotDays?.has(slotA.dayOfWeek) ? 1 : 0;
      const bPref = preferNotDays?.has(slotB.dayOfWeek) ? 1 : 0;
      if (aPref !== bPref) return aPref - bPref;
      // Then sort by date
      if (slotA.dateStr !== slotB.dateStr)
        return slotA.dateStr < slotB.dateStr ? -1 : 1;
      return slotA.cursorMin - slotB.cursorMin;
    });

    for (const key of candidateKeys) {
      const slot = slots.get(key);
      if (!slot) continue;
      const available = slot.endMin - slot.cursorMin;
      if (available >= durationMin) {
        return {
          dateStr: slot.dateStr,
          startMin: slot.cursorMin,
          endMin: slot.cursorMin + durationMin,
          dayOfWeek: slot.dayOfWeek,
        };
      }
    }
    return null;
  }

  function consumeSlot(
    activityTypeId: string | null,
    dateStr: string,
    startMin: number,
    durationMin: number,
  ): void {
    for (const [key, slot] of slots.entries()) {
      if (slot.dateStr === dateStr && slot.cursorMin === startMin) {
        const matchingBlocks = timeBlocks.filter((b) => {
          if (!activityTypeId) return true;
          return b.activityTypeId === activityTypeId;
        });
        if (matchingBlocks.some((b) => b.id === slot.blockId)) {
          slot.cursorMin += durationMin;
          slots.set(key, slot);
          return;
        }
      }
    }
  }

  // Process todos sorted by priority desc, then createdAt asc
  const sortedTodos = [...todos]
    .filter((t) => t.completedAt === null)
    .sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

  for (const todo of sortedTodos) {
    const duration = todo.estimatedLength ?? 0;
    if (duration <= 0) {
      result.push({
        id: todo.id,
        type: 'todo',
        title: todo.title,
        activityTypeId: todo.activityTypeId ?? null,
        estimatedLength: duration,
        isScheduled: false,
        scheduledStart: null,
        scheduledEnd: null,
        dayOfWeek: null,
      });
      continue;
    }

    // Check if overdue: scheduledAt in the past
    if (todo.scheduledAt && new Date(todo.scheduledAt) < now) {
      // Only schedule into future slots (slots whose dateStr >= today)
      // We continue with normal scheduling but filter to future slots
    }

    // Check if activityTypeId is in the map (if specified)
    if (todo.activityTypeId && !activityTypeMap.has(todo.activityTypeId)) {
      result.push({
        id: todo.id,
        type: 'todo',
        title: todo.title,
        activityTypeId: todo.activityTypeId,
        estimatedLength: duration,
        isScheduled: false,
        scheduledStart: null,
        scheduledEnd: null,
        dayOfWeek: null,
      });
      continue;
    }

    const slot = findSlot(todo.activityTypeId ?? null, duration);
    if (!slot) {
      result.push({
        id: todo.id,
        type: 'todo',
        title: todo.title,
        activityTypeId: todo.activityTypeId ?? null,
        estimatedLength: duration,
        isScheduled: false,
        scheduledStart: null,
        scheduledEnd: null,
        dayOfWeek: null,
      });
      continue;
    }

    consumeSlot(
      todo.activityTypeId ?? null,
      slot.dateStr,
      slot.startMin,
      duration,
    );

    const startStr = `${slot.dateStr}T${minutesToTimeStr(slot.startMin)}:00`;
    const endStr = `${slot.dateStr}T${minutesToTimeStr(slot.endMin)}:00`;

    result.push({
      id: todo.id,
      type: 'todo',
      title: todo.title,
      activityTypeId: todo.activityTypeId ?? null,
      estimatedLength: duration,
      isScheduled: true,
      scheduledStart: startStr,
      scheduledEnd: endStr,
      dayOfWeek: slot.dayOfWeek,
    });
  }

  // Process habits: each habit needs frequencyCount instances per week
  for (const habit of habits) {
    const duration = habit.estimatedLength ?? 0;
    const instances = habit.frequencyCount;
    const usedDays = new Set<number>();

    for (let i = 0; i < instances; i++) {
      if (duration <= 0) {
        result.push({
          id: `${habit.id}-${i}`,
          type: 'habit',
          title: habit.title,
          activityTypeId: habit.activityTypeId ?? null,
          estimatedLength: duration,
          isScheduled: false,
          scheduledStart: null,
          scheduledEnd: null,
          dayOfWeek: null,
        });
        continue;
      }

      if (habit.activityTypeId && !activityTypeMap.has(habit.activityTypeId)) {
        result.push({
          id: `${habit.id}-${i}`,
          type: 'habit',
          title: habit.title,
          activityTypeId: habit.activityTypeId,
          estimatedLength: duration,
          isScheduled: false,
          scheduledStart: null,
          scheduledEnd: null,
          dayOfWeek: null,
        });
        continue;
      }

      const slot = findSlot(habit.activityTypeId ?? null, duration, usedDays);
      if (!slot) {
        result.push({
          id: `${habit.id}-${i}`,
          type: 'habit',
          title: habit.title,
          activityTypeId: habit.activityTypeId ?? null,
          estimatedLength: duration,
          isScheduled: false,
          scheduledStart: null,
          scheduledEnd: null,
          dayOfWeek: null,
        });
        continue;
      }

      usedDays.add(slot.dayOfWeek);
      consumeSlot(
        habit.activityTypeId ?? null,
        slot.dateStr,
        slot.startMin,
        duration,
      );

      const startStr = `${slot.dateStr}T${minutesToTimeStr(slot.startMin)}:00`;
      const endStr = `${slot.dateStr}T${minutesToTimeStr(slot.endMin)}:00`;

      result.push({
        id: `${habit.id}-${i}`,
        type: 'habit',
        title: habit.title,
        activityTypeId: habit.activityTypeId ?? null,
        estimatedLength: duration,
        isScheduled: true,
        scheduledStart: startStr,
        scheduledEnd: endStr,
        dayOfWeek: slot.dayOfWeek,
      });
    }
  }

  return result;
}
