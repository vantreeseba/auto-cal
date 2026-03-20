import type {
  ScheduledItem_CalendarViewFragment,
  TimeBlock_CalendarViewFragment,
} from '@/__generated__/graphql.js';
import { graphql } from '@/__generated__/index.js';
import {
  addDays,
  format,
  getDay,
  parse,
  setHours,
  setMinutes,
  startOfDay,
  startOfWeek,
} from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

// ─── GraphQL ────────────────────────────────────────────────────────────────

graphql(`
  fragment TimeBlock_CalendarView on TimeBlock {
    id
    activityType {
      id
      name
      color
    }
  }

  fragment ScheduledItem_CalendarView on ScheduledItem {
    kind
    id
    title
    isScheduled
    isOverdue
    scheduledStart
    scheduledEnd
    completedAt
    activityType {
      id
      name
      color
    }
  }
`);

// ─── Types ──────────────────────────────────────────────────────────────────

interface ActivityType {
  id: string;
  name: string;
  color: string;
}

interface TimeBlock {
  id: string;
  activityType: ActivityType | null;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
}

interface ScheduleItem {
  kind: string;
  id: string;
  title: string;
  isScheduled: boolean;
  isOverdue: boolean;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  completedAt: string | null;
  activityType: ActivityType | null;
}

type CalendarData = {
  myTimeBlocks: TimeBlock[];
  mySchedule: ScheduleItem[];
};

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  isTask?: boolean;
  isPast?: boolean;
  isCompleted?: boolean;
  resource?: TimeBlock;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse "HH:MM" into { hours, minutes } */
function parseTime(time: string): { hours: number; minutes: number } {
  const [h, m] = time.split(':').map(Number);
  return { hours: h ?? 0, minutes: m ?? 0 };
}

/** Darken a hex color by reducing each channel by ~20% */
function darkenColor(hex: string): string {
  if (!hex.startsWith('#')) return hex;
  const n = Number.parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (n >> 16) - 40);
  const g = Math.max(0, ((n >> 8) & 0xff) - 40);
  const b = Math.max(0, (n & 0xff) - 40);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Desaturate a hex color by converting to greyscale-blended version.
 * amount 0 = fully desaturated (grey), 1 = original color.
 */
function desaturateColor(hex: string, amount = 0.2): string {
  if (!hex.startsWith('#')) return hex;
  const n = Number.parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  // Luminance-weighted greyscale
  const grey = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  const nr = Math.round(grey + (r - grey) * amount);
  const ng = Math.round(grey + (g - grey) * amount);
  const nb = Math.round(grey + (b - grey) * amount);
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

/**
 * Expand a recurring time block into one concrete Date event per day-of-week
 * for the week containing `referenceDate`.
 */
function expandTimeBlock(
  block: TimeBlock,
  referenceDate: Date,
): CalendarEvent[] {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 0 }); // Sunday
  const { hours: startH, minutes: startM } = parseTime(block.startTime);
  const { hours: endH, minutes: endM } = parseTime(block.endTime);
  const title = block.activityType?.name ?? 'Unassigned';
  const color = block.activityType?.color ?? '#94a3b8';

  return block.daysOfWeek.map((dayIndex: number) => {
    const dayDate = addDays(weekStart, dayIndex);
    const start = setMinutes(setHours(startOfDay(dayDate), startH), startM);
    const end = setMinutes(setHours(startOfDay(dayDate), endH), endM);
    return {
      id: `${block.id}-${dayIndex}`,
      title,
      start,
      end,
      color,
      resource: block,
    };
  });
}

// ─── Event Style ─────────────────────────────────────────────────────────────

function eventStyleGetter(event: CalendarEvent) {
  const bgColor = event.isPast ? desaturateColor(event.color) : event.color;

  if (event.isTask) {
    return {
      style: {
        backgroundColor: bgColor,
        borderColor: event.isPast
          ? desaturateColor(darkenColor(event.color))
          : darkenColor(event.color),
        color: event.isPast ? '#aaa' : '#fff',
        borderRadius: '4px',
        border: `2px solid ${event.isPast ? desaturateColor(darkenColor(event.color)) : darkenColor(event.color)}`,
        opacity: 1,
        fontWeight: event.isCompleted ? 400 : 600,
        fontSize: '0.75rem',
        zIndex: 10,
        textDecoration: event.isCompleted ? 'line-through' : 'none',
        fontStyle: event.isCompleted ? 'italic' : 'normal',
      },
    };
  }

  return {
    style: {
      backgroundColor: bgColor,
      borderColor: bgColor,
      color: event.isPast ? '#999' : '#fff',
      borderRadius: '4px',
      border: 'none',
      opacity: 0.85,
      fontWeight: 500,
      fontSize: '0.8rem',
    },
  };
}

// ─── Component ───────────────────────────────────────────────────────────────
type CalendarViewProps = {
  timeBlocks: Array<TimeBlock_CalendarViewFragment>;
  schedule: Array<ScheduledItem_CalendarViewFragment>;
};

export function CalendarView({ timeBlocks, schedule }: CalendarViewProps) {
  // Background events: time block slots rendered as shaded background fills
  const backgroundEvents = useMemo<CalendarEvent[]>(() => {
    if (timeBlocks) return [];
    const now = new Date();
    return timeBlocks.flatMap((block) =>
      expandTimeBlock(block, now).map((event) => ({
        ...event,
        isPast: event.end < now,
      })),
    );
  }, [timeBlocks]);

  // Foreground events: scheduled tasks rendered as clickable overlays
  const scheduledEvents = useMemo<CalendarEvent[]>(() => {
    if (schedule) return [];
    const now = new Date();
    return schedule
      .filter((item) => {
        if (!item.isScheduled || !item.scheduledStart || !item.scheduledEnd)
          return false;
        // Only show future scheduled events — past ones are omitted from the calendar
        const end = new Date(item.scheduledEnd);
        return end > now;
      })
      .map((item) => {
        const kindPrefix = item.kind === 'todo' ? '✓ ' : '↻ ';
        const end = new Date(item.scheduledEnd as string);
        return {
          id: `scheduled-${item.kind}-${item.id}`,
          title: `${kindPrefix}${item.title}`,
          start: new Date(item.scheduledStart as string),
          end,
          color: item.activityType?.color ?? '#64748b',
          isTask: true,
        };
      });
  }, [schedule]);

  // Completed todo events — shown at their completedAt time (duration = estimatedLength from schedule)
  const completedEvents = useMemo<CalendarEvent[]>(() => {
    if (schedule) return [];
    return schedule
      .filter(
        (item) =>
          item.kind === 'todo' &&
          item.completedAt &&
          item.scheduledEnd &&
          item.scheduledStart,
      )
      .map((item) => {
        const start = new Date(item.completedAt as string);
        // Duration = same as originally scheduled
        const scheduledStart = new Date(item.scheduledStart as string);
        const scheduledEnd = new Date(item.scheduledEnd as string);
        const durationMs = scheduledEnd.getTime() - scheduledStart.getTime();
        const end = new Date(start.getTime() + durationMs);
        const color = item.activityType?.color ?? '#64748b';
        return {
          id: `completed-todo-${item.id}`,
          title: `✓ ${item.title}`,
          start,
          end,
          color,
          isTask: true,
          isPast: true,
          isCompleted: true,
        };
      });
  }, [schedule]);

  return (
    <div className="rbc-calendar-wrapper h-full" style={{ minHeight: '400px' }}>
      <Calendar
        localizer={localizer}
        events={[...scheduledEvents, ...completedEvents]}
        backgroundEvents={backgroundEvents}
        defaultView="week"
        views={['week', 'day']}
        step={30}
        timeslots={2}
        eventPropGetter={eventStyleGetter as never}
        style={{ height: '100%' }}
        formats={{
          timeGutterFormat: (date: Date) => format(date, 'h a'),
          eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
            `${format(start, 'h:mm')}–${format(end, 'h:mm a')}`,
        }}
      />
    </div>
  );
}
