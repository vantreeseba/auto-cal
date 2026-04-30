import { graphql } from '@/__generated__/index.js';
import { CalendarView } from '@/components/domain/dashboard/CalendarView';
import { ScheduleView } from '@/components/domain/dashboard/ScheduleView';
import { Button } from '@/components/ui/button';
import { RouteError } from '@/components/ui/route-error';
import { gql, useMutation, useQuery, useReadQuery } from '@apollo/client';
import { createFileRoute } from '@tanstack/react-router';
import { addDays, addMonths, addWeeks, format, startOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const GET_CALENDAR_DATA = graphql(`
  query GetCalendarData {
    myTimeBlocks {
      id
      ...TimeBlock_CalendarView
    }
  }
`);

const MY_SCHEDULE = graphql(`
  query MySchedule($weekStart: String, $timezone: String) {
    mySchedule(weekStart: $weekStart, timezone: $timezone) {
      id
      ...ScheduledItem_CalendarView
      ...ScheduledItem_ScheduleView
    }
  }
`);

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($timezone: String!) {
    myUpdateProfile(timezone: $timezone)
  }
`;

type CalendarViewMode = 'day' | 'week' | 'month';

function toMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}

function navigateDate(date: Date, view: CalendarViewMode, dir: 1 | -1): Date {
  switch (view) {
    case 'day': return addDays(date, dir);
    case 'week': return toMonday(addWeeks(date, dir));
    case 'month': return startOfMonth(addMonths(date, dir));
  }
}

function dateLabel(date: Date, view: CalendarViewMode): string {
  const thisYear = new Date().getFullYear();
  switch (view) {
    case 'day':
      return date.getFullYear() === thisYear
        ? format(date, 'EEEE, MMM d')
        : format(date, 'EEEE, MMM d, yyyy');
    case 'week': {
      const start = toMonday(date);
      const end = addDays(start, 6);
      return end.getFullYear() === thisYear
        ? `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`
        : `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
    }
    case 'month':
      return format(date, date.getFullYear() === thisYear ? 'MMMM' : 'MMMM yyyy');
  }
}

function isCurrent(date: Date, view: CalendarViewMode): boolean {
  const now = new Date();
  switch (view) {
    case 'day': return format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
    case 'week': return toMonday(now).getTime() === toMonday(date).getTime();
    case 'month': return format(date, 'yyyy-MM') === format(now, 'yyyy-MM');
  }
}

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
  errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
  loader: ({ context }) => ({
    calendarData: context.preloadQuery(GET_CALENDAR_DATA),
  }),
});

function DashboardPage() {
  const { calendarData } = Route.useLoaderData();
  const { data: calendarViewData } = useReadQuery(calendarData);

  const [view, setView] = useState<CalendarViewMode>('week');
  const [date, setDate] = useState<Date>(() => toMonday(new Date()));
  const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [updateProfile] = useMutation(UPDATE_PROFILE);
  useEffect(() => {
    updateProfile({ variables: { timezone: clientTimezone } }).catch(console.error);
  }, []);

  // Schedule is always week-scoped regardless of calendar view
  const weekStart = toMonday(date);
  const { data: scheduleData } = useQuery(MY_SCHEDULE, {
    variables: { weekStart: format(weekStart, 'yyyy-MM-dd'), timezone: clientTimezone },
  });

  function handleViewChange(next: CalendarViewMode) {
    setView(next);
    // Snap date to an appropriate anchor for the new view
    if (next === 'week') setDate(toMonday(date));
    if (next === 'month') setDate(startOfMonth(date));
  }

  return (
    <div className="container mx-auto flex h-full min-h-0 flex-col px-4 pt-4">
      <div className="mb-3 flex-shrink-0 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Your schedule at a glance
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Today — left of view switcher so nav arrows never shift position */}
          {!isCurrent(date, view) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setDate(
                  view === 'week'
                    ? toMonday(new Date())
                    : view === 'month'
                      ? startOfMonth(new Date())
                      : new Date(),
                )
              }
            >
              Today
            </Button>
          )}

          {/* View switcher */}
          <div className="flex rounded-md border p-0.5 gap-0.5">
            {(['day', 'week', 'month'] as const).map((v) => (
              <Button
                key={v}
                size="sm"
                variant={view === v ? 'default' : 'ghost'}
                className="h-7 px-2.5 text-xs capitalize"
                onClick={() => handleViewChange(v)}
              >
                {v}
              </Button>
            ))}
          </div>

          {/* Date navigation */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDate((d) => navigateDate(d, view, -1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[160px] text-center text-sm font-medium">
            {dateLabel(date, view)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDate((d) => navigateDate(d, view, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <CalendarView
          timeBlocks={calendarViewData.myTimeBlocks}
          schedule={scheduleData?.mySchedule ?? []}
          date={date}
          view={view}
        />
        <ScheduleView schedule={scheduleData?.mySchedule ?? []} />
      </div>
    </div>
  );
}
