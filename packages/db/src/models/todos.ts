import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import type { ActivityType } from './enums.ts';
import { users } from './users.ts';

export const todos = pgTable('todos', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  priority: integer('priority').notNull().default(0), // Higher number = higher priority
  estimatedLength: integer('estimated_length').notNull(), // in minutes
  activityType: text('activity_type').notNull().$type<ActivityType>(),
  scheduledAt: timestamp('scheduled_at'), // When auto-scheduled
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
