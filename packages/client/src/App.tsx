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
import { Plus } from 'lucide-react';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import type {
  GetMyHabitsQuery,
  GetMyTimeBlocksQuery,
  GetMyTodosQuery,
} from './__generated__/graphql';
import { HabitForm } from './components/HabitForm';
import { TimeBlockForm } from './components/TimeBlockForm';
import { TodoForm } from './components/TodoForm';

const GET_MY_TODOS = gql`
  query GetMyTodos {
    myTodos {
      id
      title
      description
      priority
      estimatedLength
      activityType
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
      activityType
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
      activityType
      daysOfWeek
      startTime
      endTime
      createdAt
    }
  }
`;

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

function App() {
  const [activeTab, setActiveTab] = useState('todos');

  const [todoFormOpen, setTodoFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<
    GetMyTodosQuery['myTodos'][number] | null
  >(null);

  const [habitFormOpen, setHabitFormOpen] = useState(false);
  const [timeBlockFormOpen, setTimeBlockFormOpen] = useState(false);

  const {
    data: todosData,
    loading: todosLoading,
    error: todosError,
  } = useQuery(GET_MY_TODOS);

  const {
    data: habitsData,
    loading: habitsLoading,
    error: habitsError,
  } = useQuery(GET_MY_HABITS);

  const {
    data: timeBlocksData,
    loading: timeBlocksLoading,
    error: timeBlocksError,
  } = useQuery(GET_MY_TIME_BLOCKS);

  function openCreateTodo() {
    setEditingTodo(null);
    setTodoFormOpen(true);
  }

  function openEditTodo(todo: GetMyTodosQuery['myTodos'][number]) {
    setEditingTodo(todo);
    setTodoFormOpen(true);
  }

  function handleTodoFormOpenChange(open: boolean) {
    setTodoFormOpen(open);
    if (!open) setEditingTodo(null);
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="habits">Habits</TabsTrigger>
            <TabsTrigger value="timeblocks">Time Blocks</TabsTrigger>
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
                  {todosData?.myTodos.map(
                    (todo: GetMyTodosQuery['myTodos'][number]) => (
                      <Card key={todo.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {todo.title}
                              </CardTitle>
                              <CardDescription>
                                {todo.activityType} • {todo.estimatedLength} min
                                • Priority: {todo.priority}
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
                    ),
                  )}
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
                  {habitsData?.myHabits.map(
                    (habit: GetMyHabitsQuery['myHabits'][number]) => (
                      <Card key={habit.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {habit.title}
                          </CardTitle>
                          <CardDescription>
                            {habit.activityType} • {habit.estimatedLength} min •{' '}
                            {habit.frequencyCount}x per {habit.frequencyUnit} •
                            Priority: {habit.priority}
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
                    ),
                  )}
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
                  {timeBlocksData?.myTimeBlocks.map(
                    (block: GetMyTimeBlocksQuery['myTimeBlocks'][number]) => (
                      <Card key={block.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {block.activityType.charAt(0).toUpperCase() +
                              block.activityType.slice(1)}
                          </CardTitle>
                          <CardDescription>
                            {(block.daysOfWeek as unknown as number[])
                              .map((d: number) => DAY_NAMES[d] ?? `Day ${d}`)
                              .join(', ')}{' '}
                            • {block.startTime} – {block.endTime}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ),
                  )}
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
    </div>
  );
}

export default App;
