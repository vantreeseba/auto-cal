import type { ActivityType, DB } from '@auto-cal/db';
import { activityTypes } from '@auto-cal/db/schema';
import { inArray } from 'drizzle-orm';
import DataLoader from 'dataloader';

export interface Context {
  db: DB;
  userId?: string; // undefined = not authenticated
  loaders: ReturnType<typeof createLoaders>;
}

export function createLoaders(db: DB) {
  return {
    activityType: new DataLoader<string, ActivityType | null>(async (ids) => {
      const rows = await db._query.activityTypes.findMany({
        where: inArray(activityTypes.id, [...ids]),
      });
      const byId = new Map(rows.map((r) => [r.id, r]));
      return ids.map((id) => byId.get(id) ?? null);
    }),
  };
}
