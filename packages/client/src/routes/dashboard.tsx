import { graphql } from '@/__generated__/index.js';
import { CalendarView } from '@/components/domain/dashboard/CalendarView';
import { ScheduleView } from '@/components/domain/dashboard/ScheduleView';
import { useReadQuery } from '@apollo/client';
import { createFileRoute } from '@tanstack/react-router';

const GET_CALENDAR_DATA = graphql(`
  query GetCalendarData {
    myTimeBlocks {
      id
      ...TimeBlock_CalendarView
    }
    mySchedule {
      id
      ...ScheduledItem_CalendarView
    }
  }
`);

const MY_SCHEDULE = graphql(`
  query MySchedule($weekStart: String) {
    mySchedule(weekStart: $weekStart) {
      id
      ...ScheduledItem_ScheduleView
    }
  }
`);

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
  loader: ({ context }) => ({
    GET_CALENDAR_DATA: context.preloadQuery(GET_CALENDAR_DATA),
    MY_SCHEDULE: context.preloadQuery(MY_SCHEDULE),
  }),
});

function DashboardPage() {
  const { GET_CALENDAR_DATA, MY_SCHEDULE } = Route.useLoaderData();
  const { data: calendarViewData } = useReadQuery(GET_CALENDAR_DATA);
  const { data: scheduleViewData } = useReadQuery(MY_SCHEDULE);

  return (
    <div className="container mx-auto flex h-full min-h-0 flex-col px-4 pt-4">
      <div className="mb-3 flex-shrink-0">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Your weekly schedule at a glance
        </p>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <CalendarView
          timeBlocks={calendarViewData.myTimeBlocks}
          schedule={calendarViewData.mySchedule}
        />
        <ScheduleView schedule={scheduleViewData.mySchedule} />
      </div>
    </div>
  );
}
