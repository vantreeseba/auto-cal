import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from './schema.ts';

const dir = process.env.PGLITE_DATA_DIR;
if (!dir) throw new Error('PGLITE_DATA_DIR environment variable is required');

const client = new PGlite(dir);
await client.waitReady;

export const db = drizzle({ client, schema });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsFolder = path.resolve(__dirname, '../drizzle');

await migrate(db, { migrationsFolder });

export type DB = typeof db;

export { schema };
export * from './schema.ts';
