import { graphql } from '@/__generated__/index.js';
import { ActivityTypeList } from '@/components/domain/activity-type/ActivityTypeList';
import { useReadQuery } from '@apollo/client';
import { createFileRoute } from '@tanstack/react-router';

const GET_MY_ACTIVITY_TYPES = graphql(`
  query GetMyActivityTypes {
    myActivityTypes {
      ...ActivityType_ActivityTypeList
    }
  }
`);

export const Route = createFileRoute('/activity-types')({
  component: ActivityTypesPage,
  loader: ({ context }) => ({
    GET_MY_ACTIVITY_TYPES: context.preloadQuery(GET_MY_ACTIVITY_TYPES),
  }),
});

function ActivityTypesPage() {
  const { GET_MY_ACTIVITY_TYPES } = Route.useLoaderData();
  const { data } = useReadQuery(GET_MY_ACTIVITY_TYPES);
  return (
    <div className="container mx-auto flex-1 overflow-y-auto px-4 py-6">
      <ActivityTypeList items={data?.myActivityTypes ?? []} />
    </div>
  );
}
