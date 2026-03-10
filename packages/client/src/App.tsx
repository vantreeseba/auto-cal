import { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
      dayOfWeek
      startTime
      endTime
      createdAt
    }
  }
`;

function App() {
  const [activeTab, setActiveTab] = useState('todos');

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

          <TabsContent value="todos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Todos</CardTitle>
                <CardDescription>
                  Single-time tasks scheduled in your time blocks
                </CardDescription>
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
                  {todosData?.myTodos.map((todo: any) => (
                    <Card key={todo.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{todo.title}</CardTitle>
                        <CardDescription>
                          {todo.activityType} • {todo.estimatedLength} min •
                          Priority: {todo.priority}
                        </CardDescription>
                      </CardHeader>
                      {todo.description && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {todo.description}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="habits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Habits</CardTitle>
                <CardDescription>
                  Recurring tasks scheduled regularly
                </CardDescription>
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
                  {habitsData?.myHabits.map((habit: any) => (
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeblocks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Time Blocks</CardTitle>
                <CardDescription>
                  Designated time periods for different activity types
                </CardDescription>
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
                  {timeBlocksData?.myTimeBlocks.map((block: any) => (
                    <Card key={block.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {block.activityType}
                        </CardTitle>
                        <CardDescription>
                          Day {block.dayOfWeek} • {block.startTime} -{' '}
                          {block.endTime}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
