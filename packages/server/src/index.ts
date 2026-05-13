import fs from 'node:fs';
import path from 'node:path';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { db } from '@auto-cal/db';
import { apiKeys } from '@auto-cal/db/schema';
import { seedDemoData, seedDemoUser } from '@auto-cal/db/seed';
import cors from 'cors';
import { eq } from 'drizzle-orm';
import express from 'express';
import { hashApiKey, isApiKey } from './api-keys.ts';
import { verifyToken } from './auth.ts';
import { createLoaders } from './context.ts';
import type { Context } from './context.ts';
import { icalHandler } from './ical-route.ts';
import { schema } from './schema/index.ts';

const app = express();

const server = new ApolloServer<Context>({ schema });

await server.start();
await seedDemoUser();
if (process.env.NODE_ENV !== 'production') {
  await seedDemoData();
}

const clientDist = path.resolve(process.cwd(), 'packages/client/dist');
const clientDistExists = fs.existsSync(clientDist);

if (clientDistExists) {
  app.use(express.static(clientDist));
}

app.use(
  '/graphql',
  cors<cors.CorsRequest>(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }: { req: express.Request }): Promise<Context> => {
      const authHeader = req.headers.authorization;
      const rawToken = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : undefined;

      const loaders = createLoaders(db);

      if (!rawToken) return { db, loaders };

      // Try JWT verification first
      const payload = await verifyToken(rawToken);
      if (payload?.sub) return { db, userId: payload.sub, loaders };

      // Try API key auth
      if (isApiKey(rawToken)) {
        const hash = hashApiKey(rawToken);
        const now = new Date();
        const key = await db.query.apiKeys.findFirst({
          where: {
            keyHash: hash,
            revokedAt: { isNull: true },
          },
        });
        if (
          key &&
          (key.expiresAt === null ||
            key.expiresAt === undefined ||
            key.expiresAt > now)
        ) {
          // Fire-and-forget lastUsedAt update
          db.update(apiKeys)
            .set({ lastUsedAt: now })
            .where(eq(apiKeys.id, key.id))
            .catch(console.error);
          return {
            db,
            userId: key.userId,
            apiKey: { id: key.id, scopes: key.scopes },
            loaders,
          };
        }
      }

      // Fall back to raw UUID for backwards-compat with dev/seed
      if (/^[0-9a-f-]{36}$/i.test(rawToken))
        return { db, userId: rawToken, loaders };

      return { db, loaders };
    },
  }),
);

app.get('/ical', icalHandler);

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
