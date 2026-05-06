/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type CompleteHabitArgs = {
  habitId: string | number;
  scheduledAt?: string | null | undefined;
};

export type CreateActivityTypeArgs = {
  color?: string | null | undefined;
  name: string;
};

export type CreateHabitArgs = {
  activityTypeId?: string | number | null | undefined;
  description?: string | null | undefined;
  estimatedLength?: number | null | undefined;
  frequencyCount: number;
  frequencyUnit: string;
  priority?: number | null | undefined;
  title: string;
};

export type CreateTimeBlockArgs = {
  activityTypeId?: string | number | null | undefined;
  daysOfWeek: Array<number>;
  endTime: string;
  priority?: number | null | undefined;
  startTime: string;
};

export type CreateTodoArgs = {
  activityTypeId?: string | number | null | undefined;
  description?: string | null | undefined;
  estimatedLength?: number | null | undefined;
  priority?: number | null | undefined;
  scheduledAt?: string | null | undefined;
  title: string;
};

export type InnerOrder = {
  direction: OrderDirection;
  /** Priority of current field */
  priority: number;
};

/** Order by direction */
export type OrderDirection =
  /** Ascending order */
  | 'asc'
  /** Descending order */
  | 'desc';

export type ScheduledItemKind =
  | 'habit'
  | 'todo';

export type TodoOrderBy = {
  activityTypeId?: InnerOrder | null | undefined;
  completedAt?: InnerOrder | null | undefined;
  createdAt?: InnerOrder | null | undefined;
  description?: InnerOrder | null | undefined;
  estimatedLength?: InnerOrder | null | undefined;
  id?: InnerOrder | null | undefined;
  manuallyScheduled?: InnerOrder | null | undefined;
  priority?: InnerOrder | null | undefined;
  scheduledAt?: InnerOrder | null | undefined;
  title?: InnerOrder | null | undefined;
  updatedAt?: InnerOrder | null | undefined;
  userId?: InnerOrder | null | undefined;
};

export type UpdateActivityTypeArgs = {
  color?: string | null | undefined;
  id: string | number;
  name?: string | null | undefined;
};

export type UpdateHabitArgs = {
  activityTypeId?: string | number | null | undefined;
  description?: string | null | undefined;
  estimatedLength?: number | null | undefined;
  frequencyCount?: number | null | undefined;
  frequencyUnit?: string | null | undefined;
  id: string | number;
  priority?: number | null | undefined;
  title?: string | null | undefined;
};

export type UpdateTimeBlockArgs = {
  activityTypeId?: string | number | null | undefined;
  daysOfWeek?: Array<number> | null | undefined;
  endTime?: string | null | undefined;
  id: string | number;
  priority?: number | null | undefined;
  startTime?: string | null | undefined;
};

export type UpdateTodoArgs = {
  activityTypeId?: string | number | null | undefined;
  completedAt?: string | null | undefined;
  description?: string | null | undefined;
  estimatedLength?: number | null | undefined;
  id: string | number;
  manuallyScheduled?: boolean | null | undefined;
  priority?: number | null | undefined;
  scheduledAt?: string | null | undefined;
  title?: string | null | undefined;
};

export type CreateActivityTypeMutationVariables = Exact<{
  input: CreateActivityTypeArgs;
}>;


export type CreateActivityTypeMutation = { myCreateActivityType: { id: string, name: string, color: string } };

export type UpdateActivityTypeMutationVariables = Exact<{
  input: UpdateActivityTypeArgs;
}>;


export type UpdateActivityTypeMutation = { myUpdateActivityType: { id: string, name: string, color: string } };

export type DeleteActivityTypeMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteActivityTypeMutation = { myDeleteActivityType: boolean };

export type ActivityType_ActivityTypeListFragment = { id: string, name: string, color: string };

export type GetActivityTypesForSelectQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActivityTypesForSelectQuery = { myActivityTypes: Array<{ id: string, name: string, color: string }> };

export type TimeBlock_CalendarViewFragment = { id: string, daysOfWeek: Array<number>, startTime: string, endTime: string, activityType: { id: string, name: string, color: string } | null };

export type ScheduledItem_CalendarViewFragment = { kind: ScheduledItemKind, id: string, title: string, isScheduled: boolean, isOverdue: boolean, scheduledStart: string | null, scheduledEnd: string | null, completedAt: string | null, activityType: { id: string, name: string, color: string } | null };

export type PinTodoMutationVariables = Exact<{
  input: UpdateTodoArgs;
}>;


export type PinTodoMutation = { myUpdateTodo: { id: string, scheduledAt: unknown, manuallyScheduled: boolean } };

export type CompleteHabitFromCalendarMutationVariables = Exact<{
  input: CompleteHabitArgs;
}>;


export type CompleteHabitFromCalendarMutation = { myCompleteHabit: { id: string } };

export type ScheduledItem_ScheduleViewFragment = { kind: ScheduledItemKind, id: string, title: string, priority: number, estimatedLength: number, isScheduled: boolean, scheduledStart: string | null, scheduledEnd: string | null, activityType: { id: string, name: string, color: string } | null };

export type CompleteHabitFromScheduleMutationVariables = Exact<{
  input: CompleteHabitArgs;
}>;


export type CompleteHabitFromScheduleMutation = { myCompleteHabit: { id: string } };

export type GetHabitDetailQueryVariables = Exact<{
  habitId: string | number;
  periods?: number | null | undefined;
}>;


export type GetHabitDetailQuery = { myHabitDetail: { habitId: string, title: string, description: string | null, priority: number, estimatedLength: number, frequencyCount: number, frequencyUnit: string, totalCompletions: number, allTimeRate: number, activityType: { id: string, name: string, color: string } | null, periods: Array<{ label: string, periodStart: string, periodEnd: string, completions: number, target: number, rate: number }> } };

export type CreateHabitMutationVariables = Exact<{
  input: CreateHabitArgs;
}>;


export type CreateHabitMutation = { myCreateHabit: { id: string, title: string, description: string | null, priority: number, estimatedLength: number, frequencyCount: number, frequencyUnit: string, activityType: { id: string, name: string, color: string } | null } };

export type UpdateHabitMutationVariables = Exact<{
  input: UpdateHabitArgs;
}>;


export type UpdateHabitMutation = { myUpdateHabit: { id: string, title: string, description: string | null, priority: number, estimatedLength: number, frequencyCount: number, frequencyUnit: string, activityType: { id: string, name: string, color: string } | null } };

export type UpdateHabitEstimatedLengthMutationVariables = Exact<{
  input: UpdateHabitArgs;
}>;


export type UpdateHabitEstimatedLengthMutation = { myUpdateHabit: { id: string, estimatedLength: number } };

export type Habit_HabitListFragment = { id: string, title: string, description: string | null, priority: number, estimatedLength: number, frequencyCount: number, frequencyUnit: string, createdAt: unknown, activityType: { id: string, name: string, color: string } | null };

export type CreateTimeBlockMutationVariables = Exact<{
  input: CreateTimeBlockArgs;
}>;


export type CreateTimeBlockMutation = { myCreateTimeBlock: { id: string, daysOfWeek: Array<number>, startTime: string, endTime: string, activityType: { id: string, name: string, color: string } | null } };

export type UpdateTimeBlockMutationVariables = Exact<{
  input: UpdateTimeBlockArgs;
}>;


export type UpdateTimeBlockMutation = { myUpdateTimeBlock: { id: string, daysOfWeek: Array<number>, startTime: string, endTime: string, activityType: { id: string, name: string, color: string } | null } };

export type TimeBlock_TimeBlockListFragment = { id: string, daysOfWeek: Array<number>, startTime: string, endTime: string, priority: number, createdAt: unknown, activityType: { id: string, name: string, color: string } | null };

export type CreateTodoMutationVariables = Exact<{
  input: CreateTodoArgs;
}>;


export type CreateTodoMutation = { myCreateTodo: { id: string, title: string, description: string | null, priority: number, estimatedLength: number, scheduledAt: unknown, completedAt: unknown, activityType: { id: string, name: string, color: string } | null } };

export type UpdateTodoMutationVariables = Exact<{
  input: UpdateTodoArgs;
}>;


export type UpdateTodoMutation = { myUpdateTodo: { id: string, title: string, description: string | null, priority: number, estimatedLength: number, scheduledAt: unknown, completedAt: unknown, activityType: { id: string, name: string, color: string } | null } };

export type CompleteTodoFromFormMutationVariables = Exact<{
  id: string | number;
}>;


export type CompleteTodoFromFormMutation = { myCompleteTodo: { id: string, completedAt: unknown } };

export type CompleteTodoMutationVariables = Exact<{
  id: string | number;
}>;


export type CompleteTodoMutation = { myCompleteTodo: { id: string, completedAt: unknown } };

export type UpdateTodoEstimatedLengthMutationVariables = Exact<{
  input: UpdateTodoArgs;
}>;


export type UpdateTodoEstimatedLengthMutation = { myUpdateTodo: { id: string, estimatedLength: number } };

export type UncompleteTodoMutationVariables = Exact<{
  id: string | number;
}>;


export type UncompleteTodoMutation = { myUpdateTodo: { id: string, completedAt: unknown } };

export type Todo_TodoListFragment = { id: string, title: string, description: string | null, priority: number, estimatedLength: number, scheduledAt: unknown, completedAt: unknown, createdAt: unknown, activityType: { id: string, name: string, color: string } | null };

export type GetMyActivityTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyActivityTypesQuery = { myActivityTypes: Array<{ id: string, name: string, color: string }> };

export type GetActivityTypeStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActivityTypeStatsQuery = { activityTypeStats: Array<{ activityTypeId: string, totalTodos: number, completedTodos: number, totalHabits: number }> };

export type GetCalendarDataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCalendarDataQuery = { myTimeBlocks: Array<{ id: string, daysOfWeek: Array<number>, startTime: string, endTime: string, activityType: { id: string, name: string, color: string } | null }> };

export type MyScheduleQueryVariables = Exact<{
  weekStart?: string | null | undefined;
  timezone?: string | null | undefined;
}>;


export type MyScheduleQuery = { mySchedule: Array<{ id: string, kind: ScheduledItemKind, title: string, isScheduled: boolean, isOverdue: boolean, scheduledStart: string | null, scheduledEnd: string | null, completedAt: string | null, priority: number, estimatedLength: number, activityType: { id: string, name: string, color: string } | null }> };

export type UpdateProfileMutationVariables = Exact<{
  timezone: string;
}>;


export type UpdateProfileMutation = { myUpdateProfile: boolean };

export type GetMyHabitsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyHabitsQuery = { myHabits: Array<{ id: string, title: string, description: string | null, priority: number, estimatedLength: number, frequencyCount: number, frequencyUnit: string, createdAt: unknown, activityType: { id: string, name: string, color: string } | null }> };

export type GetMyStatsQueryVariables = Exact<{
  startDate?: string | null | undefined;
  endDate?: string | null | undefined;
}>;


export type GetMyStatsQuery = { myStats: { weightedScore: number | null, habitScore: number | null, todoScore: number | null, habits: Array<{ habitId: string, title: string, completionRate: number, completions: number, target: number, frequencyUnit: string, frequencyCount: number, activityType: { id: string, color: string } | null }>, todos: { total: number, completed: number, overdue: number, completionRate: number } } };

export type GetMyTimeBlocksQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyTimeBlocksQuery = { myTimeBlocks: Array<{ id: string, daysOfWeek: Array<number>, startTime: string, endTime: string, priority: number, createdAt: unknown, activityType: { id: string, name: string, color: string } | null }> };

export type GetMyTodosQueryVariables = Exact<{
  orderBy?: TodoOrderBy | null | undefined;
}>;


export type GetMyTodosQuery = { myTodos: Array<{ id: string, title: string, description: string | null, priority: number, estimatedLength: number, scheduledAt: unknown, completedAt: unknown, createdAt: unknown, activityType: { id: string, name: string, color: string } | null }> };

export const ActivityType_ActivityTypeListFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ActivityType_ActivityTypeList"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ActivityType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]} as unknown as DocumentNode<ActivityType_ActivityTypeListFragment, unknown>;
export const TimeBlock_CalendarViewFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TimeBlock_CalendarView"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TimeBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"daysOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"activityType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}}]} as unknown as DocumentNode<TimeBlock_CalendarViewFragment, unknown>;
export const ScheduledItem_CalendarViewFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ScheduledItem_CalendarView"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ScheduledItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"isScheduled"}},{"kind":"Field","name":{"kind":"Name","value":"isOverdue"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledStart"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledEnd"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"activityType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}}]} as unknown as DocumentNode<ScheduledItem_CalendarViewFragment, unknown>;
export const ScheduledItem_ScheduleViewFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ScheduledItem_ScheduleView"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ScheduledItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedLength"}},{"kind":"Field","name":{"kind":"Name","value":"isScheduled"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledStart"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledEnd"}},{"kind":"Field","name":{"kind":"Name","value":"activityType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}}]} as unknown as DocumentNode<ScheduledItem_ScheduleViewFragment, unknown>;
export const Habit_HabitListFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Habit_HabitList"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Habit"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedLength"}},{"kind":"Field","name":{"kind":"Name","value":"activityType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"frequencyCount"}},{"kind":"Field","name":{"kind":"Name","value":"frequencyUnit"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<Habit_HabitListFragment, unknown>;
export const TimeBlock_TimeBlockListFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TimeBlock_TimeBlockList"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TimeBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"activityType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"daysOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<TimeBlock_TimeBlockListFragment, unknown>;
export const Todo_TodoListFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Todo_TodoList"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Todo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedLength"}},{"kind":"Field","name":{"kind":"Name","value":"activityType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"scheduledAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<Todo_TodoListFragment, unknown>;
export const CreateActivityTypeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateActivityType"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateActivityTypeArgs"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myCreateActivityType"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}}]} as unknown as DocumentNode<CreateActivityTypeMutation, CreateActivityTypeMutationVariables>;
export const UpdateActivityTypeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateActivityType"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateActivityTypeArgs"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myUpdateActivityType"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}}]} as unknown as DocumentNode<UpdateActivityTypeMutation, UpdateActivityTypeMutationVariables>;
export const DeleteActivityTypeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteActivityType"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myDeleteActivityType"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteActivityTypeMutation, DeleteActivityTypeMutationVariables>;
export const GetActivityTypesForSelectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetActivityTypesForSelect"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myActivityTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}}]} as unknown as DocumentNode<GetActivityTypesForSelectQuery, GetActivityTypesForSelectQueryVariables>;
export const PinTodoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PinTodo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTodoArgs"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myUpdateTodo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledAt"}},{"kind":"Field","name":{"kind":"Name","value":"manuallyScheduled"}}]}}]}}]} as unknown as DocumentNode<PinTodoMutation, PinTodoMutationVariables>;
export const CompleteHabitFromCalendarDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CompleteHabitFromCalendar"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CompleteHabitArgs"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myCompleteHabit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CompleteHabitFromCalendarMutation, CompleteHabitFromCalendarMutationVariables>;
export const CompleteHabitFromScheduleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CompleteHabitFromSchedule"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CompleteHabitArgs"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myCompleteHabit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CompleteHabitFromScheduleMutation, CompleteHabitFromScheduleMutationVariables>;
export const GetHabitDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetHabitDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"habitId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periods"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myHabitDetail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"habitId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"habitId"}}},{"kind":"Argument","name":{"kind":"Name","value":"periods"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periods"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"habitId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedLength"}},{"kind":"Field","name":{"kind":"Name","value":"frequencyCount"}},{"kind":"Field","name":{"kind":"Name","value":"frequencyUnit"}},{"kind":"Field","name":{"kind":"Name","value":"totalCompletions"}},{"kind":"Field","name":{"kind":"Name","value":"allTimeRate"}},{"kind":"Field","name":{"kind":"Name","value":"activityType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"periods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"periodStart"}},{"kind":"Field","name":{"kind":"Name","value":"periodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"completions"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"rate"}}]}}]}}]}}]} as unknown as DocumentNode<GetHabitDetailQuery, GetHabitDetailQueryVariables>;
export const CreateHabitDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateHabit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateHabitArgs"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myCreateHabit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"activityType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedLength"}},{"kind":"Field","name":{"kind":"Name","value":"frequencyCount"}},{"kind":"Field","name":{"kind":"Name","value":"frequencyUnit"}}]}}]}}]} as unknown as DocumentNode<CreateHabitMutation, CreateHabitMutationVariables>;
export const UpdateHabitDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateHabit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateHabitArgs"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myUpdateHabit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"activityType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedLength"}},{"kind":"Field","name":{"kind":"Name","value":"frequencyCount"}},{"kind":"Field","name":{"kind":"Name","value":"frequencyUnit"}}]}}]}}]} as unknown as DocumentNode<UpdateHabitMutation, UpdateHabitMutationVariables>;
export const UpdateHabitEstimatedLengthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateHabitEstimatedLength"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateHabitArgs"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myUpdateHabit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedLength"}}]}}]}}]} as unknown as DocumentNode<UpdateHabitEstimatedLengthMutation, UpdateHabitEstimatedLengthMutationVariables>;
export const CreateTimeBlockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTimeBlock"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTimeBlockArgs"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myCreateTimeBlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"activityType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"daysOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}}]}}]} as unknown as DocumentNode<CreateTimeBlockMutation, CreateTimeBlockMutationVariables>;
export const UpdateTimeBlockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTimeBlock"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTimeBlockArgs"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myUpdateTimeBlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"activityType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"daysOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}}]}}]} as unknown as DocumentNode<UpdateTimeBlockMutation, UpdateTimeBlockMutationVariables>;
export const CreateTodoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTodo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTodoArgs"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myCreateTodo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"activityType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedLength"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]} as unknown as DocumentNode<CreateTodoMutation, CreateTodoMutationVariables>;
export const UpdateTodoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTodo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTodoArgs"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myUpdateTodo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"activityType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedLength"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateTodoMutation, UpdateTodoMutationVariables>;
export const CompleteTodoFromFormDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CompleteTodoFromForm"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myCompleteTodo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]} as unknown as DocumentNode<CompleteTodoFromFormMutation, CompleteTodoFromFormMutationVariables>;
export const CompleteTodoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CompleteTodo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myCompleteTodo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]} as unknown as DocumentNode<CompleteTodoMutation, CompleteTodoMutationVariables>;
export const UpdateTodoEstimatedLengthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTodoEstimatedLength"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTodoArgs"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myUpdateTodo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedLength"}}]}}]}}]} as unknown as DocumentNode<UpdateTodoEstimatedLengthMutation, UpdateTodoEstimatedLengthMutationVariables>;
export const UncompleteTodoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UncompleteTodo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myUpdateTodo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"completedAt"},"value":{"kind":"NullValue"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]} as unknown as DocumentNode<UncompleteTodoMutation, UncompleteTodoMutationVariables>;
export const GetMyActivityTypesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMyActivityTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myActivityTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ActivityType_ActivityTypeList"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ActivityType_ActivityTypeList"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ActivityType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]} as unknown as DocumentNode<GetMyActivityTypesQuery, GetMyActivityTypesQueryVariables>;
export const GetActivityTypeStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetActivityTypeStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activityTypeStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activityTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"totalTodos"}},{"kind":"Field","name":{"kind":"Name","value":"completedTodos"}},{"kind":"Field","name":{"kind":"Name","value":"totalHabits"}}]}}]}}]} as unknown as DocumentNode<GetActivityTypeStatsQuery, GetActivityTypeStatsQueryVariables>;
export const GetCalendarDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCalendarData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myTimeBlocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"TimeBlock_CalendarView"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TimeBlock_CalendarView"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TimeBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"daysOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"activityType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}}]} as unknown as DocumentNode<GetCalendarDataQuery, GetCalendarDataQueryVariables>;
export const MyScheduleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MySchedule"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"weekStart"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"timezone"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mySchedule"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"weekStart"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weekStart"}}},{"kind":"Argument","name":{"kind":"Name","value":"timezone"},"value":{"kind":"Variable","name":{"kind":"Name","value":"timezone"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ScheduledItem_CalendarView"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ScheduledItem_ScheduleView"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ScheduledItem_CalendarView"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ScheduledItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"isScheduled"}},{"kind":"Field","name":{"kind":"Name","value":"isOverdue"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledStart"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledEnd"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"activityType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ScheduledItem_ScheduleView"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ScheduledItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedLength"}},{"kind":"Field","name":{"kind":"Name","value":"isScheduled"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledStart"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledEnd"}},{"kind":"Field","name":{"kind":"Name","value":"activityType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}}]} as unknown as DocumentNode<MyScheduleQuery, MyScheduleQueryVariables>;
export const UpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"timezone"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myUpdateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"timezone"},"value":{"kind":"Variable","name":{"kind":"Name","value":"timezone"}}}]}]}}]} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const GetMyHabitsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMyHabits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myHabits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Habit_HabitList"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Habit_HabitList"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Habit"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedLength"}},{"kind":"Field","name":{"kind":"Name","value":"activityType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"frequencyCount"}},{"kind":"Field","name":{"kind":"Name","value":"frequencyUnit"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<GetMyHabitsQuery, GetMyHabitsQueryVariables>;
export const GetMyStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMyStats"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myStats"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"startDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"weightedScore"}},{"kind":"Field","name":{"kind":"Name","value":"habitScore"}},{"kind":"Field","name":{"kind":"Name","value":"todoScore"}},{"kind":"Field","name":{"kind":"Name","value":"habits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"habitId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"completionRate"}},{"kind":"Field","name":{"kind":"Name","value":"completions"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"frequencyUnit"}},{"kind":"Field","name":{"kind":"Name","value":"frequencyCount"}},{"kind":"Field","name":{"kind":"Name","value":"activityType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"todos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}},{"kind":"Field","name":{"kind":"Name","value":"overdue"}},{"kind":"Field","name":{"kind":"Name","value":"completionRate"}}]}}]}}]}}]} as unknown as DocumentNode<GetMyStatsQuery, GetMyStatsQueryVariables>;
export const GetMyTimeBlocksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMyTimeBlocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myTimeBlocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TimeBlock_TimeBlockList"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TimeBlock_TimeBlockList"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TimeBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"activityType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"daysOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<GetMyTimeBlocksQuery, GetMyTimeBlocksQueryVariables>;
export const GetMyTodosDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMyTodos"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TodoOrderBy"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myTodos"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Todo_TodoList"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Todo_TodoList"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Todo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedLength"}},{"kind":"Field","name":{"kind":"Name","value":"activityType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"scheduledAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<GetMyTodosQuery, GetMyTodosQueryVariables>;