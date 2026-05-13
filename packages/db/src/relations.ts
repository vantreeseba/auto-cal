import { defineRelations } from 'drizzle-orm';
import * as schema from './schema.ts';

export const relations = defineRelations(schema, (r) => ({
  users: {
    activityTypes: r.many.activityTypes({
      from: r.users.id,
      to: r.activityTypes.userId,
    }),
    todoLists: r.many.todoLists({
      from: r.users.id,
      to: r.todoLists.userId,
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
    apiKeys: r.many.apiKeys({
      from: r.users.id,
      to: r.apiKeys.userId,
    }),
  },
  apiKeys: {
    user: r.one.users({
      from: r.apiKeys.userId,
      to: r.users.id,
    }),
  },
  activityTypes: {
    user: r.one.users({
      from: r.activityTypes.userId,
      to: r.users.id,
    }),
    todoLists: r.many.todoLists({
      from: r.activityTypes.id,
      to: r.todoLists.activityTypeId,
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
  todoLists: {
    user: r.one.users({
      from: r.todoLists.userId,
      to: r.users.id,
    }),
    activityType: r.one.activityTypes({
      from: r.todoLists.activityTypeId,
      to: r.activityTypes.id,
    }),
    todos: r.many.todos({
      from: r.todoLists.id,
      to: r.todos.listId,
    }),
  },
  todos: {
    user: r.one.users({
      from: r.todos.userId,
      to: r.users.id,
    }),
    list: r.one.todoLists({
      from: r.todos.listId,
      to: r.todoLists.id,
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
