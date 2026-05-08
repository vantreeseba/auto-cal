import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { relations } from './relations.ts';
import * as schema from './schema.ts';

const databaseUrl = process.env.DATABASE_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsFolder = path.resolve(__dirname, '../drizzle');

// biome-ignore lint/suspicious/noExplicitAny: dual-backend Drizzle instance; both PGLite and postgres.js satisfy the same query interface
let db: any;

if (databaseUrl) {
  // Production: use real Postgres via postgres.js
  const { drizzle } = await import('drizzle-orm/postgres-js');
  const postgres = await import('postgres');
  const client = postgres.default(databaseUrl);
  // @ts-expect-error drizzle-orm 1.0-beta removed `schema` from DrizzlePgConfig types but it remains valid at runtime for relational queries
  db = drizzle({ client, schema, relations });

  // Run migrations
  const { migrate } = await import('drizzle-orm/postgres-js/migrator');
  await migrate(db, { migrationsFolder });
} else {
  // Development: use PGLite (embedded Postgres, zero setup)
  const dir = process.env.PGLITE_DATA_DIR;
  if (!dir) throw new Error('Set DATABASE_URL or PGLITE_DATA_DIR');

  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  const { migrate } = await import('drizzle-orm/pglite/migrator');

  const client = new PGlite(dir);
  await client.waitReady;
  // @ts-expect-error drizzle-orm 1.0-beta removed `schema` from DrizzlePgConfig types but it remains valid at runtime for relational queries
  db = drizzle({ client, schema, relations });

  await migrate(db, { migrationsFolder });
}

export { db };
export type DB = typeof db;

export { schema };
export * from './schema.ts';
