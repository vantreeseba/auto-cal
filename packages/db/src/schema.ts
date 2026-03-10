import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const ACTIVITY_TYPES = [
  'work',
  'exercise',
  'learning',
  'personal',
  'social',
  'chores',
  'creative',
  'other',
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const FREQUENCY_UNITS = ['week', 'month'] as const;
export type FrequencyUnit = (typeof FREQUENCY_UNITS)[number];

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Todos - single-time tasks
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

// Habits - repeated tasks
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

// Habit completions - track when habits are completed
export const habitCompletions = pgTable('habit_completions', {
  id: uuid('id').primaryKey().defaultRandom(),
  habitId: uuid('habit_id')
    .notNull()
    .references(() => habits.id, { onDelete: 'cascade' }),
  scheduledAt: timestamp('scheduled_at'), // When it was scheduled
  completedAt: timestamp('completed_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Time Blocks - labeled time periods for specific activity types
export const timeBlocks = pgTable('time_blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  activityType: text('activity_type').notNull().$type<ActivityType>(),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 6 = Saturday
  startTime: text('start_time').notNull(), // HH:MM format (24h)
  endTime: text('end_time').notNull(), // HH:MM format (24h)
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;

export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;

export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type NewHabitCompletion = typeof habitCompletions.$inferInsert;

export type TimeBlock = typeof timeBlocks.$inferSelect;
export type NewTimeBlock = typeof timeBlocks.$inferInsert;
