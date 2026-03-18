import { eq } from 'drizzle-orm';
import { db, users } from './index.ts';

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
