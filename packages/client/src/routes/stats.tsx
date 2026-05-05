import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RouteError } from '@/components/ui/route-error';
import { gql, useQuery } from '@apollo/client';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

const GET_MY_STATS = gql`
  query GetMyStats($startDate: String, $endDate: String) {
    myStats(startDate: $startDate, endDate: $endDate) {
      weightedScore
      habitScore
      todoScore
      habits {
        habitId
        title
        completionRate
        completions
        target
        frequencyUnit
        frequencyCount
      }
      todos {
        total
        completed
        overdue
        completionRate
      }
    }
  }
`;

type DateRangeKey = 'week' | 'two_weeks' | 'month' | 'three_months' | 'all';

const DATE_RANGES: Array<{ key: DateRangeKey; label: string; days: number | null }> = [
  { key: 'week', label: 'Last Week', days: 7 },
  { key: 'two_weeks', label: 'Last 2 Weeks', days: 14 },
  { key: 'month', label: 'Last Month', days: 30 },
  { key: 'three_months', label: 'Last 3 Months', days: 90 },
  { key: 'all', label: 'All Time', days: null },
];

function getDateRange(key: DateRangeKey): { startDate?: string; endDate: string } {
  const now = new Date();
  const endDate = now.toISOString();
  const range = DATE_RANGES.find((r) => r.key === key)!;
  if (range.days === null) return { endDate };
  const start = new Date(now.getTime() - range.days * 24 * 60 * 60 * 1000);
  return { startDate: start.toISOString(), endDate };
}

export const Route = createFileRoute('/stats')({
  component: StatsPage,
  errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
});

interface HabitSummary {
  habitId: string;
  title: string;
  completionRate: number;
  completions: number;
  target: number;
  frequencyUnit: string;
  frequencyCount: number;
}

interface TodoSummary {
  total: number;
  completed: number;
  overdue: number;
  completionRate: number;
}

interface StatsData {
  weightedScore: number;
  habitScore: number;
  todoScore: number;
  habits: HabitSummary[];
  todos: TodoSummary;
}

function ScoreRing({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(score, 1));
  const color = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="128" height="128" className="-rotate-90" aria-hidden>
        <circle
          cx="64" cy="64" r={radius}
          fill="none" stroke="currentColor" strokeWidth="10"
          className="text-muted"
        />
        <circle
          cx="64" cy="64" r={radius}
          fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span className="absolute text-3xl font-bold">{pct}%</span>
    </div>
  );
}

function HabitsSection({ habits, habitScore }: { habits: HabitSummary[]; habitScore: number }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Habits</span>
          <span className="text-muted-foreground font-normal text-sm">
            {Math.round(habitScore * 100)}% avg completion
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {habits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No habits yet.</p>
        ) : (
          <div className="space-y-4">
            {habits.map((h) => {
              const pct = Math.round(h.completionRate * 100);
              const met = h.completionRate >= 1.0;
              return (
                <div key={h.habitId} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{h.title}</span>
                    <span className={met ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: met ? '#22c55e' : '#94a3b8',
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {h.completions} completions · target: {h.frequencyCount}× per {h.frequencyUnit}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TodosSection({ todos, todoScore }: { todos: TodoSummary; todoScore: number }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Todos</span>
          <span className="text-muted-foreground font-normal text-sm">
            {Math.round(todoScore * 100)}% completion
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todos.total === 0 ? (
          <p className="text-sm text-muted-foreground">No todos due in this period.</p>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-8">
              <div>
                <p className="text-2xl font-bold">
                  {todos.completed}
                  <span className="text-muted-foreground text-base font-normal">
                    /{todos.total}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">completed</p>
              </div>
              {todos.overdue > 0 && (
                <div>
                  <p className="text-2xl font-bold text-destructive">{todos.overdue}</p>
                  <p className="text-xs text-muted-foreground">overdue</p>
                </div>
              )}
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${Math.round(todoScore * 100)}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatsPage() {
  const [range, setRange] = useState<DateRangeKey>('month');
  const { startDate, endDate } = getDateRange(range);

  const { data, loading, error } = useQuery(GET_MY_STATS, {
    variables: { startDate, endDate },
  });

  const stats: StatsData | undefined = data?.myStats;

  return (
    <div className="container mx-auto flex-1 overflow-y-auto px-4 py-6 space-y-6">
      <div className="flex gap-1 flex-wrap">
        {DATE_RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRange(r.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              range === r.key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-muted-foreground text-sm">Loading stats…</p>}
      {error && <p className="text-destructive text-sm">Error: {error.message}</p>}

      {stats && (
        <>
          <Card>
            <CardContent className="pt-6 flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
              <div className="flex flex-col items-center gap-2">
                <ScoreRing score={stats.weightedScore} />
                <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
              </div>
              <div className="flex gap-10 sm:flex-col sm:gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{Math.round(stats.habitScore * 100)}%</p>
                  <p className="text-xs text-muted-foreground">Habits (50%)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{Math.round(stats.todoScore * 100)}%</p>
                  <p className="text-xs text-muted-foreground">Todos (50%)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <HabitsSection habits={stats.habits} habitScore={stats.habitScore} />
          <TodosSection todos={stats.todos} todoScore={stats.todoScore} />
        </>
      )}
    </div>
  );
}
