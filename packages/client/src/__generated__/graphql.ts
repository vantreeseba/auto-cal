/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any; }
};

export type ActivityType = {
  __typename?: 'ActivityType';
  color: Scalars['String']['output'];
  /** DateTime */
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  /** DateTime */
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export type ActivityTypeFilters = {
  OR?: InputMaybe<Array<ActivityTypeFiltersOr>>;
  color?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  id?: InputMaybe<IdFilter>;
  name?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
  userId?: InputMaybe<IdFilter>;
};

export type ActivityTypeFiltersOr = {
  color?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  id?: InputMaybe<IdFilter>;
  name?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
  userId?: InputMaybe<IdFilter>;
};

export type ActivityTypeOrderBy = {
  color?: InputMaybe<InnerOrder>;
  createdAt?: InputMaybe<InnerOrder>;
  id?: InputMaybe<InnerOrder>;
  name?: InputMaybe<InnerOrder>;
  updatedAt?: InputMaybe<InnerOrder>;
  userId?: InputMaybe<InnerOrder>;
};

export type ActivityTypeStats = {
  __typename?: 'ActivityTypeStats';
  activityTypeId: Scalars['String']['output'];
  activityTypeName: Scalars['String']['output'];
  completedTodos: Scalars['Int']['output'];
  totalHabits: Scalars['Int']['output'];
  totalTodos: Scalars['Int']['output'];
};

export type BooleanFilter = {
  OR?: InputMaybe<Array<BooleanFilterOr>>;
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Boolean']['input']>;
  gte?: InputMaybe<Scalars['Boolean']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Boolean']['input']>;
  lte?: InputMaybe<Scalars['Boolean']['input']>;
  ne?: InputMaybe<Scalars['Boolean']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type BooleanFilterOr = {
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Boolean']['input']>;
  gte?: InputMaybe<Scalars['Boolean']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Boolean']['input']>;
  lte?: InputMaybe<Scalars['Boolean']['input']>;
  ne?: InputMaybe<Scalars['Boolean']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CompleteHabitArgs = {
  habitId: Scalars['ID']['input'];
  scheduledAt?: InputMaybe<Scalars['String']['input']>;
};

export type CreateActivityTypeArgs = {
  color?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateActivityTypeInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  /** DateTime */
  createdAt?: InputMaybe<Scalars['DateTime']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  /** DateTime */
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
  userId: Scalars['String']['input'];
};

export type CreateHabitArgs = {
  activityTypeId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedLength?: InputMaybe<Scalars['Int']['input']>;
  frequencyCount: Scalars['Int']['input'];
  frequencyUnit: Scalars['String']['input'];
  priority?: InputMaybe<Scalars['Int']['input']>;
  title: Scalars['String']['input'];
};

export type CreateHabitCompletionInput = {
  /** DateTime */
  completedAt?: InputMaybe<Scalars['DateTime']['input']>;
  /** DateTime */
  createdAt?: InputMaybe<Scalars['DateTime']['input']>;
  habitId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  /** DateTime */
  scheduledAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type CreateHabitInput = {
  activityTypeId?: InputMaybe<Scalars['String']['input']>;
  /** DateTime */
  createdAt?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedLength: Scalars['Int']['input'];
  frequencyCount: Scalars['Int']['input'];
  frequencyUnit: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  title: Scalars['String']['input'];
  /** DateTime */
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
  userId: Scalars['String']['input'];
};

export type CreateTimeBlockArgs = {
  activityTypeId?: InputMaybe<Scalars['ID']['input']>;
  daysOfWeek: Array<Scalars['Int']['input']>;
  endTime: Scalars['String']['input'];
  priority?: InputMaybe<Scalars['Int']['input']>;
  startTime: Scalars['String']['input'];
};

export type CreateTimeBlockInput = {
  activityTypeId?: InputMaybe<Scalars['String']['input']>;
  /** DateTime */
  createdAt?: InputMaybe<Scalars['DateTime']['input']>;
  daysOfWeek: Array<Scalars['Int']['input']>;
  endTime: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  startTime: Scalars['String']['input'];
  /** DateTime */
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
  userId: Scalars['String']['input'];
};

export type CreateTodoArgs = {
  activityTypeId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedLength?: InputMaybe<Scalars['Int']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  scheduledAt?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreateTodoInput = {
  activityTypeId?: InputMaybe<Scalars['String']['input']>;
  /** DateTime */
  completedAt?: InputMaybe<Scalars['DateTime']['input']>;
  /** DateTime */
  createdAt?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedLength: Scalars['Int']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  manuallyScheduled?: InputMaybe<Scalars['Boolean']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  /** DateTime */
  scheduledAt?: InputMaybe<Scalars['DateTime']['input']>;
  title: Scalars['String']['input'];
  /** DateTime */
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
  userId: Scalars['String']['input'];
};

export type CreateUserInput = {
  /** DateTime */
  createdAt?: InputMaybe<Scalars['DateTime']['input']>;
  email: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
  /** DateTime */
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type DateTimeFilter = {
  OR?: InputMaybe<Array<DateTimeFilterOr>>;
  /** DateTime */
  eq?: InputMaybe<Scalars['DateTime']['input']>;
  /** DateTime */
  gt?: InputMaybe<Scalars['DateTime']['input']>;
  /** DateTime */
  gte?: InputMaybe<Scalars['DateTime']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<DateTime> */
  inArray?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** DateTime */
  lt?: InputMaybe<Scalars['DateTime']['input']>;
  /** DateTime */
  lte?: InputMaybe<Scalars['DateTime']['input']>;
  /** DateTime */
  ne?: InputMaybe<Scalars['DateTime']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<DateTime> */
  notInArray?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type DateTimeFilterOr = {
  /** DateTime */
  eq?: InputMaybe<Scalars['DateTime']['input']>;
  /** DateTime */
  gt?: InputMaybe<Scalars['DateTime']['input']>;
  /** DateTime */
  gte?: InputMaybe<Scalars['DateTime']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<DateTime> */
  inArray?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** DateTime */
  lt?: InputMaybe<Scalars['DateTime']['input']>;
  /** DateTime */
  lte?: InputMaybe<Scalars['DateTime']['input']>;
  /** DateTime */
  ne?: InputMaybe<Scalars['DateTime']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<DateTime> */
  notInArray?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type FloatArrayFilter = {
  OR?: InputMaybe<Array<FloatArrayFilterOr>>;
  eq?: InputMaybe<Array<Scalars['Int']['input']>>;
  gt?: InputMaybe<Array<Scalars['Int']['input']>>;
  gte?: InputMaybe<Array<Scalars['Int']['input']>>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Array<Scalars['Int']['input']>>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Array<Scalars['Int']['input']>>;
  lte?: InputMaybe<Array<Scalars['Int']['input']>>;
  ne?: InputMaybe<Array<Scalars['Int']['input']>>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Array<Scalars['Int']['input']>>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type FloatArrayFilterOr = {
  eq?: InputMaybe<Array<Scalars['Int']['input']>>;
  gt?: InputMaybe<Array<Scalars['Int']['input']>>;
  gte?: InputMaybe<Array<Scalars['Int']['input']>>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Array<Scalars['Int']['input']>>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Array<Scalars['Int']['input']>>;
  lte?: InputMaybe<Array<Scalars['Int']['input']>>;
  ne?: InputMaybe<Array<Scalars['Int']['input']>>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Array<Scalars['Int']['input']>>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type Habit = {
  __typename?: 'Habit';
  activityType?: Maybe<ActivityType>;
  activityTypeId?: Maybe<Scalars['String']['output']>;
  /** DateTime */
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  estimatedLength: Scalars['Int']['output'];
  frequencyCount: Scalars['Int']['output'];
  frequencyUnit: Scalars['String']['output'];
  id: Scalars['String']['output'];
  priority: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  /** DateTime */
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export type HabitCompletion = {
  __typename?: 'HabitCompletion';
  /** DateTime */
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  /** DateTime */
  createdAt: Scalars['DateTime']['output'];
  habitId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  /** DateTime */
  scheduledAt?: Maybe<Scalars['DateTime']['output']>;
};

export type HabitCompletionFilters = {
  OR?: InputMaybe<Array<HabitCompletionFiltersOr>>;
  completedAt?: InputMaybe<DateTimeFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  habitId?: InputMaybe<IdFilter>;
  id?: InputMaybe<IdFilter>;
  scheduledAt?: InputMaybe<DateTimeFilter>;
};

export type HabitCompletionFiltersOr = {
  completedAt?: InputMaybe<DateTimeFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  habitId?: InputMaybe<IdFilter>;
  id?: InputMaybe<IdFilter>;
  scheduledAt?: InputMaybe<DateTimeFilter>;
};

export type HabitCompletionOrderBy = {
  completedAt?: InputMaybe<InnerOrder>;
  createdAt?: InputMaybe<InnerOrder>;
  habitId?: InputMaybe<InnerOrder>;
  id?: InputMaybe<InnerOrder>;
  scheduledAt?: InputMaybe<InnerOrder>;
};

export type HabitDetail = {
  __typename?: 'HabitDetail';
  activityType?: Maybe<ActivityType>;
  allTimeRate: Scalars['Float']['output'];
  description?: Maybe<Scalars['String']['output']>;
  estimatedLength: Scalars['Int']['output'];
  frequencyCount: Scalars['Int']['output'];
  frequencyUnit: Scalars['String']['output'];
  habitId: Scalars['ID']['output'];
  periods: Array<HabitPeriod>;
  priority: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  totalCompletions: Scalars['Int']['output'];
};

export type HabitFilters = {
  OR?: InputMaybe<Array<HabitFiltersOr>>;
  activityTypeId?: InputMaybe<IdFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  description?: InputMaybe<StringFilter>;
  estimatedLength?: InputMaybe<StringFilter>;
  frequencyCount?: InputMaybe<StringFilter>;
  frequencyUnit?: InputMaybe<StringFilter>;
  id?: InputMaybe<IdFilter>;
  priority?: InputMaybe<StringFilter>;
  title?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
  userId?: InputMaybe<IdFilter>;
};

export type HabitFiltersOr = {
  activityTypeId?: InputMaybe<IdFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  description?: InputMaybe<StringFilter>;
  estimatedLength?: InputMaybe<StringFilter>;
  frequencyCount?: InputMaybe<StringFilter>;
  frequencyUnit?: InputMaybe<StringFilter>;
  id?: InputMaybe<IdFilter>;
  priority?: InputMaybe<StringFilter>;
  title?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
  userId?: InputMaybe<IdFilter>;
};

export type HabitOrderBy = {
  activityTypeId?: InputMaybe<InnerOrder>;
  createdAt?: InputMaybe<InnerOrder>;
  description?: InputMaybe<InnerOrder>;
  estimatedLength?: InputMaybe<InnerOrder>;
  frequencyCount?: InputMaybe<InnerOrder>;
  frequencyUnit?: InputMaybe<InnerOrder>;
  id?: InputMaybe<InnerOrder>;
  priority?: InputMaybe<InnerOrder>;
  title?: InputMaybe<InnerOrder>;
  updatedAt?: InputMaybe<InnerOrder>;
  userId?: InputMaybe<InnerOrder>;
};

export type HabitPeriod = {
  __typename?: 'HabitPeriod';
  completions: Scalars['Int']['output'];
  label: Scalars['String']['output'];
  periodEnd: Scalars['String']['output'];
  periodStart: Scalars['String']['output'];
  rate: Scalars['Float']['output'];
  target: Scalars['Int']['output'];
};

export type HabitStats = {
  __typename?: 'HabitStats';
  completionRate: Scalars['Float']['output'];
  habitId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  totalCompletions: Scalars['Int']['output'];
};

export type IdFilter = {
  OR?: InputMaybe<Array<IdFilterOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type IdFilterOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type InnerOrder = {
  direction: OrderDirection;
  /** Priority of current field */
  priority: Scalars['Int']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createActivityType?: Maybe<ActivityType>;
  createActivityTypes: Array<ActivityType>;
  createHabit?: Maybe<Habit>;
  createHabitCompletion?: Maybe<HabitCompletion>;
  createHabitCompletions: Array<HabitCompletion>;
  createHabits: Array<Habit>;
  createTimeBlock?: Maybe<TimeBlock>;
  createTimeBlocks: Array<TimeBlock>;
  createTodo?: Maybe<Todo>;
  createTodos: Array<Todo>;
  createUser?: Maybe<User>;
  createUsers: Array<User>;
  deleteActivityTypes: Array<ActivityType>;
  deleteHabitCompletions: Array<HabitCompletion>;
  deleteHabits: Array<Habit>;
  deleteTimeBlocks: Array<TimeBlock>;
  deleteTodos: Array<Todo>;
  deleteUsers: Array<User>;
  myCompleteHabit: HabitCompletion;
  myCompleteTodo: Todo;
  myCreateActivityType: ActivityType;
  myCreateHabit: Habit;
  myCreateTimeBlock: TimeBlock;
  myCreateTodo: Todo;
  myDeleteActivityType: Scalars['Boolean']['output'];
  myDeleteHabit: Scalars['Boolean']['output'];
  myDeleteTimeBlock: Scalars['Boolean']['output'];
  myDeleteTodo: Scalars['Boolean']['output'];
  myReschedule: Scalars['Boolean']['output'];
  myUpdateActivityType: ActivityType;
  myUpdateHabit: Habit;
  myUpdateProfile: Scalars['Boolean']['output'];
  myUpdateTimeBlock: TimeBlock;
  myUpdateTodo: Todo;
  requestMagicLink: RequestMagicLinkResult;
  updateActivityTypes: Array<ActivityType>;
  updateHabitCompletions: Array<HabitCompletion>;
  updateHabits: Array<Habit>;
  updateTimeBlocks: Array<TimeBlock>;
  updateTodos: Array<Todo>;
  updateUsers: Array<User>;
  verifyMagicLink: VerifyMagicLinkResult;
};


export type MutationCreateActivityTypeArgs = {
  values: CreateActivityTypeInput;
};


export type MutationCreateActivityTypesArgs = {
  values: Array<CreateActivityTypeInput>;
};


export type MutationCreateHabitArgs = {
  values: CreateHabitInput;
};


export type MutationCreateHabitCompletionArgs = {
  values: CreateHabitCompletionInput;
};


export type MutationCreateHabitCompletionsArgs = {
  values: Array<CreateHabitCompletionInput>;
};


export type MutationCreateHabitsArgs = {
  values: Array<CreateHabitInput>;
};


export type MutationCreateTimeBlockArgs = {
  values: CreateTimeBlockInput;
};


export type MutationCreateTimeBlocksArgs = {
  values: Array<CreateTimeBlockInput>;
};


export type MutationCreateTodoArgs = {
  values: CreateTodoInput;
};


export type MutationCreateTodosArgs = {
  values: Array<CreateTodoInput>;
};


export type MutationCreateUserArgs = {
  values: CreateUserInput;
};


export type MutationCreateUsersArgs = {
  values: Array<CreateUserInput>;
};


export type MutationDeleteActivityTypesArgs = {
  where?: InputMaybe<ActivityTypeFilters>;
};


export type MutationDeleteHabitCompletionsArgs = {
  where?: InputMaybe<HabitCompletionFilters>;
};


export type MutationDeleteHabitsArgs = {
  where?: InputMaybe<HabitFilters>;
};


export type MutationDeleteTimeBlocksArgs = {
  where?: InputMaybe<TimeBlockFilters>;
};


export type MutationDeleteTodosArgs = {
  where?: InputMaybe<TodoFilters>;
};


export type MutationDeleteUsersArgs = {
  where?: InputMaybe<UserFilters>;
};


export type MutationMyCompleteHabitArgs = {
  input: CompleteHabitArgs;
};


export type MutationMyCompleteTodoArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMyCreateActivityTypeArgs = {
  input: CreateActivityTypeArgs;
};


export type MutationMyCreateHabitArgs = {
  input: CreateHabitArgs;
};


export type MutationMyCreateTimeBlockArgs = {
  input: CreateTimeBlockArgs;
};


export type MutationMyCreateTodoArgs = {
  input: CreateTodoArgs;
};


export type MutationMyDeleteActivityTypeArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMyDeleteHabitArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMyDeleteTimeBlockArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMyDeleteTodoArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMyRescheduleArgs = {
  weekStart?: InputMaybe<Scalars['String']['input']>;
};


export type MutationMyUpdateActivityTypeArgs = {
  input: UpdateActivityTypeArgs;
};


export type MutationMyUpdateHabitArgs = {
  input: UpdateHabitArgs;
};


export type MutationMyUpdateProfileArgs = {
  timezone: Scalars['String']['input'];
};


export type MutationMyUpdateTimeBlockArgs = {
  input: UpdateTimeBlockArgs;
};


export type MutationMyUpdateTodoArgs = {
  input: UpdateTodoArgs;
};


export type MutationRequestMagicLinkArgs = {
  email: Scalars['String']['input'];
};


export type MutationUpdateActivityTypesArgs = {
  set: UpdateActivityTypeInput;
  where?: InputMaybe<ActivityTypeFilters>;
};


export type MutationUpdateHabitCompletionsArgs = {
  set: UpdateHabitCompletionInput;
  where?: InputMaybe<HabitCompletionFilters>;
};


export type MutationUpdateHabitsArgs = {
  set: UpdateHabitInput;
  where?: InputMaybe<HabitFilters>;
};


export type MutationUpdateTimeBlocksArgs = {
  set: UpdateTimeBlockInput;
  where?: InputMaybe<TimeBlockFilters>;
};


export type MutationUpdateTodosArgs = {
  set: UpdateTodoInput;
  where?: InputMaybe<TodoFilters>;
};


export type MutationUpdateUsersArgs = {
  set: UpdateUserInput;
  where?: InputMaybe<UserFilters>;
};


export type MutationVerifyMagicLinkArgs = {
  token: Scalars['String']['input'];
};

/** Order by direction */
export enum OrderDirection {
  /** Ascending order */
  Asc = 'asc',
  /** Descending order */
  Desc = 'desc'
}

export type Query = {
  __typename?: 'Query';
  activityType?: Maybe<ActivityType>;
  activityTypeStats: Array<ActivityTypeStats>;
  activityTypes: Array<ActivityType>;
  habit?: Maybe<Habit>;
  habitCompletion?: Maybe<HabitCompletion>;
  habitCompletions: Array<HabitCompletion>;
  habitStats: Array<HabitStats>;
  habits: Array<Habit>;
  myActivityTypes: Array<ActivityType>;
  myHabitDetail: HabitDetail;
  myHabits: Array<Habit>;
  mySchedule: Array<ScheduledItem>;
  myTimeBlocks: Array<TimeBlock>;
  myTodos: Array<Todo>;
  timeBlock?: Maybe<TimeBlock>;
  timeBlocks: Array<TimeBlock>;
  todo?: Maybe<Todo>;
  todos: Array<Todo>;
  user?: Maybe<User>;
  users: Array<User>;
};


export type QueryActivityTypeArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ActivityTypeOrderBy>;
  where?: InputMaybe<ActivityTypeFilters>;
};


export type QueryActivityTypeStatsArgs = {
  endDate?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryActivityTypesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ActivityTypeOrderBy>;
  where?: InputMaybe<ActivityTypeFilters>;
};


export type QueryHabitArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<HabitOrderBy>;
  where?: InputMaybe<HabitFilters>;
};


export type QueryHabitCompletionArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<HabitCompletionOrderBy>;
  where?: InputMaybe<HabitCompletionFilters>;
};


export type QueryHabitCompletionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<HabitCompletionOrderBy>;
  where?: InputMaybe<HabitCompletionFilters>;
};


export type QueryHabitStatsArgs = {
  endDate?: InputMaybe<Scalars['String']['input']>;
  habitId?: InputMaybe<Scalars['ID']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryHabitsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<HabitOrderBy>;
  where?: InputMaybe<HabitFilters>;
};


export type QueryMyHabitDetailArgs = {
  habitId: Scalars['ID']['input'];
  periods?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyHabitsArgs = {
  activityTypeId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryMyScheduleArgs = {
  timezone?: InputMaybe<Scalars['String']['input']>;
  weekStart?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMyTimeBlocksArgs = {
  activityTypeId?: InputMaybe<Scalars['ID']['input']>;
  containsDay?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyTodosArgs = {
  activityTypeId?: InputMaybe<Scalars['ID']['input']>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: InputMaybe<TodoOrderBy>;
};


export type QueryTimeBlockArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TimeBlockOrderBy>;
  where?: InputMaybe<TimeBlockFilters>;
};


export type QueryTimeBlocksArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TimeBlockOrderBy>;
  where?: InputMaybe<TimeBlockFilters>;
};


export type QueryTodoArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TodoOrderBy>;
  where?: InputMaybe<TodoFilters>;
};


export type QueryTodosArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TodoOrderBy>;
  where?: InputMaybe<TodoFilters>;
};


export type QueryUserArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<UserOrderBy>;
  where?: InputMaybe<UserFilters>;
};


export type QueryUsersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<UserOrderBy>;
  where?: InputMaybe<UserFilters>;
};

export type RequestMagicLinkResult = {
  __typename?: 'RequestMagicLinkResult';
  magicLink?: Maybe<Scalars['String']['output']>;
  ok: Scalars['Boolean']['output'];
};

export type ScheduledItem = {
  __typename?: 'ScheduledItem';
  activityType?: Maybe<ActivityType>;
  completedAt?: Maybe<Scalars['String']['output']>;
  estimatedLength: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isOverdue: Scalars['Boolean']['output'];
  isScheduled: Scalars['Boolean']['output'];
  kind: ScheduledItemKind;
  priority: Scalars['Int']['output'];
  scheduledEnd?: Maybe<Scalars['String']['output']>;
  scheduledStart?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export enum ScheduledItemKind {
  Habit = 'habit',
  Todo = 'todo'
}

export type StringFilter = {
  OR?: InputMaybe<Array<StringFilterOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StringFilterOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type TimeBlock = {
  __typename?: 'TimeBlock';
  activityType?: Maybe<ActivityType>;
  activityTypeId?: Maybe<Scalars['String']['output']>;
  /** DateTime */
  createdAt: Scalars['DateTime']['output'];
  daysOfWeek: Array<Scalars['Int']['output']>;
  endTime: Scalars['String']['output'];
  id: Scalars['String']['output'];
  priority: Scalars['Int']['output'];
  startTime: Scalars['String']['output'];
  /** DateTime */
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export type TimeBlockFilters = {
  OR?: InputMaybe<Array<TimeBlockFiltersOr>>;
  activityTypeId?: InputMaybe<IdFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  daysOfWeek?: InputMaybe<FloatArrayFilter>;
  endTime?: InputMaybe<StringFilter>;
  id?: InputMaybe<IdFilter>;
  startTime?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
  userId?: InputMaybe<IdFilter>;
};

export type TimeBlockFiltersOr = {
  activityTypeId?: InputMaybe<IdFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  daysOfWeek?: InputMaybe<FloatArrayFilter>;
  endTime?: InputMaybe<StringFilter>;
  id?: InputMaybe<IdFilter>;
  startTime?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
  userId?: InputMaybe<IdFilter>;
};

export type TimeBlockOrderBy = {
  activityTypeId?: InputMaybe<InnerOrder>;
  createdAt?: InputMaybe<InnerOrder>;
  daysOfWeek?: InputMaybe<InnerOrder>;
  endTime?: InputMaybe<InnerOrder>;
  id?: InputMaybe<InnerOrder>;
  startTime?: InputMaybe<InnerOrder>;
  updatedAt?: InputMaybe<InnerOrder>;
  userId?: InputMaybe<InnerOrder>;
};

export type Todo = {
  __typename?: 'Todo';
  activityType?: Maybe<ActivityType>;
  activityTypeId?: Maybe<Scalars['String']['output']>;
  /** DateTime */
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  /** DateTime */
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  estimatedLength: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  manuallyScheduled: Scalars['Boolean']['output'];
  priority: Scalars['Int']['output'];
  /** DateTime */
  scheduledAt?: Maybe<Scalars['DateTime']['output']>;
  title: Scalars['String']['output'];
  /** DateTime */
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export type TodoFilters = {
  OR?: InputMaybe<Array<TodoFiltersOr>>;
  activityTypeId?: InputMaybe<IdFilter>;
  completedAt?: InputMaybe<DateTimeFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  description?: InputMaybe<StringFilter>;
  estimatedLength?: InputMaybe<StringFilter>;
  id?: InputMaybe<IdFilter>;
  manuallyScheduled?: InputMaybe<BooleanFilter>;
  priority?: InputMaybe<StringFilter>;
  scheduledAt?: InputMaybe<DateTimeFilter>;
  title?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
  userId?: InputMaybe<IdFilter>;
};

export type TodoFiltersOr = {
  activityTypeId?: InputMaybe<IdFilter>;
  completedAt?: InputMaybe<DateTimeFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  description?: InputMaybe<StringFilter>;
  estimatedLength?: InputMaybe<StringFilter>;
  id?: InputMaybe<IdFilter>;
  manuallyScheduled?: InputMaybe<BooleanFilter>;
  priority?: InputMaybe<StringFilter>;
  scheduledAt?: InputMaybe<DateTimeFilter>;
  title?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
  userId?: InputMaybe<IdFilter>;
};

export type TodoOrderBy = {
  activityTypeId?: InputMaybe<InnerOrder>;
  completedAt?: InputMaybe<InnerOrder>;
  createdAt?: InputMaybe<InnerOrder>;
  description?: InputMaybe<InnerOrder>;
  estimatedLength?: InputMaybe<InnerOrder>;
  id?: InputMaybe<InnerOrder>;
  manuallyScheduled?: InputMaybe<InnerOrder>;
  priority?: InputMaybe<InnerOrder>;
  scheduledAt?: InputMaybe<InnerOrder>;
  title?: InputMaybe<InnerOrder>;
  updatedAt?: InputMaybe<InnerOrder>;
  userId?: InputMaybe<InnerOrder>;
};

export type UpdateActivityTypeArgs = {
  color?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateActivityTypeInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  /** DateTime */
  createdAt?: InputMaybe<Scalars['DateTime']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  /** DateTime */
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateHabitArgs = {
  activityTypeId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedLength?: InputMaybe<Scalars['Int']['input']>;
  frequencyCount?: InputMaybe<Scalars['Int']['input']>;
  frequencyUnit?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  priority?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateHabitCompletionInput = {
  /** DateTime */
  completedAt?: InputMaybe<Scalars['DateTime']['input']>;
  /** DateTime */
  createdAt?: InputMaybe<Scalars['DateTime']['input']>;
  habitId?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  /** DateTime */
  scheduledAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type UpdateHabitInput = {
  activityTypeId?: InputMaybe<Scalars['String']['input']>;
  /** DateTime */
  createdAt?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedLength?: InputMaybe<Scalars['Int']['input']>;
  frequencyCount?: InputMaybe<Scalars['Int']['input']>;
  frequencyUnit?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  /** DateTime */
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTimeBlockArgs = {
  activityTypeId?: InputMaybe<Scalars['ID']['input']>;
  daysOfWeek?: InputMaybe<Array<Scalars['Int']['input']>>;
  endTime?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  priority?: InputMaybe<Scalars['Int']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTimeBlockInput = {
  activityTypeId?: InputMaybe<Scalars['String']['input']>;
  /** DateTime */
  createdAt?: InputMaybe<Scalars['DateTime']['input']>;
  daysOfWeek?: InputMaybe<Array<Scalars['Int']['input']>>;
  endTime?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
  /** DateTime */
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTodoArgs = {
  activityTypeId?: InputMaybe<Scalars['ID']['input']>;
  completedAt?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedLength?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  manuallyScheduled?: InputMaybe<Scalars['Boolean']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  scheduledAt?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTodoInput = {
  activityTypeId?: InputMaybe<Scalars['String']['input']>;
  /** DateTime */
  completedAt?: InputMaybe<Scalars['DateTime']['input']>;
  /** DateTime */
  createdAt?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedLength?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  manuallyScheduled?: InputMaybe<Scalars['Boolean']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  /** DateTime */
  scheduledAt?: InputMaybe<Scalars['DateTime']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  /** DateTime */
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  /** DateTime */
  createdAt?: InputMaybe<Scalars['DateTime']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
  /** DateTime */
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type User = {
  __typename?: 'User';
  /** DateTime */
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  timezone: Scalars['String']['output'];
  /** DateTime */
  updatedAt: Scalars['DateTime']['output'];
};

export type UserFilters = {
  OR?: InputMaybe<Array<UserFiltersOr>>;
  createdAt?: InputMaybe<DateTimeFilter>;
  email?: InputMaybe<StringFilter>;
  id?: InputMaybe<IdFilter>;
  timezone?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type UserFiltersOr = {
  createdAt?: InputMaybe<DateTimeFilter>;
  email?: InputMaybe<StringFilter>;
  id?: InputMaybe<IdFilter>;
  timezone?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type UserOrderBy = {
  createdAt?: InputMaybe<InnerOrder>;
  email?: InputMaybe<InnerOrder>;
  id?: InputMaybe<InnerOrder>;
  timezone?: InputMaybe<InnerOrder>;
  updatedAt?: InputMaybe<InnerOrder>;
};

export type VerifyMagicLinkResult = {
  __typename?: 'VerifyMagicLinkResult';
  token: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export type CreateActivityTypeMutationVariables = Exact<{
  input: CreateActivityTypeArgs;
}>;


export type CreateActivityTypeMutation = { __typename?: 'Mutation', myCreateActivityType: { __typename?: 'ActivityType', id: string, name: string, color: string } };

export type UpdateActivityTypeMutationVariables = Exact<{
  input: UpdateActivityTypeArgs;
}>;


export type UpdateActivityTypeMutation = { __typename?: 'Mutation', myUpdateActivityType: { __typename?: 'ActivityType', id: string, name: string, color: string } };

export type DeleteActivityTypeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteActivityTypeMutation = { __typename?: 'Mutation', myDeleteActivityType: boolean };

export type ActivityType_ActivityTypeListFragment = { __typename?: 'ActivityType', id: string, name: string, color: string };

export type GetActivityTypesForSelectQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActivityTypesForSelectQuery = { __typename?: 'Query', myActivityTypes: Array<{ __typename?: 'ActivityType', id: string, name: string, color: string }> };

export type TimeBlock_CalendarViewFragment = { __typename?: 'TimeBlock', id: string, daysOfWeek: Array<number>, startTime: string, endTime: string, activityType?: { __typename?: 'ActivityType', id: string, name: string, color: string } | null };

export type ScheduledItem_CalendarViewFragment = { __typename?: 'ScheduledItem', kind: ScheduledItemKind, id: string, title: string, isScheduled: boolean, isOverdue: boolean, scheduledStart?: string | null, scheduledEnd?: string | null, completedAt?: string | null, activityType?: { __typename?: 'ActivityType', id: string, name: string, color: string } | null };

export type PinTodoMutationVariables = Exact<{
  input: UpdateTodoArgs;
}>;


export type PinTodoMutation = { __typename?: 'Mutation', myUpdateTodo: { __typename?: 'Todo', id: string, scheduledAt?: any | null, manuallyScheduled: boolean } };

export type CompleteHabitFromCalendarMutationVariables = Exact<{
  input: CompleteHabitArgs;
}>;


export type CompleteHabitFromCalendarMutation = { __typename?: 'Mutation', myCompleteHabit: { __typename?: 'HabitCompletion', id: string } };

export type ScheduledItem_ScheduleViewFragment = { __typename?: 'ScheduledItem', kind: ScheduledItemKind, id: string, title: string, priority: number, estimatedLength: number, isScheduled: boolean, scheduledStart?: string | null, scheduledEnd?: string | null, activityType?: { __typename?: 'ActivityType', id: string, name: string, color: string } | null };

export type CompleteHabitFromScheduleMutationVariables = Exact<{
  input: CompleteHabitArgs;
}>;


export type CompleteHabitFromScheduleMutation = { __typename?: 'Mutation', myCompleteHabit: { __typename?: 'HabitCompletion', id: string } };

export type GetHabitDetailQueryVariables = Exact<{
  habitId: Scalars['ID']['input'];
  periods?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetHabitDetailQuery = { __typename?: 'Query', myHabitDetail: { __typename?: 'HabitDetail', habitId: string, title: string, description?: string | null, priority: number, estimatedLength: number, frequencyCount: number, frequencyUnit: string, totalCompletions: number, allTimeRate: number, activityType?: { __typename?: 'ActivityType', id: string, name: string, color: string } | null, periods: Array<{ __typename?: 'HabitPeriod', label: string, periodStart: string, periodEnd: string, completions: number, target: number, rate: number }> } };

export type CreateHabitMutationVariables = Exact<{
  input: CreateHabitArgs;
}>;


export type CreateHabitMutation = { __typename?: 'Mutation', myCreateHabit: { __typename?: 'Habit', id: string, title: string, description?: string | null, priority: number, estimatedLength: number, frequencyCount: number, frequencyUnit: string, activityType?: { __typename?: 'ActivityType', id: string, name: string, color: string } | null } };

export type UpdateHabitMutationVariables = Exact<{
  input: UpdateHabitArgs;
}>;


export type UpdateHabitMutation = { __typename?: 'Mutation', myUpdateHabit: { __typename?: 'Habit', id: string, title: string, description?: string | null, priority: number, estimatedLength: number, frequencyCount: number, frequencyUnit: string, activityType?: { __typename?: 'ActivityType', id: string, name: string, color: string } | null } };

export type UpdateHabitEstimatedLengthMutationVariables = Exact<{
  input: UpdateHabitArgs;
}>;


export type UpdateHabitEstimatedLengthMutation = { __typename?: 'Mutation', myUpdateHabit: { __typename?: 'Habit', id: string, estimatedLength: number } };

export type Habit_HabitListFragment = { __typename?: 'Habit', id: string, title: string, description?: string | null, priority: number, estimatedLength: number, frequencyCount: number, frequencyUnit: string, createdAt: any, activityType?: { __typename?: 'ActivityType', id: string, name: string, color: string } | null };

export type CreateTimeBlockMutationVariables = Exact<{
  input: CreateTimeBlockArgs;
}>;


export type CreateTimeBlockMutation = { __typename?: 'Mutation', myCreateTimeBlock: { __typename?: 'TimeBlock', id: string, daysOfWeek: Array<number>, startTime: string, endTime: string, activityType?: { __typename?: 'ActivityType', id: string, name: string, color: string } | null } };

export type UpdateTimeBlockMutationVariables = Exact<{
  input: UpdateTimeBlockArgs;
}>;


export type UpdateTimeBlockMutation = { __typename?: 'Mutation', myUpdateTimeBlock: { __typename?: 'TimeBlock', id: string, daysOfWeek: Array<number>, startTime: string, endTime: string, activityType?: { __typename?: 'ActivityType', id: string, name: string, color: string } | null } };

export type TimeBlock_TimeBlockListFragment = { __typename?: 'TimeBlock', id: string, daysOfWeek: Array<number>, startTime: string, endTime: string, priority: number, createdAt: any, activityType?: { __typename?: 'ActivityType', id: string, name: string, color: string } | null };

export type CreateTodoMutationVariables = Exact<{
  input: CreateTodoArgs;
}>;


export type CreateTodoMutation = { __typename?: 'Mutation', myCreateTodo: { __typename?: 'Todo', id: string, title: string, description?: string | null, priority: number, estimatedLength: number, scheduledAt?: any | null, completedAt?: any | null, activityType?: { __typename?: 'ActivityType', id: string, name: string, color: string } | null } };

export type UpdateTodoMutationVariables = Exact<{
  input: UpdateTodoArgs;
}>;


export type UpdateTodoMutation = { __typename?: 'Mutation', myUpdateTodo: { __typename?: 'Todo', id: string, title: string, description?: string | null, priority: number, estimatedLength: number, scheduledAt?: any | null, completedAt?: any | null, activityType?: { __typename?: 'ActivityType', id: string, name: string, color: string } | null } };

export type CompleteTodoFromFormMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type CompleteTodoFromFormMutation = { __typename?: 'Mutation', myCompleteTodo: { __typename?: 'Todo', id: string, completedAt?: any | null } };

export type CompleteTodoMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type CompleteTodoMutation = { __typename?: 'Mutation', myCompleteTodo: { __typename?: 'Todo', id: string, completedAt?: any | null } };

export type UpdateTodoEstimatedLengthMutationVariables = Exact<{
  input: UpdateTodoArgs;
}>;


export type UpdateTodoEstimatedLengthMutation = { __typename?: 'Mutation', myUpdateTodo: { __typename?: 'Todo', id: string, estimatedLength: number } };

export type UncompleteTodoMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UncompleteTodoMutation = { __typename?: 'Mutation', myUpdateTodo: { __typename?: 'Todo', id: string, completedAt?: any | null } };

export type Todo_TodoListFragment = { __typename?: 'Todo', id: string, title: string, description?: string | null, priority: number, estimatedLength: number, scheduledAt?: any | null, completedAt?: any | null, createdAt: any, activityType?: { __typename?: 'ActivityType', id: string, name: string, color: string } | null };

export type GetMyActivityTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyActivityTypesQuery = { __typename?: 'Query', myActivityTypes: Array<{ __typename?: 'ActivityType', id: string, name: string, color: string }> };

export type GetActivityTypeStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActivityTypeStatsQuery = { __typename?: 'Query', activityTypeStats: Array<{ __typename?: 'ActivityTypeStats', activityTypeId: string, totalTodos: number, completedTodos: number, totalHabits: number }> };

export type GetCalendarDataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCalendarDataQuery = { __typename?: 'Query', myTimeBlocks: Array<{ __typename?: 'TimeBlock', id: string, daysOfWeek: Array<number>, startTime: string, endTime: string, activityType?: { __typename?: 'ActivityType', id: string, name: string, color: string } | null }> };

export type MyScheduleQueryVariables = Exact<{
  weekStart?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
}>;


export type MyScheduleQuery = { __typename?: 'Query', mySchedule: Array<{ __typename?: 'ScheduledItem', id: string, kind: ScheduledItemKind, title: string, isScheduled: boolean, isOverdue: boolean, scheduledStart?: string | null, scheduledEnd?: string | null, completedAt?: string | null, priority: number, estimatedLength: number, activityType?: { __typename?: 'ActivityType', id: string, name: string, color: string } | null }> };

export type UpdateProfileMutationVariables = Exact<{
  timezone: Scalars['String']['input'];
}>;


export type UpdateProfileMutation = { __typename?: 'Mutation', myUpdateProfile: boolean };

export type GetMyHabitsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyHabitsQuery = { __typename?: 'Query', myHabits: Array<{ __typename?: 'Habit', id: string, title: string, description?: string | null, priority: number, estimatedLength: number, frequencyCount: number, frequencyUnit: string, createdAt: any, activityType?: { __typename?: 'ActivityType', id: string, name: string, color: string } | null }> };

export type GetMyTimeBlocksQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyTimeBlocksQuery = { __typename?: 'Query', myTimeBlocks: Array<{ __typename?: 'TimeBlock', id: string, daysOfWeek: Array<number>, startTime: string, endTime: string, priority: number, createdAt: any, activityType?: { __typename?: 'ActivityType', id: string, name: string, color: string } | null }> };

export type GetMyTodosQueryVariables = Exact<{
  orderBy?: InputMaybe<TodoOrderBy>;
}>;


export type GetMyTodosQuery = { __typename?: 'Query', myTodos: Array<{ __typename?: 'Todo', id: string, title: string, description?: string | null, priority: number, estimatedLength: number, scheduledAt?: any | null, completedAt?: any | null, createdAt: any, activityType?: { __typename?: 'ActivityType', id: string, name: string, color: string } | null }> };

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
export const GetMyTimeBlocksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMyTimeBlocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myTimeBlocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TimeBlock_TimeBlockList"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TimeBlock_TimeBlockList"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TimeBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"activityType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"daysOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<GetMyTimeBlocksQuery, GetMyTimeBlocksQueryVariables>;
export const GetMyTodosDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMyTodos"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TodoOrderBy"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myTodos"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Todo_TodoList"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Todo_TodoList"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Todo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedLength"}},{"kind":"Field","name":{"kind":"Name","value":"activityType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"scheduledAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<GetMyTodosQuery, GetMyTodosQueryVariables>;