# Multi-stage build for Auto Cal
# Build context: the auto-cal/ directory (default)
#   docker build -t auto-cal .

# ── Stage 1: Build the React client ──────────────────────────────────────────
FROM node:22-alpine AS client-builder

WORKDIR /app

COPY package*.json ./
COPY packages/client/package*.json ./packages/client/

RUN npm install

COPY biome.json ./
COPY codegen.ts ./
COPY packages/client ./packages/client
WORKDIR /app/packages/client
RUN npm run build

# ── Stage 2: Install server production dependencies ───────────────────────────
FROM node:22-alpine AS server-builder

WORKDIR /app

COPY package*.json ./
COPY packages/db/package*.json ./packages/db/
COPY packages/server/package*.json ./packages/server/

RUN npm install --omit=dev

COPY packages/db ./packages/db
COPY packages/server ./packages/server
COPY drizzle.config.ts ./

# ── Stage 3: Final runtime image ──────────────────────────────────────────────
FROM node:22-alpine

WORKDIR /app

COPY --from=server-builder /app/node_modules ./node_modules
COPY --from=server-builder /app/packages ./packages
COPY --from=server-builder /app/package.json ./

COPY --from=client-builder /app/packages/client/dist ./packages/client/dist

COPY drizzle.config.ts ./
COPY biome.json ./

RUN mkdir -p /app/pgdata

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000
ENV PGLITE_DATA_DIR=/app/pgdata

CMD ["sh", "-c", "cd packages/db && node --experimental-strip-types src/migrator.ts && cd /app && node --experimental-strip-types packages/server/src/index.ts"]
