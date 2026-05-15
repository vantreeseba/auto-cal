import { graphql } from '@/__generated__/index.js';
import { HabitList } from '@/components/domain/habit/HabitList';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'expo-router';

const GET_MY_HABITS = graphql(`
  query GetMyHabits {
    myHabits {
      ...Habit_HabitList
    }
  }
`);

export default function HabitsPage() {
  const router = useRouter();
  const { data } = useQuery(GET_MY_HABITS, {
    fetchPolicy: 'cache-and-network',
  });

  return (
    <div className="container mx-auto flex-1 overflow-y-auto px-4 py-6">
      <HabitList
        items={data?.myHabits ?? []}
        onSelect={(habit) => router.push(`/habits/${habit.id}`)}
      />
    </div>
  );
}
