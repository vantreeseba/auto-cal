import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '@auto-cal/db';
import { buildSchema } from '@vantreeseba/drizzle-graphql';
import {
  type GraphQLObjectType,
  type GraphQLSchema,
  printSchema,
} from 'graphql';
import { applyCustomResolvers } from './resolvers/index.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const generatedDir = join(__dirname, '../__generated__');
mkdirSync(generatedDir, { recursive: true });

console.log(Object.keys(db._.relations));

const { schema: drizzleSchema, entities } = buildSchema(db, {
  prefixes: { insert: 'create', update: 'update', delete: 'delete' },
  suffixes: { list: 's', single: '' },
  singularTypes: true,
});

// Block all auto-generated drizzle-graphql resolvers that aren't user-scoped.
// Only fields starting with "my" and the two public auth mutations are allowed.
const PUBLIC_MUTATIONS = new Set(['requestMagicLink', 'verifyMagicLink']);

function blockUnscopedResolvers(schema: GraphQLSchema): void {
  for (const typeName of ['Query', 'Mutation']) {
    const type = schema.getType(typeName) as GraphQLObjectType | undefined;
    if (!type) continue;
    for (const [fieldName, field] of Object.entries(type.getFields())) {
      const isAllowed =
        fieldName.startsWith('my') || PUBLIC_MUTATIONS.has(fieldName);
      if (!isAllowed) {
        field.resolve = () => {
          throw new Error(
            `Field "${fieldName}" is not available. Use the user-scoped resolvers instead.`,
          );
        };
      }
    }
  }
}

export const schema = applyCustomResolvers(drizzleSchema);
blockUnscopedResolvers(schema);

writeFileSync(join(generatedDir, 'schema.graphql'), printSchema(schema));

export { entities };
