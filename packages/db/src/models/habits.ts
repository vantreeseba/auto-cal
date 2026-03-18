import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import type { ActivityType, FrequencyUnit } from './enums.ts';
import { users } from './users.ts';

export const habits = pgTable('habits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  priority: integer('priority').notNull().default(0),
  estimatedLength: integer('estimated_length').notNull(), // in minutes
  activityType: text('activity_type').notNull().$type<ActivityType>(),
  frequencyCount: integer('frequency_count').notNull(), // X times per...
  frequencyUnit: text('frequency_unit').notNull().$type<FrequencyUnit>(), // week or month
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
