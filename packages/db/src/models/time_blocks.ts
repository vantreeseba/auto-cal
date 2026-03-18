import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import type { ActivityType } from './enums.ts';
import { users } from './users.ts';

export const timeBlocks = pgTable('time_blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  activityType: text('activity_type').notNull().$type<ActivityType>(),
  daysOfWeek: integer('days_of_week').array().notNull(), // 0 = Sunday, 6 = Saturday
  startTime: text('start_time').notNull(), // HH:MM format (24h)
  endTime: text('end_time').notNull(), // HH:MM format (24h)
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type TimeBlock = typeof timeBlocks.$inferSelect;
export type NewTimeBlock = typeof timeBlocks.$inferInsert;
