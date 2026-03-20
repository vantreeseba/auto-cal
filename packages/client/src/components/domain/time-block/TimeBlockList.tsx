import type { TimeBlock_TimeBlockListFragment } from '@/__generated__/graphql.js';
import { graphql } from '@/__generated__/index.js';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { TimeBlockForm } from './TimeBlockForm';
import { TimeBlockItem } from './TimeBlockItem';

export const TIME_BLOCK_LIST_FRAGMENT = graphql(`
  fragment TimeBlock_TimeBlockList on TimeBlock {
    id
    activityType {
      id
      name
      color
    }
    daysOfWeek
    startTime
    endTime
    createdAt
  }
`);

type TimeBlock = TimeBlock_TimeBlockListFragment;

type TimeBlockListProps = {
  items: TimeBlock[];
  loading?: boolean;
  error?: Error | null;
};

export function TimeBlockList({ items, loading, error }: TimeBlockListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingTimeBlock, setEditingTimeBlock] = useState<TimeBlock | null>(
    null,
  );

  function openCreate() {
    setEditingTimeBlock(null);
    setFormOpen(true);
  }

  function openEdit(timeBlock: TimeBlock) {
    setEditingTimeBlock(timeBlock);
    setFormOpen(true);
  }

  function handleFormOpenChange(open: boolean) {
    setFormOpen(open);
    if (!open) setEditingTimeBlock(null);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Time Blocks</CardTitle>
              <CardDescription>
                Designated time periods for different activity types
              </CardDescription>
            </div>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Time Block
            </Button>
          </div>
        </CardHeader>
        {loading && (
          <p className="px-6 pb-4 text-muted-foreground">
            Loading time blocks…
          </p>
        )}
        {error && (
          <p className="px-6 pb-4 text-destructive">
            Error loading time blocks: {error.message}
          </p>
        )}
        {!loading && items.length === 0 && (
          <p className="px-6 pb-4 text-muted-foreground">
            No time blocks yet. Create your first one!
          </p>
        )}
        {items.length > 0 && (
          <div className="space-y-2 px-6 pb-6">
            {items.map((block) => (
              <TimeBlockItem
                key={block.id}
                timeBlock={block}
                onEdit={openEdit}
              />
            ))}
          </div>
        )}
      </Card>

      <TimeBlockForm
        {...(editingTimeBlock !== null ? { timeBlock: editingTimeBlock } : {})}
        open={formOpen}
        onOpenChange={handleFormOpenChange}
      />
    </>
  );
}
