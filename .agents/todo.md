# Auto Cal — Feature Requests & Issues

> Status legend: `[ ]` open · `[x]` done · `[-]` in progress

---

## Recommended starting points

If you're unsure what to work on, these are the highest-leverage next steps:

1. **#7 — Weekly navigation on dashboard** — obvious UX gap any user will hit immediately (half day)
2. **#1 — Wire magic-link email delivery** — auth flow is otherwise live; this unblocks real users
3. **#3 — Finish UTC migration** — closes out the naive-datetime stopgap

---

## P0 — Core correctness / blocking

### #1 — Wire magic-link email delivery (auth is otherwise live)
**Status:** Magic-link + JWT auth is implemented end-to-end:
- `requestMagicLink` / `verifyMagicLink` mutations exist (`packages/server/src/schema/resolvers/auth.ts`)
- JWT sign/verify via `jose` in `packages/server/src/auth.ts`
- Login flow (`/login`) and verify route (`/auth/verify`) live in the client
- Apollo client attaches `Bearer <token>` from `localStorage.auth_token`; expired-auth errors redirect to `/login`
- Server context extracts JWT first, falls back to raw UUID for dev/seed (see #25)

**What's left:** The magic link is logged to the server console but no email is actually sent. In dev the `requestMagicLink` mutation also returns the link in the response; in prod the response has `magicLink: null`.

**Work:**
- Pick a provider (Resend or Nodemailer) and wire the send call in `requestMagicLink`'s resolver where the `// TODO: send email` comment lives
- Provider creds in env (`RESEND_API_KEY` or SMTP equivalent)
- Keep console logging as a fallback when no provider is configured

**Acceptance:** Requesting a magic link in production triggers an actual email; dev can still use console-logged links when no provider is set.

---

### #3 — Finish UTC migration ✓ Done
- `computeSchedule` now accepts a `timezone` parameter (IANA string) and emits UTC ISO strings (`Z` suffix) for `scheduledStart`/`scheduledEnd` using `fromZonedTime` from `date-fns-tz`.
- `mySchedule` passes `args.timezone` to `computeSchedule`; pinned todo and `completedAt` datetimes use `.toISOString()` directly.
- `ical-route.ts` passes `user.timezone` to `computeSchedule` and parses the result with `new Date(...)`.
- `CalendarView` and `ScheduleView` use `new Date(utcString)` which parses correctly; react-big-calendar renders in browser local time.

---

## P1 — High-value features

### #23 — Force reschedule escape hatch
**Problem:** Once a todo has been auto-scheduled, the scheduler preserves its `scheduledAt` on subsequent runs. There is currently no way for the user to explicitly evict a placed todo and let the scheduler re-place it.  
**Work:**
- Option A: add a `force: Boolean` flag to the `myReschedule` mutation — when true, clears `scheduledAt` on all (or selected) todos before running writeback
- Option B: expose a `myUnscheduleTodo(id: ID!)` mutation that sets `scheduledAt = null`, then let the next writeback pick it up

**Acceptance:** User can trigger a re-schedule of a todo that is already placed in a future slot.

---

### #7 — Weekly/daily navigation on the dashboard
**Problem:** The dashboard always shows the current week with no way to browse forward or backward.  
**Work:**
- Add prev/next week controls to `CalendarView` and `ScheduleView`
- Pass the selected `weekStart` to the `mySchedule` query
- Persist the selected week in the URL (`?week=2026-04-27`) using TanStack Router search params

**Acceptance:** User can navigate to past and future weeks; the URL is shareable.

---

### #8 — Notifications (browser push + in-app)
**Problem:** There's no alerting when a scheduled task is about to start, or when a habit streak is at risk.  
**Work:**
- Register a service worker for browser push notifications
- Add a `notification_preferences` table (lead time in minutes, which activity types)
- Server-side: a lightweight cron/setInterval to push notifications for tasks starting soon
- In-app toast for habit due-today reminders on dashboard load

**Acceptance:** User receives a browser notification 10 minutes before a scheduled task starts.

---

### #9 — Analytics page on `/stats`
**Note:** The route is `/stats`, not `/analytics` — the existing `/stats` route IS the surface this item describes; there is no separate `/analytics` planned.

**Status:** A `/stats` route exists with a `StatsOverview` component backed by the `myStats` query (composite score + per-habit summary + todo summary). Charts and the full layout below are not yet built out.

**Spec:** See `specifications.md` → "Analytics" section.
**Work:**
- Install shadcn charts (Recharts 3); do not add a second charting library
- Verify the "Dashboard" nav rename to "Calendar" — confirm/adjust as needed
- **Composite score** at top: weighted average of habit consistency + todo completion rate, displayed as % with a plain-English label
- **Habit consistency section**: bar chart (one bar per habit, completion rate % capped at 100%, colored by activity type); click a bar to expand a week-by-week trend line
- **Time distribution section**: grouped bar or donut chart — scheduled time vs completed time side-by-side per activity type
- **Todo throughput section**: bar chart of completed todos per bucket; toggle daily/weekly x-axis; overdue count as a secondary line overlay
- All sections share a single fixed time-range filter: This week / This month / Last 3 months / All time
- All data real-time (no caching layer yet)

**Acceptance:** User can open `/stats`, select "Last 3 months", and see habit rates, time distribution, and todo throughput with working charts. Clicking a habit bar shows its week-by-week trend.

---

## P2 — Quality of life

### #10 — URL-driven filters (TanStack Router search params)
**Problem:** Filters (activity type, completion status) are local React state — they reset on navigation and aren't shareable.  
**Work:**
- Migrate filter state to TanStack Router search params for `/todos`, `/habits`, `/time-blocks`
- Use `validateSearch` with Zod schemas
- Preserve filter on back/forward navigation

**Acceptance:** Filtering todos by activity type updates the URL; refreshing the page preserves the filter.

---

### #12 — Bulk complete / bulk delete todos
**Problem:** Completing or deleting todos one-by-one is tedious when clearing a backlog.  
**Work:**
- Add multi-select checkboxes to `TodoList`
- Toolbar appears when items are selected: "Complete selected", "Delete selected"
- Backend: batch mutations or multiple calls in a single Apollo request (via `Promise.all`)

**Acceptance:** User can select 5 todos and complete them all in one click.

---

### #14 — Recurrence exceptions for habits
**Problem:** The current habit model is rigid — there's no way to skip a specific instance (e.g., "skipping gym this Monday due to travel") without marking it as a full failure.  
**Work:**
- Add a `skipped` boolean to `habit_completions`
- Add a "skip this instance" action on scheduled habit slots
- Exclude skipped instances from streak and completion rate calculations
- Cap skips at 2 per period to prevent abuse

**Acceptance:** User can skip one habit instance; it shows as "skipped" in the history rather than "missed."

---

### #24 — iCal secret token
**Problem:** The iCal feed URL uses only `?userId=<uuid>` with no secret. Anyone who knows a user's UUID can access their schedule.
**Work:**
- Add a random `icalSecret` field (UUID or random hex) to the `users` table
- Change the iCal URL to `?secret=<icalSecret>` instead of `?userId=`
- Expose a `myRegenerateIcalSecret` mutation so users can rotate it
- Update the Settings page to show/regenerate the secret

**Acceptance:** The iCal URL contains a random secret that can be rotated without changing the user ID.

---

### #25 — Remove UUID Bearer token fallback in production
**Problem:** The server accepts a raw UUID as a Bearer token for dev convenience (DEMO_USER_ID). This means anyone who knows a user's UUID can authenticate as them in production.
**Work:**
- Guard the UUID fallback with `if (process.env.NODE_ENV !== 'production')` in `packages/server/src/index.ts`
- OR remove it entirely once the demo user flow is replaced by real auth

**Acceptance:** In production, only valid JWTs are accepted as Bearer tokens.

---

## P3 — Infrastructure & DX

### #15 — Expand test suite + CI
**Status:** Partially done. Existing vitest suites:
- `packages/server/src/auth.test.ts` — JWT + magic-link helpers
- `packages/server/src/schema/validators.test.ts` — Zod validators
- `packages/server/src/services/scheduler.test.ts` — pure scheduler algorithm

**What's left:**
- Resolver integration tests (PGLite in-memory) for the `my*` mutations and queries
- Client component / route smoke tests
- CI workflow (GitHub Actions) that runs `npm run typecheck`, `npm run lint`, `npm test` on PRs and blocks merges on failure
- Coverage targets (e.g. >80% on scheduler / resolvers)

**Acceptance:** PRs cannot merge with failing typecheck/lint/tests; resolver and validator paths are exercised end-to-end via PGLite.

---

### #16 — Postgres production path (dual-backend shipped, end-to-end test pending)
**Status:** The driver switch is implemented — `packages/db/src/index.ts` selects `postgres.js` when `DATABASE_URL` is set, PGLite otherwise. `.env.example` and `docker-compose.yml` cover both modes.

**What's left:**
- Run migrations against a real Postgres instance and confirm there are no PGLite-specific oddities (e.g. array column behavior in `time_blocks.daysOfWeek`)
- Smoke-test the app under a real Postgres deployment (concurrency, connection pooling)
- Decide on a connection-pool config (pg pool defaults, or pgBouncer)

**Acceptance:** A real Postgres deployment runs the full app without surprises; PGLite remains the no-config dev default.

---

### #18 — Error boundary + empty state UI polish (substantially done)
**Status:**
- `RouteError` (`packages/client/src/components/ui/route-error.tsx`) is wired as `errorComponent` on the major routes (todos, stats, habits, habits.index, activity-types, etc.). A generic `ErrorBoundary` class component also exists.
- `TodoList` has an empty state ("No todos yet — Add your first todo to get started").

**What's left:**
- Audit which routes still lack `errorComponent` and add `RouteError` to them.
- Verify `HabitList`, `TimeBlockList`, and `ActivityTypeList` have parity empty states with the `TodoList` treatment.
- Map GraphQL error codes to user-friendly messages in the Apollo error handler (currently `errorLink` only handles the auth case).
