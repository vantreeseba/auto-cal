import { graphql } from '@/__generated__/index.js';
import { TimeBlockList } from '@/components/domain/time-block/TimeBlockList';
import { RouteError } from '@/components/ui/route-error';
import { useReadQuery } from '@apollo/client';
import { createFileRoute } from '@tanstack/react-router';

const GET_MY_TIME_BLOCKS = graphql(`
  query GetMyTimeBlocksV2 {
    myTimeBlocks {
      ...TimeBlock_TimeBlockList
    }
  }
`);

export const Route = createFileRoute('/time-blocks')({
  component: TimeBlocksPage,
  errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
  loader: ({ context }) => ({
    GET_MY_TIME_BLOCKS: context.preloadQuery(GET_MY_TIME_BLOCKS),
  }),
});

function TimeBlocksPage() {
  const { GET_MY_TIME_BLOCKS } = Route.useLoaderData();
  const { data } = useReadQuery(GET_MY_TIME_BLOCKS);
  return (
    <div className="container mx-auto flex-1 overflow-y-auto px-4 py-6">
      <TimeBlockList items={data?.myTimeBlocks ?? []} />
    </div>
  );
}
