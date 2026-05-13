import { eq } from 'drizzle-orm';
import {
  activityTypes,
  db,
  habits,
  timeBlocks,
  todoLists,
  todos,
  users,
} from './index.ts';

export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
export const DEMO_USER_EMAIL = 'demo@auto-cal.app';

export async function seedDemoUser(): Promise<void> {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.id, DEMO_USER_ID))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(users).values({
      id: DEMO_USER_ID,
      email: DEMO_USER_EMAIL,
    });
    console.log('Demo user created:', DEMO_USER_ID);
  }
}

export async function seedDemoData(): Promise<void> {
  if (process.env.NODE_ENV === 'production') return;

  await seedDemoUser();

  // Skip if data already exists
  const existingActivity = await db
    .select()
    .from(activityTypes)
    .where(eq(activityTypes.userId, DEMO_USER_ID))
    .limit(1);

  if (existingActivity.length > 0) {
    console.log('Demo data already exists, skipping seed.');
    return;
  }

  // Activity types
  const insertedTypes = (await db
    .insert(activityTypes)
    .values([
      { userId: DEMO_USER_ID, name: 'Work', color: '#6366f1' },
      { userId: DEMO_USER_ID, name: 'Exercise', color: '#22c55e' },
      { userId: DEMO_USER_ID, name: 'Learning', color: '#f59e0b' },
    ])
    .returning()) as Array<{ id: string; name: string; color: string }>;

  const work = insertedTypes.find((t) => t.name === 'Work');
  const exercise = insertedTypes.find((t) => t.name === 'Exercise');
  const learning = insertedTypes.find((t) => t.name === 'Learning');

  if (!work || !exercise || !learning) {
    throw new Error('Failed to insert activity types');
  }

  console.log('Activity types created.');

  // Todo lists — one per activity type for the demo
  const insertedLists = (await db
    .insert(todoLists)
    .values([
      {
        userId: DEMO_USER_ID,
        name: 'Work',
        description: 'Day-job tasks and deliverables',
        activityTypeId: work.id,
        defaultPriority: 50,
        defaultEstimatedLength: 60,
      },
      {
        userId: DEMO_USER_ID,
        name: 'Fitness',
        description: 'Exercise-related one-off todos',
        activityTypeId: exercise.id,
        defaultPriority: 30,
        defaultEstimatedLength: 30,
      },
      {
        userId: DEMO_USER_ID,
        name: 'Learning',
        description: 'Books, courses, and study tasks',
        activityTypeId: learning.id,
        defaultPriority: 40,
        defaultEstimatedLength: 60,
      },
    ])
    .returning()) as Array<{ id: string; name: string }>;

  const workList = insertedLists.find((l) => l.name === 'Work');
  const fitnessList = insertedLists.find((l) => l.name === 'Fitness');
  const learningList = insertedLists.find((l) => l.name === 'Learning');

  if (!workList || !fitnessList || !learningList) {
    throw new Error('Failed to insert todo lists');
  }

  console.log('Todo lists created.');

  // Time blocks (Mon-Fri = [1,2,3,4,5], weekdays)
  await db.insert(timeBlocks).values([
    {
      userId: DEMO_USER_ID,
      activityTypeId: work.id,
      daysOfWeek: [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime: '12:00',
    },
    {
      userId: DEMO_USER_ID,
      activityTypeId: work.id,
      daysOfWeek: [1, 2, 3, 4, 5],
      startTime: '13:00',
      endTime: '17:00',
    },
    {
      userId: DEMO_USER_ID,
      activityTypeId: exercise.id,
      daysOfWeek: [1, 3, 5],
      startTime: '07:00',
      endTime: '08:00',
    },
    {
      userId: DEMO_USER_ID,
      activityTypeId: learning.id,
      daysOfWeek: [2, 4],
      startTime: '18:00',
      endTime: '19:30',
    },
    {
      userId: DEMO_USER_ID,
      activityTypeId: learning.id,
      daysOfWeek: [6],
      startTime: '10:00',
      endTime: '12:00',
    },
    {
      userId: DEMO_USER_ID,
      activityTypeId: exercise.id,
      daysOfWeek: [6, 0],
      startTime: '08:00',
      endTime: '09:30',
    },
  ]);

  console.log('Time blocks created.');

  // Todos
  await db.insert(todos).values([
    {
      userId: DEMO_USER_ID,
      listId: workList.id,
      title: 'Write Q2 project proposal',
      description:
        'Outline goals, timeline, and resource requirements for the Q2 roadmap.',
      priority: 80,
      estimatedLength: 90,
    },
    {
      userId: DEMO_USER_ID,
      listId: workList.id,
      title: 'Review pull requests',
      description: 'Review and merge outstanding PRs from the team.',
      priority: 60,
      estimatedLength: 45,
    },
    {
      userId: DEMO_USER_ID,
      listId: workList.id,
      title: 'Update project documentation',
      priority: 40,
      estimatedLength: 60,
    },
    {
      userId: DEMO_USER_ID,
      listId: learningList.id,
      title: 'Complete TypeScript generics chapter',
      description:
        'Finish reading and take notes on generics from the TS handbook.',
      priority: 60,
      estimatedLength: 60,
    },
    {
      userId: DEMO_USER_ID,
      listId: fitnessList.id,
      title: 'Sign up for 5K run',
      description:
        'Register for the local spring 5K and add it to the calendar.',
      priority: 30,
      estimatedLength: 15,
    },
  ]);

  console.log('Todos created.');

  // Habits
  await db.insert(habits).values([
    {
      userId: DEMO_USER_ID,
      activityTypeId: exercise.id,
      title: 'Morning run',
      description: '30-minute easy run to start the day.',
      priority: 75,
      estimatedLength: 30,
      frequencyCount: 3,
      frequencyUnit: 'week',
    },
    {
      userId: DEMO_USER_ID,
      activityTypeId: learning.id,
      title: 'Read technical articles',
      description: 'Stay current with industry blogs and papers.',
      priority: 65,
      estimatedLength: 20,
      frequencyCount: 5,
      frequencyUnit: 'week',
    },
    {
      userId: DEMO_USER_ID,
      activityTypeId: work.id,
      title: 'Daily standup prep',
      description:
        "Review yesterday's work and plan today's tasks before standup.",
      priority: 90,
      estimatedLength: 10,
      frequencyCount: 5,
      frequencyUnit: 'week',
    },
  ]);

  console.log('Habits created.');
  console.log('Demo seed complete.');
}
