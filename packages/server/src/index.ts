import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { db } from '@auto-cal/db';
import { seedDemoUser } from '@auto-cal/db/seed';
import cors from 'cors';
import express from 'express';
import type { Context } from './context.ts';
import { schema } from './schema/index.ts';

const app = express();

const server = new ApolloServer<Context>({ schema });

await server.start();
await seedDemoUser();

app.use(
  '/graphql',
  cors<cors.CorsRequest>(),
  express.json(),
  // @ts-expect-error - apollo/server express types conflict with @types/express
  expressMiddleware(server, {
    context: async ({ req }: { req: express.Request }): Promise<Context> => {
      const authHeader = req.headers.authorization;
      const userId = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : undefined;

      if (userId) return { db, userId };
      return { db };
    },
  }),
);

const PORT = Number(process.env.PORT ?? 4000);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ready at http://0.0.0.0:${PORT}/graphql`);
});
