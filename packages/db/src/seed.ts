import { eq } from 'drizzle-orm';
import { db, users } from './index.ts';
import { activityTypes, habits, timeBlocks, todos } from './schema.ts';

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
  const existing = await db
    .select()
    .from(activityTypes)
    .where(eq(activityTypes.userId, DEMO_USER_ID))
    .limit(1);

  if (existing.length > 0) {
    console.log('Demo data already exists, skipping seed.');
    return;
  }

  // Insert activity types
  const insertedActivityTypes = await db
    .insert(activityTypes)
    .values([
      { userId: DEMO_USER_ID, name: 'Work', color: '#6366f1' },
      { userId: DEMO_USER_ID, name: 'Exercise', color: '#22c55e' },
      { userId: DEMO_USER_ID, name: 'Learning', color: '#f59e0b' },
    ])
    .returning();

  const workType = insertedActivityTypes.find((t) => t.name === 'Work');
  const exerciseType = insertedActivityTypes.find((t) => t.name === 'Exercise');
  const learningType = insertedActivityTypes.find((t) => t.name === 'Learning');

  if (!workType || !exerciseType || !learningType) {
    throw new Error('Failed to insert activity types');
  }

  // Insert time blocks
  await db.insert(timeBlocks).values([
    {
      userId: DEMO_USER_ID,
      activityTypeId: workType.id,
      daysOfWeek: [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime: '12:00',
    },
    {
      userId: DEMO_USER_ID,
      activityTypeId: workType.id,
      daysOfWeek: [1, 2, 3, 4, 5],
      startTime: '14:00',
      endTime: '17:00',
    },
    {
      userId: DEMO_USER_ID,
      activityTypeId: exerciseType.id,
      daysOfWeek: [1, 3, 5],
      startTime: '07:00',
      endTime: '08:00',
    },
    {
      userId: DEMO_USER_ID,
      activityTypeId: exerciseType.id,
      daysOfWeek: [6],
      startTime: '08:00',
      endTime: '09:00',
    },
    {
      userId: DEMO_USER_ID,
      activityTypeId: learningType.id,
      daysOfWeek: [2, 4],
      startTime: '18:00',
      endTime: '20:00',
    },
    {
      userId: DEMO_USER_ID,
      activityTypeId: learningType.id,
      daysOfWeek: [6],
      startTime: '10:00',
      endTime: '12:00',
    },
  ]);

  // Insert habits
  await db.insert(habits).values([
    {
      userId: DEMO_USER_ID,
      title: 'Daily standup',
      activityTypeId: workType.id,
      priority: 90,
      estimatedLength: 15,
      frequencyCount: 5,
      frequencyUnit: 'week',
    },
    {
      userId: DEMO_USER_ID,
      title: 'Evening walk',
      activityTypeId: exerciseType.id,
      priority: 75,
      estimatedLength: 30,
      frequencyCount: 3,
      frequencyUnit: 'week',
    },
    {
      userId: DEMO_USER_ID,
      title: 'Read technical articles',
      activityTypeId: learningType.id,
      priority: 65,
      estimatedLength: 45,
      frequencyCount: 3,
      frequencyUnit: 'week',
    },
  ]);

  // Insert todos
  await db.insert(todos).values([
    {
      userId: DEMO_USER_ID,
      title: 'Write project proposal',
      activityTypeId: workType.id,
      priority: 80,
      estimatedLength: 90,
    },
    {
      userId: DEMO_USER_ID,
      title: 'Review pull requests',
      activityTypeId: workType.id,
      priority: 60,
      estimatedLength: 30,
    },
    {
      userId: DEMO_USER_ID,
      title: 'Morning run',
      activityTypeId: exerciseType.id,
      priority: 70,
      estimatedLength: 45,
    },
    {
      userId: DEMO_USER_ID,
      title: 'Read TypeScript docs',
      activityTypeId: learningType.id,
      priority: 50,
      estimatedLength: 60,
    },
    {
      userId: DEMO_USER_ID,
      title: 'Set up CI pipeline',
      activityTypeId: workType.id,
      priority: 40,
      estimatedLength: 120,
    },
  ]);

  console.log('Demo data seeded successfully.');
}
