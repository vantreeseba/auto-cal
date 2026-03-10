import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from './schema.ts';

const DATA_DIR = process.env.PGLITE_DATA_DIR ?? './pgdata';

const client = new PGlite(DATA_DIR);
await client.waitReady;

export const db = drizzle(client, { schema });
export type DB = typeof db;
