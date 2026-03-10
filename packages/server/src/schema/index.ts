import { buildSchema } from 'drizzle-graphql';
import { db } from '@auto-cal/db';
import { applyCustomResolvers } from './resolvers.ts';

const drizzleSchema = buildSchema(db);

export const schema = applyCustomResolvers(drizzleSchema);
