import type { GetActivityTypeStatsQuery } from '@/__generated__/graphql.js';
import { graphql } from '@/__generated__/index.js';
import { ActivityTypeList } from '@/components/domain/activity-type/ActivityTypeList';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

type ActivityTypeStats = GetActivityTypeStatsQuery['activityTypeStats'][number];

const GET_MY_ACTIVITY_TYPES = graphql(`
  query GetMyActivityTypes {
    myActivityTypes {
      ...ActivityType_ActivityTypeList
    }
  }
`);

const GET_ACTIVITY_TYPE_STATS = gql`
  query GetActivityTypeStats {
    activityTypeStats {
      activityTypeId
      totalTodos
      completedTodos
      totalHabits
    }
  }
`;

export default function ActivityTypesPage() {
  const { data } = useQuery(GET_MY_ACTIVITY_TYPES, {
    fetchPolicy: 'cache-and-network',
  });
  const { data: statsData } = useQuery<GetActivityTypeStatsQuery>(
    GET_ACTIVITY_TYPE_STATS,
  );
  const rawStats: ActivityTypeStats[] = statsData?.activityTypeStats ?? [];
  const statsById = new Map<string, ActivityTypeStats>(
    rawStats.map((s) => [s.activityTypeId, s]),
  );
  return (
    <div className="container mx-auto flex-1 overflow-y-auto px-4 py-6">
      <ActivityTypeList
        items={data?.myActivityTypes ?? []}
        statsById={statsById}
      />
    </div>
  );
}
