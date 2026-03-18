import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { gql, useQuery } from '@apollo/client';
import { Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { ActivityTypeForm } from './components/ActivityTypeForm';
import { HabitForm } from './components/HabitForm';
import { TimeBlockForm } from './components/TimeBlockForm';
import { TodoForm } from './components/TodoForm';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ActivityType {
  id: string;
  name: string;
  color: string;
}

interface Todo {
  id: string;
  title: string;
  description?: string | null;
  priority: number;
  estimatedLength: number;
  activityTypeId?: string | null;
  scheduledAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

interface Habit {
  id: string;
  title: string;
  description?: string | null;
  priority: number;
  estimatedLength: number;
  activityTypeId?: string | null;
  frequencyCount: number;
  frequencyUnit: string;
  createdAt: string;
}

interface TimeBlock {
  id: string;
  activityTypeId?: string | null;
  daysOfWeek: number | number[];
  startTime: string;
  endTime: string;
  createdAt: string;
}

// ─── GraphQL Operations ─────────────────────────────────────────────────────

const GET_MY_ACTIVITY_TYPES = gql`
  query GetMyActivityTypes {
    myActivityTypes {
      id
      name
      color
    }
  }
`;

const GET_MY_TODOS = gql`
  query GetMyTodos {
    myTodos {
      id
      title
      description
      priority
      estimatedLength
      activityTypeId
      scheduledAt
      completedAt
      createdAt
    }
  }
`;

const GET_MY_HABITS = gql`
  query GetMyHabits {
    myHabits {
      id
      title
      description
      priority
      estimatedLength
      activityTypeId
      frequencyCount
      frequencyUnit
      createdAt
    }
  }
`;

const GET_MY_TIME_BLOCKS = gql`
  query GetMyTimeBlocks {
    myTimeBlocks {
      id
      activityTypeId
      daysOfWeek
      startTime
      endTime
      createdAt
    }
  }
`;

// ─── Constants ──────────────────────────────────────────────────────────────

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

// ─── Component ──────────────────────────────────────────────────────────────

function App() {
  const [activeTab, setActiveTab] = useState('todos');

  const [todoFormOpen, setTodoFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const [habitFormOpen, setHabitFormOpen] = useState(false);
  const [timeBlockFormOpen, setTimeBlockFormOpen] = useState(false);

  const [activityTypeFormOpen, setActivityTypeFormOpen] = useState(false);
  const [editingActivityType, setEditingActivityType] =
    useState<ActivityType | null>(null);

  const {
    data: activityTypesData,
    loading: activityTypesLoading,
    error: activityTypesError,
  } = useQuery<{ myActivityTypes: ActivityType[] }>(GET_MY_ACTIVITY_TYPES);

  const {
    data: todosData,
    loading: todosLoading,
    error: todosError,
  } = useQuery<{ myTodos: Todo[] }>(GET_MY_TODOS);

  const {
    data: habitsData,
    loading: habitsLoading,
    error: habitsError,
  } = useQuery<{ myHabits: Habit[] }>(GET_MY_HABITS);

  const {
    data: timeBlocksData,
    loading: timeBlocksLoading,
    error: timeBlocksError,
  } = useQuery<{ myTimeBlocks: TimeBlock[] }>(GET_MY_TIME_BLOCKS);

  const activityTypeMap = new Map<string, ActivityType>(
    (activityTypesData?.myActivityTypes ?? []).map((at) => [at.id, at]),
  );

  function openCreateTodo() {
    setEditingTodo(null);
    setTodoFormOpen(true);
  }

  function openEditTodo(todo: Todo) {
    setEditingTodo(todo);
    setTodoFormOpen(true);
  }

  function handleTodoFormOpenChange(open: boolean) {
    setTodoFormOpen(open);
    if (!open) setEditingTodo(null);
  }

  function handleActivityTypeFormOpenChange(open: boolean) {
    setActivityTypeFormOpen(open);
    if (!open) setEditingActivityType(null);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold">Auto Cal</h1>
          <p className="text-muted-foreground">
            Smart todo and habit scheduling
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="habits">Habits</TabsTrigger>
            <TabsTrigger value="timeblocks">Time Blocks</TabsTrigger>
            <TabsTrigger value="activity-types">Activity Types</TabsTrigger>
          </TabsList>

          {/* ── Todos ───────────────────────────────────────────────────── */}
          <TabsContent value="todos" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Todos</CardTitle>
                    <CardDescription>
                      Single-time tasks scheduled in your time blocks
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={openCreateTodo}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Todo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {todosLoading && <p>Loading todos...</p>}
                {todosError && (
                  <p className="text-destructive">
                    Error loading todos: {todosError.message}
                  </p>
                )}
                {todosData?.myTodos.length === 0 && (
                  <p className="text-muted-foreground">
                    No todos yet. Create your first one!
                  </p>
                )}
                <div className="space-y-2">
                  {todosData?.myTodos.map((todo) => {
                    const actType = todo.activityTypeId
                      ? activityTypeMap.get(todo.activityTypeId)
                      : undefined;
                    return (
                      <Card key={todo.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {todo.title}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2">
                                {actType && (
                                  <span className="flex items-center gap-1">
                                    <span
                                      className="inline-block h-3 w-3 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: actType.color }}
                                    />
                                    {actType.name}
                                    {' • '}
                                  </span>
                                )}
                                {todo.estimatedLength} min • Priority:{' '}
                                {todo.priority}
                              </CardDescription>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditTodo(todo)}
                              aria-label={`Edit ${todo.title}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        {todo.description && (
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              {todo.description}
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Habits ──────────────────────────────────────────────────── */}
          <TabsContent value="habits" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Habits</CardTitle>
                    <CardDescription>
                      Recurring tasks scheduled regularly
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setHabitFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Habit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {habitsLoading && <p>Loading habits...</p>}
                {habitsError && (
                  <p className="text-destructive">
                    Error loading habits: {habitsError.message}
                  </p>
                )}
                {habitsData?.myHabits.length === 0 && (
                  <p className="text-muted-foreground">
                    No habits yet. Create your first one!
                  </p>
                )}
                <div className="space-y-2">
                  {habitsData?.myHabits.map((habit) => {
                    const actType = habit.activityTypeId
                      ? activityTypeMap.get(habit.activityTypeId)
                      : undefined;
                    return (
                      <Card key={habit.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {habit.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            {actType && (
                              <span className="flex items-center gap-1">
                                <span
                                  className="inline-block h-3 w-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: actType.color }}
                                />
                                {actType.name}
                                {' • '}
                              </span>
                            )}
                            {habit.estimatedLength} min • {habit.frequencyCount}
                            x per {habit.frequencyUnit} • Priority:{' '}
                            {habit.priority}
                          </CardDescription>
                        </CardHeader>
                        {habit.description && (
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              {habit.description}
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Time Blocks ─────────────────────────────────────────────── */}
          <TabsContent value="timeblocks" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Time Blocks</CardTitle>
                    <CardDescription>
                      Designated time periods for different activity types
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setTimeBlockFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Time Block
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {timeBlocksLoading && <p>Loading time blocks...</p>}
                {timeBlocksError && (
                  <p className="text-destructive">
                    Error loading time blocks: {timeBlocksError.message}
                  </p>
                )}
                {timeBlocksData?.myTimeBlocks.length === 0 && (
                  <p className="text-muted-foreground">
                    No time blocks yet. Create your first one!
                  </p>
                )}
                <div className="space-y-2">
                  {timeBlocksData?.myTimeBlocks.map((block) => {
                    const actType = block.activityTypeId
                      ? activityTypeMap.get(block.activityTypeId)
                      : undefined;
                    const daysArray = Array.isArray(block.daysOfWeek)
                      ? (block.daysOfWeek as number[])
                      : [block.daysOfWeek as number];
                    return (
                      <Card key={block.id}>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {actType ? (
                              <>
                                <span
                                  className="inline-block h-4 w-4 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: actType.color }}
                                />
                                {actType.name}
                              </>
                            ) : (
                              'Unassigned'
                            )}
                          </CardTitle>
                          <CardDescription>
                            {daysArray
                              .map((d) => DAY_NAMES[d] ?? `Day ${d}`)
                              .join(', ')}{' '}
                            • {block.startTime} – {block.endTime}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Activity Types ───────────────────────────────────────────── */}
          <TabsContent value="activity-types" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Activity Types</CardTitle>
                    <CardDescription>
                      Categories for your todos, habits, and time blocks
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingActivityType(null);
                      setActivityTypeFormOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Activity Type
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activityTypesLoading && <p>Loading activity types...</p>}
                {activityTypesError && (
                  <p className="text-destructive">
                    Error loading activity types: {activityTypesError.message}
                  </p>
                )}
                {activityTypesData?.myActivityTypes.length === 0 && (
                  <p className="text-muted-foreground">
                    No activity types yet. Create your first one!
                  </p>
                )}
                <div className="space-y-2">
                  {activityTypesData?.myActivityTypes.map((actType) => (
                    <div
                      key={actType.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-5 w-5 rounded-full border border-border flex-shrink-0"
                          style={{ backgroundColor: actType.color }}
                        />
                        <span className="font-medium">{actType.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingActivityType(actType);
                          setActivityTypeFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <TodoForm
        {...(editingTodo !== null ? { todo: editingTodo } : {})}
        open={todoFormOpen}
        onOpenChange={handleTodoFormOpenChange}
      />
      <HabitForm open={habitFormOpen} onOpenChange={setHabitFormOpen} />
      <TimeBlockForm
        open={timeBlockFormOpen}
        onOpenChange={setTimeBlockFormOpen}
      />
      <ActivityTypeForm
        {...(editingActivityType !== null
          ? { activityType: editingActivityType }
          : {})}
        open={activityTypeFormOpen}
        onOpenChange={handleActivityTypeFormOpenChange}
      />
    </div>
  );
}

export default App;
