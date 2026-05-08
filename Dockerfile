FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY packages/server/package*.json ./packages/server/
COPY packages/db/package*.json ./packages/db/

RUN npm install --omit=dev

COPY packages/server ./packages/server
COPY packages/db ./packages/db
COPY packages/client/dist ./packages/client/dist

RUN mkdir -p /app/pgdata

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000
ENV PGLITE_DATA_DIR=/app/pgdata

CMD ["sh", "-c", "cd packages/db && node --experimental-strip-types src/migrator.ts && cd /app && node --experimental-strip-types packages/server/src/index.ts"]
