/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation CreateActivityType($input: CreateActivityTypeArgs!) {\n    myCreateActivityType(input: $input) {\n      id\n      name\n      color\n    }\n  }\n": typeof types.CreateActivityTypeDocument,
    "\n  mutation UpdateActivityType($input: UpdateActivityTypeArgs!) {\n    myUpdateActivityType(input: $input) {\n      id\n      name\n      color\n    }\n  }\n": typeof types.UpdateActivityTypeDocument,
    "\n  mutation DeleteActivityType($id: ID!) {\n    myDeleteActivityType(id: $id)\n  }\n": typeof types.DeleteActivityTypeDocument,
    "\n  fragment ActivityType_ActivityTypeList on ActivityType {\n    id\n    name\n    color\n  }\n": typeof types.ActivityType_ActivityTypeListFragmentDoc,
    "\n  query GetActivityTypesForSelect {\n    myActivityTypes {\n      id\n      name\n      color\n    }\n  }\n": typeof types.GetActivityTypesForSelectDocument,
    "\n  fragment TimeBlock_CalendarView on TimeBlock {\n    id\n    daysOfWeek\n    startTime\n    endTime\n    activityType {\n      id\n      name\n      color\n    }\n  }\n\n  fragment ScheduledItem_CalendarView on ScheduledItem {\n    kind\n    id\n    title\n    isScheduled\n    isOverdue\n    scheduledStart\n    scheduledEnd\n    completedAt\n    activityType {\n      id\n      name\n      color\n    }\n  }\n": typeof types.TimeBlock_CalendarViewFragmentDoc,
    "\n  mutation PinTodo($input: UpdateTodoArgs!) {\n    myUpdateTodo(input: $input) { id scheduledAt isPinnedSchedule }\n  }\n": typeof types.PinTodoDocument,
    "\n  fragment ScheduledItem_ScheduleView on ScheduledItem {\n    kind\n    id\n    title\n    priority\n    estimatedLength\n    isScheduled\n    scheduledStart\n    scheduledEnd\n    activityType {\n      id\n      name\n      color\n    }\n  }\n": typeof types.ScheduledItem_ScheduleViewFragmentDoc,
    "\n  mutation CompleteHabitFromSchedule($input: CompleteHabitArgs!) {\n    myCompleteHabit(input: $input) {\n      id\n    }\n  }\n": typeof types.CompleteHabitFromScheduleDocument,
    "\n  query GetHabitDetail($habitId: ID!, $periods: Int) {\n    myHabitDetail(habitId: $habitId, periods: $periods) {\n      habitId\n      title\n      description\n      priority\n      estimatedLength\n      frequencyCount\n      frequencyUnit\n      totalCompletions\n      allTimeRate\n      activityType {\n        id\n        name\n        color\n      }\n      periods {\n        label\n        periodStart\n        periodEnd\n        completions\n        target\n        rate\n      }\n    }\n  }\n": typeof types.GetHabitDetailDocument,
    "\n  mutation CreateHabit($input: CreateHabitArgs!) {\n    myCreateHabit(input: $input) {\n      id\n      title\n      description\n      activityType {\n        id\n        name\n        color\n      }\n      priority\n      estimatedLength\n      frequencyCount\n      frequencyUnit\n    }\n  }\n": typeof types.CreateHabitDocument,
    "\n  mutation UpdateHabit($input: UpdateHabitArgs!) {\n    myUpdateHabit(input: $input) {\n      id\n      title\n      description\n      activityType {\n        id\n        name\n        color\n      }\n      priority\n      estimatedLength\n      frequencyCount\n      frequencyUnit\n    }\n  }\n": typeof types.UpdateHabitDocument,
    "\n  mutation UpdateHabitEstimatedLength($input: UpdateHabitArgs!) {\n    myUpdateHabit(input: $input) {\n      id\n      estimatedLength\n    }\n  }\n": typeof types.UpdateHabitEstimatedLengthDocument,
    "\n  fragment Habit_HabitList on Habit {\n    id\n    title\n    description\n    priority\n    estimatedLength\n    activityType {\n      id\n      name\n      color\n    }\n    frequencyCount\n    frequencyUnit\n    createdAt\n  }\n": typeof types.Habit_HabitListFragmentDoc,
    "\n  mutation CreateTimeBlock($input: CreateTimeBlockArgs!) {\n    myCreateTimeBlock(input: $input) {\n      id\n      activityType {\n        id\n        name\n        color\n      }\n      daysOfWeek\n      startTime\n      endTime\n    }\n  }\n": typeof types.CreateTimeBlockDocument,
    "\n  mutation UpdateTimeBlock($input: UpdateTimeBlockArgs!) {\n    myUpdateTimeBlock(input: $input) {\n      id\n      activityType {\n        id\n        name\n        color\n      }\n      daysOfWeek\n      startTime\n      endTime\n    }\n  }\n": typeof types.UpdateTimeBlockDocument,
    "\n  fragment TimeBlock_TimeBlockList on TimeBlock {\n    id\n    activityType {\n      id\n      name\n      color\n    }\n    daysOfWeek\n    startTime\n    endTime\n    createdAt\n  }\n": typeof types.TimeBlock_TimeBlockListFragmentDoc,
    "\n  mutation CreateTodo($input: CreateTodoArgs!) {\n    myCreateTodo(input: $input) {\n      id\n      title\n      description\n      activityType {\n        id\n        name\n        color\n      }\n      priority\n      estimatedLength\n      scheduledAt\n      completedAt\n    }\n  }\n": typeof types.CreateTodoDocument,
    "\n  mutation UpdateTodo($input: UpdateTodoArgs!) {\n    myUpdateTodo(input: $input) {\n      id\n      title\n      description\n      activityType {\n        id\n        name\n        color\n      }\n      priority\n      estimatedLength\n      scheduledAt\n      completedAt\n    }\n  }\n": typeof types.UpdateTodoDocument,
    "\n  mutation CompleteTodoFromForm($id: ID!) {\n    myCompleteTodo(id: $id) {\n      id\n      completedAt\n    }\n  }\n": typeof types.CompleteTodoFromFormDocument,
    "\n  mutation CompleteTodo($id: ID!) {\n    myCompleteTodo(id: $id) {\n      id\n      completedAt\n    }\n  }\n": typeof types.CompleteTodoDocument,
    "\n  mutation UpdateTodoEstimatedLength($input: UpdateTodoArgs!) {\n    myUpdateTodo(input: $input) {\n      id\n      estimatedLength\n    }\n  }\n": typeof types.UpdateTodoEstimatedLengthDocument,
    "\n  fragment Todo_TodoList on Todo {\n    id\n    title\n    description\n    priority\n    estimatedLength\n    activityType {\n      id\n      name\n      color\n    }\n    scheduledAt\n    completedAt\n    createdAt\n  }\n": typeof types.Todo_TodoListFragmentDoc,
    "\n  query GetMyActivityTypes {\n    myActivityTypes {\n      ...ActivityType_ActivityTypeList\n    }\n  }\n": typeof types.GetMyActivityTypesDocument,
    "\n  query GetCalendarData {\n    myTimeBlocks {\n      id\n      ...TimeBlock_CalendarView\n    }\n  }\n": typeof types.GetCalendarDataDocument,
    "\n  query MySchedule($weekStart: String, $timezone: String) {\n    mySchedule(weekStart: $weekStart, timezone: $timezone) {\n      id\n      ...ScheduledItem_CalendarView\n      ...ScheduledItem_ScheduleView\n    }\n  }\n": typeof types.MyScheduleDocument,
    "\n  mutation UpdateProfile($timezone: String!) {\n    myUpdateProfile(timezone: $timezone)\n  }\n": typeof types.UpdateProfileDocument,
    "\n  query GetMyHabitsForDetail($id:String!) {\n    habit(where: {id: {eq: $id} }) {\n      ...Habit_HabitList\n    }\n  }\n": typeof types.GetMyHabitsForDetailDocument,
    "\n  query GetMyHabits {\n    myHabits {\n      ...Habit_HabitList\n    }\n  }\n": typeof types.GetMyHabitsDocument,
    "\n  query GetMyTimeBlocksV2 {\n    myTimeBlocks {\n      ...TimeBlock_TimeBlockList\n    }\n  }\n": typeof types.GetMyTimeBlocksV2Document,
    "\n  query GetMyTodosV2 {\n    myTodos {\n      ...Todo_TodoList\n    }\n  }\n": typeof types.GetMyTodosV2Document,
};
const documents: Documents = {
    "\n  mutation CreateActivityType($input: CreateActivityTypeArgs!) {\n    myCreateActivityType(input: $input) {\n      id\n      name\n      color\n    }\n  }\n": types.CreateActivityTypeDocument,
    "\n  mutation UpdateActivityType($input: UpdateActivityTypeArgs!) {\n    myUpdateActivityType(input: $input) {\n      id\n      name\n      color\n    }\n  }\n": types.UpdateActivityTypeDocument,
    "\n  mutation DeleteActivityType($id: ID!) {\n    myDeleteActivityType(id: $id)\n  }\n": types.DeleteActivityTypeDocument,
    "\n  fragment ActivityType_ActivityTypeList on ActivityType {\n    id\n    name\n    color\n  }\n": types.ActivityType_ActivityTypeListFragmentDoc,
    "\n  query GetActivityTypesForSelect {\n    myActivityTypes {\n      id\n      name\n      color\n    }\n  }\n": types.GetActivityTypesForSelectDocument,
    "\n  fragment TimeBlock_CalendarView on TimeBlock {\n    id\n    daysOfWeek\n    startTime\n    endTime\n    activityType {\n      id\n      name\n      color\n    }\n  }\n\n  fragment ScheduledItem_CalendarView on ScheduledItem {\n    kind\n    id\n    title\n    isScheduled\n    isOverdue\n    scheduledStart\n    scheduledEnd\n    completedAt\n    activityType {\n      id\n      name\n      color\n    }\n  }\n": types.TimeBlock_CalendarViewFragmentDoc,
    "\n  mutation PinTodo($input: UpdateTodoArgs!) {\n    myUpdateTodo(input: $input) { id scheduledAt isPinnedSchedule }\n  }\n": types.PinTodoDocument,
    "\n  fragment ScheduledItem_ScheduleView on ScheduledItem {\n    kind\n    id\n    title\n    priority\n    estimatedLength\n    isScheduled\n    scheduledStart\n    scheduledEnd\n    activityType {\n      id\n      name\n      color\n    }\n  }\n": types.ScheduledItem_ScheduleViewFragmentDoc,
    "\n  mutation CompleteHabitFromSchedule($input: CompleteHabitArgs!) {\n    myCompleteHabit(input: $input) {\n      id\n    }\n  }\n": types.CompleteHabitFromScheduleDocument,
    "\n  query GetHabitDetail($habitId: ID!, $periods: Int) {\n    myHabitDetail(habitId: $habitId, periods: $periods) {\n      habitId\n      title\n      description\n      priority\n      estimatedLength\n      frequencyCount\n      frequencyUnit\n      totalCompletions\n      allTimeRate\n      activityType {\n        id\n        name\n        color\n      }\n      periods {\n        label\n        periodStart\n        periodEnd\n        completions\n        target\n        rate\n      }\n    }\n  }\n": types.GetHabitDetailDocument,
    "\n  mutation CreateHabit($input: CreateHabitArgs!) {\n    myCreateHabit(input: $input) {\n      id\n      title\n      description\n      activityType {\n        id\n        name\n        color\n      }\n      priority\n      estimatedLength\n      frequencyCount\n      frequencyUnit\n    }\n  }\n": types.CreateHabitDocument,
    "\n  mutation UpdateHabit($input: UpdateHabitArgs!) {\n    myUpdateHabit(input: $input) {\n      id\n      title\n      description\n      activityType {\n        id\n        name\n        color\n      }\n      priority\n      estimatedLength\n      frequencyCount\n      frequencyUnit\n    }\n  }\n": types.UpdateHabitDocument,
    "\n  mutation UpdateHabitEstimatedLength($input: UpdateHabitArgs!) {\n    myUpdateHabit(input: $input) {\n      id\n      estimatedLength\n    }\n  }\n": types.UpdateHabitEstimatedLengthDocument,
    "\n  fragment Habit_HabitList on Habit {\n    id\n    title\n    description\n    priority\n    estimatedLength\n    activityType {\n      id\n      name\n      color\n    }\n    frequencyCount\n    frequencyUnit\n    createdAt\n  }\n": types.Habit_HabitListFragmentDoc,
    "\n  mutation CreateTimeBlock($input: CreateTimeBlockArgs!) {\n    myCreateTimeBlock(input: $input) {\n      id\n      activityType {\n        id\n        name\n        color\n      }\n      daysOfWeek\n      startTime\n      endTime\n    }\n  }\n": types.CreateTimeBlockDocument,
    "\n  mutation UpdateTimeBlock($input: UpdateTimeBlockArgs!) {\n    myUpdateTimeBlock(input: $input) {\n      id\n      activityType {\n        id\n        name\n        color\n      }\n      daysOfWeek\n      startTime\n      endTime\n    }\n  }\n": types.UpdateTimeBlockDocument,
    "\n  fragment TimeBlock_TimeBlockList on TimeBlock {\n    id\n    activityType {\n      id\n      name\n      color\n    }\n    daysOfWeek\n    startTime\n    endTime\n    createdAt\n  }\n": types.TimeBlock_TimeBlockListFragmentDoc,
    "\n  mutation CreateTodo($input: CreateTodoArgs!) {\n    myCreateTodo(input: $input) {\n      id\n      title\n      description\n      activityType {\n        id\n        name\n        color\n      }\n      priority\n      estimatedLength\n      scheduledAt\n      completedAt\n    }\n  }\n": types.CreateTodoDocument,
    "\n  mutation UpdateTodo($input: UpdateTodoArgs!) {\n    myUpdateTodo(input: $input) {\n      id\n      title\n      description\n      activityType {\n        id\n        name\n        color\n      }\n      priority\n      estimatedLength\n      scheduledAt\n      completedAt\n    }\n  }\n": types.UpdateTodoDocument,
    "\n  mutation CompleteTodoFromForm($id: ID!) {\n    myCompleteTodo(id: $id) {\n      id\n      completedAt\n    }\n  }\n": types.CompleteTodoFromFormDocument,
    "\n  mutation CompleteTodo($id: ID!) {\n    myCompleteTodo(id: $id) {\n      id\n      completedAt\n    }\n  }\n": types.CompleteTodoDocument,
    "\n  mutation UpdateTodoEstimatedLength($input: UpdateTodoArgs!) {\n    myUpdateTodo(input: $input) {\n      id\n      estimatedLength\n    }\n  }\n": types.UpdateTodoEstimatedLengthDocument,
    "\n  fragment Todo_TodoList on Todo {\n    id\n    title\n    description\n    priority\n    estimatedLength\n    activityType {\n      id\n      name\n      color\n    }\n    scheduledAt\n    completedAt\n    createdAt\n  }\n": types.Todo_TodoListFragmentDoc,
    "\n  query GetMyActivityTypes {\n    myActivityTypes {\n      ...ActivityType_ActivityTypeList\n    }\n  }\n": types.GetMyActivityTypesDocument,
    "\n  query GetCalendarData {\n    myTimeBlocks {\n      id\n      ...TimeBlock_CalendarView\n    }\n  }\n": types.GetCalendarDataDocument,
    "\n  query MySchedule($weekStart: String, $timezone: String) {\n    mySchedule(weekStart: $weekStart, timezone: $timezone) {\n      id\n      ...ScheduledItem_CalendarView\n      ...ScheduledItem_ScheduleView\n    }\n  }\n": types.MyScheduleDocument,
    "\n  mutation UpdateProfile($timezone: String!) {\n    myUpdateProfile(timezone: $timezone)\n  }\n": types.UpdateProfileDocument,
    "\n  query GetMyHabitsForDetail($id:String!) {\n    habit(where: {id: {eq: $id} }) {\n      ...Habit_HabitList\n    }\n  }\n": types.GetMyHabitsForDetailDocument,
    "\n  query GetMyHabits {\n    myHabits {\n      ...Habit_HabitList\n    }\n  }\n": types.GetMyHabitsDocument,
    "\n  query GetMyTimeBlocksV2 {\n    myTimeBlocks {\n      ...TimeBlock_TimeBlockList\n    }\n  }\n": types.GetMyTimeBlocksV2Document,
    "\n  query GetMyTodosV2 {\n    myTodos {\n      ...Todo_TodoList\n    }\n  }\n": types.GetMyTodosV2Document,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateActivityType($input: CreateActivityTypeArgs!) {\n    myCreateActivityType(input: $input) {\n      id\n      name\n      color\n    }\n  }\n"): (typeof documents)["\n  mutation CreateActivityType($input: CreateActivityTypeArgs!) {\n    myCreateActivityType(input: $input) {\n      id\n      name\n      color\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateActivityType($input: UpdateActivityTypeArgs!) {\n    myUpdateActivityType(input: $input) {\n      id\n      name\n      color\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateActivityType($input: UpdateActivityTypeArgs!) {\n    myUpdateActivityType(input: $input) {\n      id\n      name\n      color\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteActivityType($id: ID!) {\n    myDeleteActivityType(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteActivityType($id: ID!) {\n    myDeleteActivityType(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ActivityType_ActivityTypeList on ActivityType {\n    id\n    name\n    color\n  }\n"): (typeof documents)["\n  fragment ActivityType_ActivityTypeList on ActivityType {\n    id\n    name\n    color\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetActivityTypesForSelect {\n    myActivityTypes {\n      id\n      name\n      color\n    }\n  }\n"): (typeof documents)["\n  query GetActivityTypesForSelect {\n    myActivityTypes {\n      id\n      name\n      color\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment TimeBlock_CalendarView on TimeBlock {\n    id\n    daysOfWeek\n    startTime\n    endTime\n    activityType {\n      id\n      name\n      color\n    }\n  }\n\n  fragment ScheduledItem_CalendarView on ScheduledItem {\n    kind\n    id\n    title\n    isScheduled\n    isOverdue\n    scheduledStart\n    scheduledEnd\n    completedAt\n    activityType {\n      id\n      name\n      color\n    }\n  }\n"): (typeof documents)["\n  fragment TimeBlock_CalendarView on TimeBlock {\n    id\n    daysOfWeek\n    startTime\n    endTime\n    activityType {\n      id\n      name\n      color\n    }\n  }\n\n  fragment ScheduledItem_CalendarView on ScheduledItem {\n    kind\n    id\n    title\n    isScheduled\n    isOverdue\n    scheduledStart\n    scheduledEnd\n    completedAt\n    activityType {\n      id\n      name\n      color\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation PinTodo($input: UpdateTodoArgs!) {\n    myUpdateTodo(input: $input) { id scheduledAt isPinnedSchedule }\n  }\n"): (typeof documents)["\n  mutation PinTodo($input: UpdateTodoArgs!) {\n    myUpdateTodo(input: $input) { id scheduledAt isPinnedSchedule }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ScheduledItem_ScheduleView on ScheduledItem {\n    kind\n    id\n    title\n    priority\n    estimatedLength\n    isScheduled\n    scheduledStart\n    scheduledEnd\n    activityType {\n      id\n      name\n      color\n    }\n  }\n"): (typeof documents)["\n  fragment ScheduledItem_ScheduleView on ScheduledItem {\n    kind\n    id\n    title\n    priority\n    estimatedLength\n    isScheduled\n    scheduledStart\n    scheduledEnd\n    activityType {\n      id\n      name\n      color\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CompleteHabitFromSchedule($input: CompleteHabitArgs!) {\n    myCompleteHabit(input: $input) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation CompleteHabitFromSchedule($input: CompleteHabitArgs!) {\n    myCompleteHabit(input: $input) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetHabitDetail($habitId: ID!, $periods: Int) {\n    myHabitDetail(habitId: $habitId, periods: $periods) {\n      habitId\n      title\n      description\n      priority\n      estimatedLength\n      frequencyCount\n      frequencyUnit\n      totalCompletions\n      allTimeRate\n      activityType {\n        id\n        name\n        color\n      }\n      periods {\n        label\n        periodStart\n        periodEnd\n        completions\n        target\n        rate\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetHabitDetail($habitId: ID!, $periods: Int) {\n    myHabitDetail(habitId: $habitId, periods: $periods) {\n      habitId\n      title\n      description\n      priority\n      estimatedLength\n      frequencyCount\n      frequencyUnit\n      totalCompletions\n      allTimeRate\n      activityType {\n        id\n        name\n        color\n      }\n      periods {\n        label\n        periodStart\n        periodEnd\n        completions\n        target\n        rate\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateHabit($input: CreateHabitArgs!) {\n    myCreateHabit(input: $input) {\n      id\n      title\n      description\n      activityType {\n        id\n        name\n        color\n      }\n      priority\n      estimatedLength\n      frequencyCount\n      frequencyUnit\n    }\n  }\n"): (typeof documents)["\n  mutation CreateHabit($input: CreateHabitArgs!) {\n    myCreateHabit(input: $input) {\n      id\n      title\n      description\n      activityType {\n        id\n        name\n        color\n      }\n      priority\n      estimatedLength\n      frequencyCount\n      frequencyUnit\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateHabit($input: UpdateHabitArgs!) {\n    myUpdateHabit(input: $input) {\n      id\n      title\n      description\n      activityType {\n        id\n        name\n        color\n      }\n      priority\n      estimatedLength\n      frequencyCount\n      frequencyUnit\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateHabit($input: UpdateHabitArgs!) {\n    myUpdateHabit(input: $input) {\n      id\n      title\n      description\n      activityType {\n        id\n        name\n        color\n      }\n      priority\n      estimatedLength\n      frequencyCount\n      frequencyUnit\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateHabitEstimatedLength($input: UpdateHabitArgs!) {\n    myUpdateHabit(input: $input) {\n      id\n      estimatedLength\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateHabitEstimatedLength($input: UpdateHabitArgs!) {\n    myUpdateHabit(input: $input) {\n      id\n      estimatedLength\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment Habit_HabitList on Habit {\n    id\n    title\n    description\n    priority\n    estimatedLength\n    activityType {\n      id\n      name\n      color\n    }\n    frequencyCount\n    frequencyUnit\n    createdAt\n  }\n"): (typeof documents)["\n  fragment Habit_HabitList on Habit {\n    id\n    title\n    description\n    priority\n    estimatedLength\n    activityType {\n      id\n      name\n      color\n    }\n    frequencyCount\n    frequencyUnit\n    createdAt\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateTimeBlock($input: CreateTimeBlockArgs!) {\n    myCreateTimeBlock(input: $input) {\n      id\n      activityType {\n        id\n        name\n        color\n      }\n      daysOfWeek\n      startTime\n      endTime\n    }\n  }\n"): (typeof documents)["\n  mutation CreateTimeBlock($input: CreateTimeBlockArgs!) {\n    myCreateTimeBlock(input: $input) {\n      id\n      activityType {\n        id\n        name\n        color\n      }\n      daysOfWeek\n      startTime\n      endTime\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateTimeBlock($input: UpdateTimeBlockArgs!) {\n    myUpdateTimeBlock(input: $input) {\n      id\n      activityType {\n        id\n        name\n        color\n      }\n      daysOfWeek\n      startTime\n      endTime\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateTimeBlock($input: UpdateTimeBlockArgs!) {\n    myUpdateTimeBlock(input: $input) {\n      id\n      activityType {\n        id\n        name\n        color\n      }\n      daysOfWeek\n      startTime\n      endTime\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment TimeBlock_TimeBlockList on TimeBlock {\n    id\n    activityType {\n      id\n      name\n      color\n    }\n    daysOfWeek\n    startTime\n    endTime\n    createdAt\n  }\n"): (typeof documents)["\n  fragment TimeBlock_TimeBlockList on TimeBlock {\n    id\n    activityType {\n      id\n      name\n      color\n    }\n    daysOfWeek\n    startTime\n    endTime\n    createdAt\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateTodo($input: CreateTodoArgs!) {\n    myCreateTodo(input: $input) {\n      id\n      title\n      description\n      activityType {\n        id\n        name\n        color\n      }\n      priority\n      estimatedLength\n      scheduledAt\n      completedAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreateTodo($input: CreateTodoArgs!) {\n    myCreateTodo(input: $input) {\n      id\n      title\n      description\n      activityType {\n        id\n        name\n        color\n      }\n      priority\n      estimatedLength\n      scheduledAt\n      completedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateTodo($input: UpdateTodoArgs!) {\n    myUpdateTodo(input: $input) {\n      id\n      title\n      description\n      activityType {\n        id\n        name\n        color\n      }\n      priority\n      estimatedLength\n      scheduledAt\n      completedAt\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateTodo($input: UpdateTodoArgs!) {\n    myUpdateTodo(input: $input) {\n      id\n      title\n      description\n      activityType {\n        id\n        name\n        color\n      }\n      priority\n      estimatedLength\n      scheduledAt\n      completedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CompleteTodoFromForm($id: ID!) {\n    myCompleteTodo(id: $id) {\n      id\n      completedAt\n    }\n  }\n"): (typeof documents)["\n  mutation CompleteTodoFromForm($id: ID!) {\n    myCompleteTodo(id: $id) {\n      id\n      completedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CompleteTodo($id: ID!) {\n    myCompleteTodo(id: $id) {\n      id\n      completedAt\n    }\n  }\n"): (typeof documents)["\n  mutation CompleteTodo($id: ID!) {\n    myCompleteTodo(id: $id) {\n      id\n      completedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateTodoEstimatedLength($input: UpdateTodoArgs!) {\n    myUpdateTodo(input: $input) {\n      id\n      estimatedLength\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateTodoEstimatedLength($input: UpdateTodoArgs!) {\n    myUpdateTodo(input: $input) {\n      id\n      estimatedLength\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment Todo_TodoList on Todo {\n    id\n    title\n    description\n    priority\n    estimatedLength\n    activityType {\n      id\n      name\n      color\n    }\n    scheduledAt\n    completedAt\n    createdAt\n  }\n"): (typeof documents)["\n  fragment Todo_TodoList on Todo {\n    id\n    title\n    description\n    priority\n    estimatedLength\n    activityType {\n      id\n      name\n      color\n    }\n    scheduledAt\n    completedAt\n    createdAt\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMyActivityTypes {\n    myActivityTypes {\n      ...ActivityType_ActivityTypeList\n    }\n  }\n"): (typeof documents)["\n  query GetMyActivityTypes {\n    myActivityTypes {\n      ...ActivityType_ActivityTypeList\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCalendarData {\n    myTimeBlocks {\n      id\n      ...TimeBlock_CalendarView\n    }\n  }\n"): (typeof documents)["\n  query GetCalendarData {\n    myTimeBlocks {\n      id\n      ...TimeBlock_CalendarView\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MySchedule($weekStart: String, $timezone: String) {\n    mySchedule(weekStart: $weekStart, timezone: $timezone) {\n      id\n      ...ScheduledItem_CalendarView\n      ...ScheduledItem_ScheduleView\n    }\n  }\n"): (typeof documents)["\n  query MySchedule($weekStart: String, $timezone: String) {\n    mySchedule(weekStart: $weekStart, timezone: $timezone) {\n      id\n      ...ScheduledItem_CalendarView\n      ...ScheduledItem_ScheduleView\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateProfile($timezone: String!) {\n    myUpdateProfile(timezone: $timezone)\n  }\n"): (typeof documents)["\n  mutation UpdateProfile($timezone: String!) {\n    myUpdateProfile(timezone: $timezone)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMyHabitsForDetail($id:String!) {\n    habit(where: {id: {eq: $id} }) {\n      ...Habit_HabitList\n    }\n  }\n"): (typeof documents)["\n  query GetMyHabitsForDetail($id:String!) {\n    habit(where: {id: {eq: $id} }) {\n      ...Habit_HabitList\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMyHabits {\n    myHabits {\n      ...Habit_HabitList\n    }\n  }\n"): (typeof documents)["\n  query GetMyHabits {\n    myHabits {\n      ...Habit_HabitList\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMyTimeBlocksV2 {\n    myTimeBlocks {\n      ...TimeBlock_TimeBlockList\n    }\n  }\n"): (typeof documents)["\n  query GetMyTimeBlocksV2 {\n    myTimeBlocks {\n      ...TimeBlock_TimeBlockList\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMyTodosV2 {\n    myTodos {\n      ...Todo_TodoList\n    }\n  }\n"): (typeof documents)["\n  query GetMyTodosV2 {\n    myTodos {\n      ...Todo_TodoList\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;