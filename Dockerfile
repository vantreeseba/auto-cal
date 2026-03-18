# Multi-stage build for Auto Cal
# Build context: the auto-cal/ directory (default)
#   docker build -t auto-cal .
#
# drizzle-graphql is a local sibling dependency referenced by an absolute host
# path in packages/server/package.json.  We vendor its pre-built dist into
# vendor/drizzle-graphql, place it at /app/drizzle-graphql inside the image,
# and patch the absolute path to file:///app/drizzle-graphql so npm can
# resolve it.  The /app placement lets Node.js walk up to /app/node_modules
# to resolve drizzle-graphql's peer dependencies.

# ── Stage 1: Build the React client ──────────────────────────────────────────
FROM node:22-alpine AS client-builder

WORKDIR /app

# Vendor drizzle-graphql under /app so peer dep resolution works
COPY vendor/drizzle-graphql ./drizzle-graphql

# Copy workspace manifests
COPY package*.json ./
COPY packages/client/package*.json ./packages/client/

# Patch absolute host path → in-image path
RUN sed -i \
      's|file://home/vantreeseba/code/vantreeseba/apps/drizzle-graphql|file:///app/drizzle-graphql|g' \
      package.json packages/*/package.json 2>/dev/null || true

# Install all workspace deps (devDeps needed for Vite client build)
RUN npm install

# Copy client source and build
COPY biome.json ./
COPY codegen.ts ./
COPY packages/client ./packages/client
WORKDIR /app/packages/client
RUN npm run build

# ── Stage 2: Install server production dependencies ───────────────────────────
FROM node:22-alpine AS server-builder

WORKDIR /app

# Vendor drizzle-graphql under /app for peer dep resolution
COPY vendor/drizzle-graphql ./drizzle-graphql

# Copy workspace manifests
COPY package*.json ./
COPY packages/db/package*.json ./packages/db/
COPY packages/server/package*.json ./packages/server/

# Patch absolute host path → in-image path, then install prod deps only
RUN sed -i \
      's|file://home/vantreeseba/code/vantreeseba/apps/drizzle-graphql|file:///app/drizzle-graphql|g' \
      package.json packages/*/package.json && \
    npm install --omit=dev

# Copy server and db source + drizzle config
COPY packages/db ./packages/db
COPY packages/server ./packages/server
COPY drizzle.config.ts ./

# ── Stage 3: Final runtime image ──────────────────────────────────────────────
FROM node:22-alpine

WORKDIR /app

# drizzle-graphql inside /app so peer deps resolve from /app/node_modules
COPY --from=server-builder /app/drizzle-graphql ./drizzle-graphql

# Production node_modules, source packages, and root manifest
COPY --from=server-builder /app/node_modules ./node_modules
COPY --from=server-builder /app/packages ./packages
COPY --from=server-builder /app/package.json ./

# Pre-built client static assets
COPY --from=client-builder /app/packages/client/dist ./packages/client/dist

# Config files required at runtime
COPY drizzle.config.ts ./
COPY biome.json ./

# Persistent PGLite data directory — mount a named volume here
RUN mkdir -p /app/pgdata

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000
ENV PGLITE_DATA_DIR=/app/pgdata

# Run DB migrations (cd into packages/db so ./drizzle/ resolves correctly),
# then start the GraphQL server from /app
CMD ["sh", "-c", "cd packages/db && node --experimental-strip-types src/migrator.ts && cd /app && node --experimental-strip-types packages/server/src/index.ts"]
