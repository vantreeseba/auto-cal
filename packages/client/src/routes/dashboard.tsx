import { graphql } from '@/__generated__/index.js';
import { CalendarView } from '@/components/domain/dashboard/CalendarView';
import { ScheduleView } from '@/components/domain/dashboard/ScheduleView';
import { Button } from '@/components/ui/button';
import { RouteError } from '@/components/ui/route-error';
import { gql, useMutation, useQuery, useReadQuery } from '@apollo/client';
import { createFileRoute } from '@tanstack/react-router';
import { addDays, addWeeks, format } from 'date-fns';
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

function toMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
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

  const [weekStart, setWeekStart] = useState<Date>(() => toMonday(new Date()));
  const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [updateProfile] = useMutation(UPDATE_PROFILE);

  useEffect(() => {
    updateProfile({ variables: { timezone: clientTimezone } }).catch(console.error);
  }, []);

  const { data: scheduleData } = useQuery(MY_SCHEDULE, {
    variables: { weekStart: weekStart.toISOString(), timezone: clientTimezone },
  });

  const weekEnd = addDays(weekStart, 6);
  const thisYear = new Date().getFullYear();
  const weekLabel =
    weekEnd.getFullYear() === thisYear
      ? `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d')}`
      : `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`;
  const isCurrentWeek = toMonday(new Date()).getTime() === weekStart.getTime();

  return (
    <div className="container mx-auto flex h-full min-h-0 flex-col px-4 pt-4">
      <div className="mb-3 flex-shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Your weekly schedule at a glance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekStart((w) => toMonday(addWeeks(w, -1)))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[160px] text-center text-sm font-medium">
            {weekLabel}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekStart((w) => toMonday(addWeeks(w, 1)))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {!isCurrentWeek && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWeekStart(toMonday(new Date()))}
            >
              Today
            </Button>
          )}
        </div>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <CalendarView
          timeBlocks={calendarViewData.myTimeBlocks}
          schedule={scheduleData?.mySchedule ?? []}
          weekStart={weekStart}
        />
        <ScheduleView schedule={scheduleData?.mySchedule ?? []} />
      </div>
    </div>
  );
}
