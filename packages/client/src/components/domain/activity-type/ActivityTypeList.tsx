import type { ActivityType_ActivityTypeListFragment } from '@/__generated__/graphql.js';
import { graphql } from '@/__generated__/index.js';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { ActivityTypeForm } from './ActivityTypeForm';

// ─── GraphQL ────────────────────────────────────────────────────────────────

export const ACTIVITY_TYPE_LIST_FRAGMENT = graphql(`
  fragment ActivityType_ActivityTypeList on ActivityType {
    id
    name
    color
  }
`);

// ─── Types ──────────────────────────────────────────────────────────────────

type ActivityTypeItem = ActivityType_ActivityTypeListFragment;

// ─── Component ──────────────────────────────────────────────────────────────

type ActivityTypeListProps = {
  items: ActivityTypeItem[];
};

export function ActivityTypeList({ items }: ActivityTypeListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ActivityTypeItem | null>(null);

  function openCreate() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function openEdit(item: ActivityTypeItem) {
    setEditingItem(item);
    setFormOpen(true);
  }

  function handleFormOpenChange(open: boolean) {
    setFormOpen(open);
    if (!open) setEditingItem(null);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Types</CardTitle>
              <CardDescription>
                Categories for your todos, habits, and time blocks
              </CardDescription>
            </div>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Activity Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No activity types yet. Create one to categorize your tasks!
            </p>
          )}
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openEdit(item)}
                  aria-label={`Edit ${item.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ActivityTypeForm
        {...(editingItem !== null ? { activityType: editingItem } : {})}
        open={formOpen}
        onOpenChange={handleFormOpenChange}
      />
    </>
  );
}
