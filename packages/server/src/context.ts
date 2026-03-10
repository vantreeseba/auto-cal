import type { DB } from '@auto-cal/db';

export interface Context {
  db: DB;
  userId?: string; // undefined = not authenticated
}
