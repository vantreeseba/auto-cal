# Deployment

## Docker

Single-stage image — build must run **outside** Docker before `docker build`:

```bash
npm run build       # codegen + vite + tsc
docker build -t auto-cal .
```

The Dockerfile installs only production deps, then copies:
- `packages/server` — TypeScript source (run with `--experimental-strip-types`)
- `packages/db` — TypeScript source + migration files
- `packages/client/dist` — built static assets

Migrations run on container start before the server process — the Dockerfile `CMD` is:

```sh
cd packages/db && node --experimental-strip-types src/migrator.ts \
  && cd /app && node --experimental-strip-types packages/server/src/index.ts
```

`packages/db/src/migrator.ts` runs `drizzle-kit migrate` programmatically before the server boots.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default `4000`) |
| `DATABASE_URL` | Conditional | Postgres connection string (e.g. `postgresql://user:pass@host:5432/db`); when set, uses `postgres.js` driver |
| `PGLITE_DATA_DIR` | Conditional | Path to PGLite data directory; required when `DATABASE_URL` is not set |
| `NODE_ENV` | No | `production` / `development` |
| `DEMO_USER_ID` | No | Hard-coded demo user UUID for development; bypasses magic-link flow |

## Switching to Full Postgres

Set `DATABASE_URL` — the runtime automatically selects the `postgres.js` driver over PGLite. See `.env.example` and `docker-compose.yml` for both modes.

## PGLite (Local / Embedded)

Data is persisted to the volume at `/app/pgdata`. No separate database server is needed.
