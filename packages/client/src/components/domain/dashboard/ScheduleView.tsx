import type { ScheduledItem_ScheduleViewFragment } from '@/__generated__/graphql.js';
import { graphql } from '@/__generated__/index.js';
import { format, parseISO } from 'date-fns';
import { useMemo } from 'react';

graphql(`
  fragment ScheduledItem_ScheduleView on ScheduledItem {
    kind
    id
    title
    priority
    estimatedLength
    isScheduled
    scheduledStart
    scheduledEnd
    activityType {
      id
      name
      color
    }
  }
`);

function priorityLabel(priority: number): string {
  if (priority >= 100) return 'Urgent';
  if (priority >= 50) return 'High';
  if (priority >= 25) return 'Medium';
  return 'Low';
}

function groupByDay(
  items: ScheduledItem_ScheduleViewFragment[],
): Map<string, ScheduledItem_ScheduleViewFragment[]> {
  const map = new Map<string, ScheduledItem_ScheduleViewFragment[]>();
  for (const item of items) {
    if (!item.scheduledStart) continue;
    const dayKey = item.scheduledStart.slice(0, 10); // "YYYY-MM-DD"
    const existing = map.get(dayKey) ?? [];
    existing.push(item);
    map.set(dayKey, existing);
  }
  // Sort each day's items by scheduledStart
  for (const [key, dayItems] of map) {
    map.set(
      key,
      dayItems.sort((a, b) =>
        (a.scheduledStart ?? '').localeCompare(b.scheduledStart ?? ''),
      ),
    );
  }
  return map;
}

type ScheduleViewProps = {
  schedule: Array<ScheduledItem_ScheduleViewFragment>;
};

export function ScheduleView({ schedule }: ScheduleViewProps) {
  const { scheduled, unscheduled } = useMemo(() => {
    return {
      scheduled: schedule.filter((i) => i.isScheduled),
      unscheduled: schedule.filter((i) => !i.isScheduled),
    };
  }, [schedule]);

  const byDay = useMemo(() => groupByDay(scheduled), [scheduled]);

  // Sorted day keys
  const dayKeys = useMemo(() => [...byDay.keys()].sort(), [byDay]);

  return (
    <div className="flex flex-col gap-4 overflow-y-auto h-full">
      {/* Scheduled section */}
      {dayKeys.length === 0 && unscheduled.length === 0 && (
        <p className="text-muted-foreground text-sm text-center py-8">
          No tasks scheduled this week. Create todos or habits and assign them
          to an activity type.
        </p>
      )}

      {dayKeys.map((dayKey) => {
        const items = byDay.get(dayKey) ?? [];
        const date = parseISO(dayKey);
        const dayLabel = format(date, 'EEEE, MMM d');
        return (
          <div key={dayKey}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              {dayLabel}
            </p>
            <div className="flex flex-col gap-1.5">
              {items.map((item) => (
                <ScheduleCard key={`${item.kind}-${item.id}`} item={item} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Unscheduled section */}
      {unscheduled.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            Unscheduled ({unscheduled.length})
          </p>
          <div className="flex flex-col gap-1.5">
            {unscheduled.map((item) => (
              <ScheduleCard key={`${item.kind}-${item.id}`} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScheduleCard({ item }: { item: ScheduledItem_ScheduleViewFragment }) {
  const timeRange =
    item.scheduledStart && item.scheduledEnd
      ? `${format(parseISO(item.scheduledStart), 'h:mm a')} – ${format(parseISO(item.scheduledEnd), 'h:mm a')}`
      : null;

  return (
    <div className="flex items-start gap-2.5 rounded-md border bg-card px-3 py-2.5">
      {/* Activity type color bar */}
      <div
        className="mt-0.5 h-4 w-1 flex-shrink-0 rounded-full"
        style={{ backgroundColor: item.activityType?.color ?? '#94a3b8' }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-medium leading-snug">
            {item.title}
          </p>
          {timeRange && (
            <span className="flex-shrink-0 text-xs text-muted-foreground">
              {timeRange}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="capitalize">{item.kind}</span>
          <span>·</span>
          <span>{item.estimatedLength} min</span>
          <span>·</span>
          <span>{priorityLabel(item.priority)}</span>
          {item.activityType && (
            <>
              <span>·</span>
              <span>{item.activityType.name}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
