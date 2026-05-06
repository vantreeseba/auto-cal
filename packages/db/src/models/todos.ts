import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { activityTypes } from './activity_types.ts';
import { users } from './users.ts';

export const todos = pgTable('todos', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  priority: integer('priority').notNull().default(0),
  estimatedLength: integer('estimated_length').notNull(),
  activityTypeId: uuid('activity_type_id').references(() => activityTypes.id, {
    onDelete: 'set null',
  }),
  scheduledAt: timestamp('scheduled_at'),
  completedAt: timestamp('completed_at'),
  manuallyScheduled: boolean('manually_scheduled').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
