import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '@auto-cal/db';
import { buildSchema } from 'drizzle-graphql';
import { printSchema } from 'graphql';
import { applyCustomResolvers } from './resolvers.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const generatedDir = join(__dirname, '../__generated__');
mkdirSync(generatedDir, { recursive: true });

const { schema: drizzleSchema, entities } = buildSchema(db, {
  prefixes: { insert: 'create', update: 'update', delete: 'delete' },
  suffixes: { list: 's', single: '' },
});

export const schema = applyCustomResolvers(drizzleSchema);

writeFileSync(join(generatedDir, 'schema.graphql'), printSchema(schema));

export { entities };
