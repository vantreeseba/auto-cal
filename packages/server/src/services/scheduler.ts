import type { ActivityType, Habit, TimeBlock, Todo } from '@auto-cal/db';

// ─── Output Types ────────────────────────────────────────────────────────────

export type ScheduledItemKind = 'todo' | 'habit';

export type ScheduledItem = {
  kind: ScheduledItemKind;
  id: string;
  title: string;
  priority: number;
  estimatedLength: number;
  activityTypeId: string | null;
  activityType: ActivityType | null;
  scheduledStart: string | null; // naive ISO "YYYY-MM-DDTHH:mm:ss" — no Z
  scheduledEnd: string | null; // naive ISO "YYYY-MM-DDTHH:mm:ss" — no Z
  isScheduled: boolean;
  isOverdue: boolean;
};

// ─── Internal Types ──────────────────────────────────────────────────────────

type Slot = {
  activityTypeId: string;
  /** Naive ISO date string for the slot day: "YYYY-MM-DD" */
  dateStr: string;
  /** Minutes since midnight for slot start */
  startMinutes: number;
  /** Total capacity of the slot in minutes */
  totalMinutes: number;
  /** Minutes consumed so far */
  usedMinutes: number;
  /** Time block priority — higher is preferred */
  priority: number;
};

type Task = {
  kind: ScheduledItemKind;
  id: string;
  title: string;
  priority: number;
  estimatedLength: number;
  activityTypeId: string | null;
  isOverdue?: boolean;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse "HH:MM" into total minutes since midnight */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Format minutes-since-midnight as "HH:MM:SS" */
function minutesToTimeStr(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

/** Build a naive ISO datetime string: "YYYY-MM-DDTHH:MM:SS" */
function naiveDateTime(dateStr: string, minutes: number): string {
  return `${dateStr}T${minutesToTimeStr(minutes)}`;
}

/**
 * Return the ISO week start (Monday) as a "YYYY-MM-DD" string.
 * Uses local date arithmetic — weekStart is treated as a local date.
 */
export function startOfISOWeekStr(ref: Date): string {
  const d = new Date(ref);
  const day = d.getDay(); // 0=Sun, 1=Mon … 6=Sat (local)
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Add `days` to a "YYYY-MM-DD" string and return a new "YYYY-MM-DD" string */
function addDaysToDateStr(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`); // parse as local midnight
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Return the Monday of the ISO week containing `ref` as a Date at local midnight.
 * Used by the resolver for DB date range queries.
 */
export function startOfISOWeek(ref: Date): Date {
  const dateStr = startOfISOWeekStr(ref);
  return new Date(`${dateStr}T00:00:00`);
}

/**
 * Return the first day of the calendar month containing `ref` as a Date at local midnight.
 */
export function startOfLocalMonth(ref: Date): Date {
  const y = ref.getFullYear();
  const m = String(ref.getMonth() + 1).padStart(2, '0');
  return new Date(`${y}-${m}-01T00:00:00`);
}

/**
 * Expand a recurring TimeBlock into concrete Slot objects for the week
 * starting on `weekStartStr` (a "YYYY-MM-DD" string for a Monday).
 * daysOfWeek: 0=Sun, 1=Mon … 6=Sat.
 */
function expandSlots(weekStartStr: string, block: TimeBlock): Slot[] {
  if (!block.activityTypeId) return [];

  const startMins = timeToMinutes(block.startTime);
  const endMins = timeToMinutes(block.endTime);
  const totalMinutes = endMins - startMins;
  if (totalMinutes <= 0) return [];

  return block.daysOfWeek.map((dayIndex) => {
    // weekStartStr is Monday. dayIndex 0=Sun needs +6, 1=Mon needs +0, etc.
    const offsetFromMonday = dayIndex === 0 ? 6 : dayIndex - 1;
    const dateStr = addDaysToDateStr(weekStartStr, offsetFromMonday);
    return {
      activityTypeId: block.activityTypeId as string,
      dateStr,
      startMinutes: startMins,
      totalMinutes,
      usedMinutes: 0,
      priority: block.priority ?? 0,
    };
  });
}

/** Sort tasks: priority DESC, then estimatedLength ASC */
function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.estimatedLength - b.estimatedLength;
  });
}

/**
 * Returns the effective start (minutes since midnight) for the next item
 * placed into this slot, advancing past `now` if the cursor is in the past.
 * Returns null if there is no future capacity left in the slot.
 */
function effectiveSlotStart(
  slot: Slot,
  now: Date,
  durationMins: number,
): number | null {
  const slotEndMins = slot.startMinutes + slot.totalMinutes;
  const cursorMins = slot.startMinutes + slot.usedMinutes;

  // Convert now to minutes since midnight on the slot's date
  const slotDayMidnight = new Date(`${slot.dateStr}T00:00:00`);
  const nowMins = (now.getTime() - slotDayMidnight.getTime()) / (1000 * 60);

  const startMins = Math.max(cursorMins, nowMins);
  if (startMins + durationMins > slotEndMins) return null;
  return startMins;
}

// ─── Main Export ─────────────────────────────────────────────────────────────

/**
 * Pure scheduling function — no DB calls, no side effects.
 * Produces naive datetime strings (no timezone suffix) so browsers
 * interpret them as local time.
 *
 * @param weekStartStr    "YYYY-MM-DD" string for the Monday of the target week
 * @param timeBlocks      All user time blocks
 * @param todos           Incomplete todos with activityTypeId set
 * @param habits          Due habits with activityTypeId set
 * @param activityTypeMap Map<activityTypeId, ActivityType> for O(1) lookup
 */
export function computeSchedule(
  weekStartStr: string,
  timeBlocks: TimeBlock[],
  todos: Todo[],
  habits: Array<Habit & { instanceIndex: number }>,
  activityTypeMap: Map<string, ActivityType>,
): ScheduledItem[] {
  // 1. Expand all time blocks into slots for this week
  const allSlots = timeBlocks.flatMap((b) => expandSlots(weekStartStr, b));

  // 2. Group slots by activityTypeId, sorted by (dateStr, startMinutes)
  const slotsByActivityType = new Map<string, Slot[]>();
  for (const slot of allSlots) {
    const existing = slotsByActivityType.get(slot.activityTypeId) ?? [];
    existing.push(slot);
    slotsByActivityType.set(slot.activityTypeId, existing);
  }
  for (const slots of slotsByActivityType.values()) {
    // Higher priority first; ties broken by date then start time
    slots.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      const dateCmp = a.dateStr.localeCompare(b.dateStr);
      return dateCmp !== 0 ? dateCmp : a.startMinutes - b.startMinutes;
    });
  }

  // 3. Build and sort the task list
  const now = new Date();

  const todoTasks: Task[] = todos
    .filter((t) => t.activityTypeId !== null)
    .map((t) => ({
      kind: 'todo' as const,
      id: t.id,
      title: t.title,
      priority: t.priority,
      estimatedLength: t.estimatedLength,
      activityTypeId: t.activityTypeId,
      isOverdue: !!(
        t.scheduledAt &&
        new Date(t.scheduledAt) < now &&
        !t.completedAt
      ),
    }));

  const habitTasks: Task[] = habits
    .filter((h) => h.activityTypeId !== null)
    .map((h) => ({
      kind: 'habit' as const,
      id: `${h.id}-${h.instanceIndex}`,
      title:
        h.instanceIndex > 0 ? `${h.title} (${h.instanceIndex + 1})` : h.title,
      priority: h.priority,
      estimatedLength: h.estimatedLength,
      activityTypeId: h.activityTypeId,
    }));

  const sortedTasks = sortTasks([...todoTasks, ...habitTasks]);

  // 4. Schedule each task into the first fitting slot
  // For habits, prefer spreading instances across different days
  const habitDatesUsed = new Map<string, Set<string>>(); // habitBaseId → Set<dateStr>

  const results: ScheduledItem[] = [];

  for (const task of sortedTasks) {
    const activityType = task.activityTypeId
      ? (activityTypeMap.get(task.activityTypeId) ?? null)
      : null;

    if (!task.activityTypeId) {
      results.push({
        ...task,
        activityType,
        scheduledStart: null,
        scheduledEnd: null,
        isScheduled: false,
        isOverdue: task.isOverdue ?? false,
      });
      continue;
    }

    if (task.estimatedLength <= 0) {
      results.push({
        ...task,
        activityType,
        scheduledStart: null,
        scheduledEnd: null,
        isScheduled: false,
        isOverdue: task.isOverdue ?? false,
      });
      continue;
    }

    const slots = slotsByActivityType.get(task.activityTypeId);
    if (!slots || slots.length === 0) {
      results.push({
        ...task,
        activityType,
        scheduledStart: null,
        scheduledEnd: null,
        isScheduled: false,
        isOverdue: task.isOverdue ?? false,
      });
      continue;
    }

    // Determine if this is a habit instance and extract the base ID
    const isHabit = task.kind === 'habit';
    // Habit instance IDs are "baseId-N" — base ID is everything before the last dash-number
    const habitBaseId = isHabit ? task.id.replace(/-\d+$/, '') : null;

    // For habit instances, get the set of dates already used by this habit
    const usedDates = habitBaseId
      ? (habitDatesUsed.get(habitBaseId) ?? new Set<string>())
      : null;

    // First pass: prefer a slot on a date this habit hasn't been placed yet
    let chosenSlot: Slot | null = null;
    let chosenStart: number | null = null;
    if (isHabit && usedDates) {
      for (const slot of slots) {
        const start = effectiveSlotStart(slot, now, task.estimatedLength);
        if (start !== null && !usedDates.has(slot.dateStr)) {
          chosenSlot = slot;
          chosenStart = start;
          break;
        }
      }
    }

    // Fallback: any slot with future capacity sufficient for this task
    if (!chosenSlot) {
      for (const slot of slots) {
        const start = effectiveSlotStart(slot, now, task.estimatedLength);
        if (start !== null) {
          chosenSlot = slot;
          chosenStart = start;
          break;
        }
      }
    }

    if (!chosenSlot || chosenStart === null) {
      results.push({
        ...task,
        activityType,
        scheduledStart: null,
        scheduledEnd: null,
        isScheduled: false,
        isOverdue: task.isOverdue ?? false,
      });
      continue;
    }

    const taskStartMins = chosenStart;
    const taskEndMins = taskStartMins + task.estimatedLength;
    // Advance usedMinutes to after this task (accounting for any gap skipped past now)
    chosenSlot.usedMinutes = taskEndMins - chosenSlot.startMinutes;

    // Record the date used for this habit base ID
    if (habitBaseId && usedDates) {
      usedDates.add(chosenSlot.dateStr);
      habitDatesUsed.set(habitBaseId, usedDates);
    }

    results.push({
      ...task,
      activityType,
      scheduledStart: naiveDateTime(chosenSlot.dateStr, taskStartMins),
      scheduledEnd: naiveDateTime(chosenSlot.dateStr, taskEndMins),
      isScheduled: true,
      isOverdue: task.isOverdue ?? false,
    });
  }

  return results;
}
