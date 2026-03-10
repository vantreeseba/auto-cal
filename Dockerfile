# Multi-stage build for Auto Cal

# Stage 1: Build the client
FROM node:22-alpine AS client-builder

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY packages/client/package*.json ./packages/client/

# Install dependencies
RUN npm ci

# Copy client source
COPY packages/client ./packages/client
COPY biome.json ./

# Build client
WORKDIR /app/packages/client
RUN npm run build

# Stage 2: Prepare server
FROM node:22-alpine AS server-builder

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY packages/db/package*.json ./packages/db/
COPY packages/server/package*.json ./packages/server/

# Install dependencies
RUN npm ci --production

# Copy server and db source
COPY packages/db ./packages/db
COPY packages/server ./packages/server
COPY drizzle.config.ts ./

# Stage 3: Final runtime image
FROM node:22-alpine

WORKDIR /app

# Copy dependencies from builder
COPY --from=server-builder /app/node_modules ./node_modules
COPY --from=server-builder /app/packages ./packages
COPY --from=server-builder /app/package.json ./

# Copy built client
COPY --from=client-builder /app/packages/client/dist ./packages/client/dist

# Copy config files
COPY drizzle.config.ts ./
COPY biome.json ./

# Create data directory
RUN mkdir -p /app/pgdata

# Expose port
EXPOSE 4000

# Environment variables
ENV NODE_ENV=production
ENV PORT=4000
ENV PGLITE_DATA_DIR=/app/pgdata

# Run migrations and start server
CMD npm run db:migrate && node --experimental-strip-types packages/server/src/index.ts
