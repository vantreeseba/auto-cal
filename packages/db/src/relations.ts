import { defineRelations } from 'drizzle-orm';
import * as schema from './schema.ts';

export const relations = defineRelations(schema, (r) => ({
  users: {
    activityTypes: r.many.activityTypes({
      from: r.users.id,
      to: r.activityTypes.userId,
    }),
    todos: r.many.todos({
      from: r.users.id,
      to: r.todos.userId,
    }),
    habits: r.many.habits({
      from: r.users.id,
      to: r.habits.userId,
    }),
    timeBlocks: r.many.timeBlocks({
      from: r.users.id,
      to: r.timeBlocks.userId,
    }),
  },
  activityTypes: {
    user: r.one.users({
      from: r.activityTypes.userId,
      to: r.users.id,
    }),
    todos: r.many.todos({
      from: r.activityTypes.id,
      to: r.todos.activityTypeId,
    }),
    habits: r.many.habits({
      from: r.activityTypes.id,
      to: r.habits.activityTypeId,
    }),
    timeBlocks: r.many.timeBlocks({
      from: r.activityTypes.id,
      to: r.timeBlocks.activityTypeId,
    }),
  },
  todos: {
    user: r.one.users({
      from: r.todos.userId,
      to: r.users.id,
    }),
    activityType: r.one.activityTypes({
      from: r.todos.activityTypeId,
      to: r.activityTypes.id,
    }),
  },
  habits: {
    user: r.one.users({
      from: r.habits.userId,
      to: r.users.id,
    }),
    activityType: r.one.activityTypes({
      from: r.habits.activityTypeId,
      to: r.activityTypes.id,
    }),
    completions: r.many.habitCompletions({
      from: r.habits.id,
      to: r.habitCompletions.habitId,
    }),
  },
  habitCompletions: {
    habit: r.one.habits({
      from: r.habitCompletions.habitId,
      to: r.habits.id,
    }),
  },
  timeBlocks: {
    user: r.one.users({
      from: r.timeBlocks.userId,
      to: r.users.id,
    }),
    activityType: r.one.activityTypes({
      from: r.timeBlocks.activityTypeId,
      to: r.activityTypes.id,
    }),
  },
}));
