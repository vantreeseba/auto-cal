import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import { db } from '@auto-cal/db';
import { schema } from './schema/index.ts';
import type { Context } from './context.ts';

const app = express();

const server = new ApolloServer<Context>({ schema });

await server.start();

app.use(
  '/graphql',
  cors<cors.CorsRequest>(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }): Promise<Context> => {
      // For now, we'll use a simple demo user ID
      // In production, this would verify JWT from Authorization header
      const authHeader = req.headers.authorization;
      const userId = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : undefined;

      return { db, userId };
    },
  }),
);

const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
});
