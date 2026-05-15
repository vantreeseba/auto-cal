import { graphql } from '@/__generated__/index.js';
import { TimeBlockList } from '@/components/domain/time-block/TimeBlockList';
import { useQuery } from '@apollo/client/react';

const GET_MY_TIME_BLOCKS = graphql(`
  query GetMyTimeBlocks {
    myTimeBlocks {
      ...TimeBlock_TimeBlockList
    }
  }
`);

export default function TimeBlocksPage() {
  const { data } = useQuery(GET_MY_TIME_BLOCKS, {
    fetchPolicy: 'cache-and-network',
  });
  return (
    <div className="container mx-auto flex-1 overflow-y-auto px-4 py-6">
      <TimeBlockList items={data?.myTimeBlocks ?? []} />
    </div>
  );
}
