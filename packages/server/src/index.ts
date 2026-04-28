import fs from 'node:fs';
import path from 'node:path';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { db } from '@auto-cal/db';
import { seedDemoUser } from '@auto-cal/db/seed';
import cors from 'cors';
import express from 'express';
import { verifyToken } from './auth.ts';
import type { Context } from './context.ts';
import { schema } from './schema/index.ts';

const app = express();

const server = new ApolloServer<Context>({ schema });

await server.start();
await seedDemoUser();

const clientDist = path.resolve(process.cwd(), 'packages/client/dist');
const clientDistExists = fs.existsSync(clientDist);

if (clientDistExists) {
  app.use(express.static(clientDist));
}

app.use(
  '/graphql',
  cors<cors.CorsRequest>(),
  express.json(),
  // @ts-expect-error - apollo/server express types conflict with @types/express
  expressMiddleware(server, {
    context: async ({ req }: { req: express.Request }): Promise<Context> => {
      const authHeader = req.headers.authorization;
      const rawToken = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : undefined;

      if (!rawToken) return { db };

      // Try JWT verification first
      const payload = await verifyToken(rawToken);
      if (payload?.sub) return { db, userId: payload.sub };

      // Fall back to raw UUID for backwards-compat with dev/seed
      if (/^[0-9a-f-]{36}$/i.test(rawToken)) return { db, userId: rawToken };

      return { db };
    },
  }),
);

if (clientDistExists) {
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const PORT = Number(process.env.PORT ?? 4000);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ready at http://0.0.0.0:${PORT}/graphql`);
  if (clientDistExists) {
    console.log(`Serving client from ${clientDist}`);
  }
});
