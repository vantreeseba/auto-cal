# Auto Cal — Feature Requests & Issues

> Status legend: `[ ]` open · `[x]` done · `[-]` in progress

---

## Recommended starting points

If you're unsure what to work on, these are the highest-leverage next steps (#17 has shipped, removed from this list):

1. **#7 — Weekly navigation on dashboard** — obvious UX gap any user will hit immediately (half day)
2. **#19 — Completion datetime dialog** — core UX for completing tasks accurately (1 day)
3. **#21 — Activity type required (residual)** — closes the silent "item never schedules" failure mode for new todos/habits

---

## P0 — Core correctness / blocking

### #21 — Make activity type required on todos and habits
**Status:** Originally bundled `isPinnedSchedule` removal, drag-to-schedule, and activity-type-required. The first two have shipped:
- `manuallyScheduled` is the live signal (`todos.manually_scheduled` boolean, default false). `isPinnedSchedule` never made it into the schema.
- Drag-to-reschedule is live for todos in `CalendarView` (see #4).

**What's left:** Activity type is still nullable in the database and accepted as `undefined` by the form Zod schemas (`activityTypeId: z.string().uuid().or(z.undefined())` in both `TodoForm.tsx` and `HabitForm.tsx`). The scheduler silently skips items without an activity type, which is the user-visible bug.

**Spec:** See `specifications.md` → "Scheduler" section.
**Work:**
- Make `activityTypeId` `notNull` on `todos` and `habits` tables + migration (handle existing nulls — backfill or block)
- Update Zod inputs (`CreateTodoInput`, `UpdateTodoInput`, `CreateHabitInput`, `UpdateHabitInput`) to require `activityTypeId`
- Update `TodoForm` and `HabitForm` Zod + UI to require selection (block save without it; show inline validation)
- Surface the migration concern: existing rows with null `activityTypeId` need a strategy (e.g. assign to a default "General" activity type per user, or block migration if any exist)

**Acceptance:** Saving a todo or habit without an activity type is blocked at form, resolver, and DB layers. Existing data either has a default applied or migration is gated until cleaned up.

---

### #20 — Time block priority field
**Problem:** Time blocks can overlap. Currently there is no way to express which block should be preferred when two cover the same slot, so scheduler behavior is undefined for overlapping blocks.
**Spec:** See `specifications.md` → "Time Blocks" section.
**Work:**
- Add `priority` integer column (default 0) to the `time_blocks` table + migration
- Expose it in `TimeBlockForm` as a numeric input
- Update the scheduler to sort candidate blocks by priority descending when selecting a slot

**Acceptance:** A "Deep Work" block (priority 2) and "Side Project" block (priority 1) that overlap on Monday 10–11am will have todos scheduled into "Deep Work" first.

---

### #19 — Completion datetime dialog + calendar move-on-completion
**Problem:** Marking a todo or habit complete sets `completedAt = now` with no way to record when it actually happened. Completed items also don't move on the calendar to reflect their real completion time, and freeing future slots doesn't trigger rescheduling.  
**Spec:** See `specifications.md` → "Completion Behavior" section.  
**Work:**
- Add a "Complete" confirmation dialog (todos and habits) with a datetime picker defaulting to now
- On confirm: set `completedAt`, update `scheduledAt` to match `completedAt`
- If `completedAt < original scheduledAt` (completed early): clear the original future slot, run scheduler to backfill
- Calendar: render completed items at `completedAt` with a checkmark overlay; keep them interactive
- Uncomplete (todos): clear `completedAt` + `scheduledAt`, return to unscheduled pool, run scheduler
- Uncomplete (habits): delete the `habit_completions` row, run scheduler

**Acceptance:** Completing a todo early moves it on the calendar and immediately schedules something else in the freed slot. Uncompleting returns it to the queue.

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

### #3 — Finish UTC migration (partially shipped)
**Status:** Partially done.
- `users.timezone` column exists (IANA string, default `'UTC'`)
- `mySchedule` accepts a `timezone` argument; client syncs the browser timezone via `myUpdateProfile` on dashboard mount
- iCal endpoint converts naive datetimes to UTC via `fromZonedTime(datetime, user.timezone)` from `date-fns-tz`

**What's left:** The GraphQL API still returns naive datetime strings (`YYYY-MM-DDTHH:mm:ss`, no `Z`) and relies on the browser interpreting them as local time. This is the stopgap that needs to go away.

**Work:**
- Switch the scheduler / `mySchedule` to emit UTC ISO strings (`Z` suffix or explicit offset)
- Verify `scheduledAt` / `completedAt` are stored as true UTC in the DB (not naive)
- Convert UTC → user.timezone client-side using `date-fns-tz` or `Intl.DateTimeFormat`
- Update `CalendarView` and `ScheduleView` to do the conversion at render time

**Acceptance:** Two browsers in different timezones, hitting the same backend, both render the schedule in their respective local times correctly. The naive-string convention is gone from the API surface.

---

## P1 — High-value features

### #23 — Force reschedule escape hatch
**Problem:** Once a todo has been auto-scheduled, the scheduler preserves its `scheduledAt` on subsequent runs. There is currently no way for the user to explicitly evict a placed todo and let the scheduler re-place it.  
**Work:**
- Option A: add a `force: Boolean` flag to the `myReschedule` mutation — when true, clears `scheduledAt` on all (or selected) todos before running writeback
- Option B: expose a `myUnscheduleTodo(id: ID!)` mutation that sets `scheduledAt = null`, then let the next writeback pick it up

**Acceptance:** User can trigger a re-schedule of a todo that is already placed in a future slot.

---

### #4 — Calendar: drag-to-reschedule ✓ Done (todos)
Drag-and-drop is implemented for todos in `CalendarView`. Dragging a todo sets `scheduledAt` and `manuallyScheduled: true`. Habits are not draggable (scheduler-controlled only).

---

### #5 — Conflict detection & "unschedulable" state
**Problem:** If a todo's estimated length exceeds any available slot for its activity type, it silently goes unscheduled with no feedback.  
**Work:**
- Add a `scheduleStatus` field to todos: `'scheduled' | 'unschedulable' | 'pending'`
- Surface unschedulable todos in the UI with a warning badge
- Show a tooltip explaining why (no matching time block, no slot long enough, etc.)

**Acceptance:** User can see which todos will never be auto-scheduled and why.

---

### #6 — Habit completion tracking via the dashboard
**Problem:** Habits can be "completed" via the habits list, but there's no quick-complete from the dashboard or from within a scheduled slot.  
**Work:**
- Add a "complete" button on scheduled habit slots in `CalendarView` and `ScheduleView`
- Completing a slot calls `myCompleteHabit` and marks the matching `habit_completions` row
- Show a checkmark/strikethrough on the completed slot

**Acceptance:** User can complete habits directly from the weekly schedule view.

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

### #11 — Estimated length quick-edit (inline)
**Problem:** Changing `estimatedLength` requires opening the full edit dialog, which is disruptive when the user just wants to tweak a time estimate.  
**Work:**
- Add an inline editable chip on `TodoItem` and `HabitItem` for estimated length
- Single-click to edit; blur or Enter to save via `myUpdateTodo`

**Acceptance:** User can change the estimated length of a todo without opening the edit form.

---

### #12 — Bulk complete / bulk delete todos
**Problem:** Completing or deleting todos one-by-one is tedious when clearing a backlog.  
**Work:**
- Add multi-select checkboxes to `TodoList`
- Toolbar appears when items are selected: "Complete selected", "Delete selected"
- Backend: batch mutations or multiple calls in a single Apollo request (via `Promise.all`)

**Acceptance:** User can select 5 todos and complete them all in one click.

---

### #13 — Due dates on todos
**Problem:** Todos have no hard due date — only `scheduledAt` (which is auto-assigned). Users can't express "this must be done by Friday."  
**Work:**
- Add `dueAt` timestamp column to `todos` table + migration
- Add due date picker to `TodoForm`
- Scheduler should prioritize overdue items (past `dueAt`) regardless of priority score
- Surface overdue todos with a red badge

**Acceptance:** A todo with a due date appears with a countdown; it gets promoted in scheduling once overdue.

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

### #17 — Seed data for development ✓ Done
`seedDemoData()` in `packages/db/src/seed.ts` creates 3 activity types (Work / Exercise / Learning), 6 time blocks, 5 todos, 3 habits, all guarded by `NODE_ENV !== 'production'` and idempotent. It runs automatically on server start in dev (see `packages/server/src/index.ts`). A standalone `npm run db:seed` script is **not** wired up — the only entry point is the server-startup hook.

If a CLI seed entry is wanted, `packages/db/src/seed-runner.ts` exists as the scaffolding; just add the `db:seed` script to `package.json`.

---

### #18 — Error boundary + empty state UI polish
**Problem:** GraphQL errors surface as raw error text or silently fail; empty states show no call-to-action.  
**Work:**
- Add React error boundaries around each route
- Add empty-state illustrations/messages to `TodoList`, `HabitList`, `TimeBlockList` with a "Create your first X" CTA button
- Map GraphQL error codes to user-friendly messages in Apollo error handler

**Acceptance:** An empty todos list shows "No todos yet — add one to get started" with a button. A network error shows a user-friendly message instead of crashing.
