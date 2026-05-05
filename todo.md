# Auto Cal — Feature Requests & Issues

> Status legend: `[ ]` open · `[x]` done · `[-]` in progress

---

## Recommended starting points

If you're unsure what to work on, these three are the highest-leverage next steps:

1. **#17 — Seed data** — makes development and demos usable in minutes (2-3 hours)
2. **#2 — Scheduler write-back** — delivers the core value proposition of the app (1-2 days)
3. **#7 — Weekly navigation on dashboard** — obvious UX gap any user will hit immediately (half day)

---

## P0 — Core correctness / blocking

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

### #1 — Real authentication (magic link + JWT)
**Problem:** The app currently hard-codes a demo user ID sent as a Bearer token. There is no real login or user isolation.  
**Work:**
- Add magic-link email flow (e.g. Resend or Nodemailer)
- Issue signed JWTs on login; verify in server context
- Store sessions (or keep stateless with short-lived tokens)
- Replace `DEMO_USER_ID` env var with real token extraction
- Add a login/signup page in the client

**Acceptance:** A new user can sign up via email, log in with a magic link, and see only their own data.

---

### #2 — Scheduler writes back to the database
**Problem:** The scheduling algorithm (`scheduler.ts`) is a pure, read-only function that computes a schedule but never persists `scheduledAt` on todos or generates habit completion rows. The `mySchedule` query recomputes from scratch on every call.  
**Work:**
- Call the scheduler after `myCreateTodo`, `myUpdateTodo` (priority/length change), and `myCreateTimeBlock`
- Write `scheduledAt` back to the `todos` table
- Generate tentative `habit_completions` rows (with `scheduledAt` set, `completedAt` null) for the coming week
- Add a `myReschedule` mutation for manual re-runs
- Handle the "priority bump" case: when a high-priority item is added, evict lower-priority items and reschedule

**Acceptance:** Creating a todo with an activity type that has a matching time block sets `scheduledAt` automatically; the dashboard reflects it without recomputing.

---

### #3 — Timezone handling
**Problem:** The scheduler returns naive ISO strings with no timezone suffix ("local time"). With a real multi-user deployment, times need to be stored in UTC and displayed in the user's local timezone.  
**Work:**
- Store all timestamps as UTC in Postgres (already the default — but verify)
- Add a `timezone` field to the `users` table (IANA zone string)
- Accept `weekStart` in the user's local timezone in `mySchedule`; convert to UTC before querying
- Return UTC from the API; convert to local time in the client using `date-fns-tz` or `Intl`

**Acceptance:** A user in UTC-5 and a user in UTC+9 both see the correct local times for the same schedule.

---

## P1 — High-value features

### #4 — Dashboard: drag-to-reschedule on the calendar
**Problem:** The `CalendarView` displays the schedule but has no interaction — users cannot drag a task to a different slot to manually override the auto-scheduler.  
**Work:**
- Enable `react-big-calendar` drag-and-drop addon
- On drop, call `myUpdateTodo` with the new `scheduledAt`
- Lock the slot so the auto-scheduler doesn't overwrite the manual assignment (add an `isPinnedSchedule` flag to `todos`)

**Acceptance:** User can drag a todo to a new slot; it stays there on page refresh.

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

### #9 — Analytics: productivity insights
**Problem:** The `activityTypeStats` and `habitStats` queries exist but the UI only shows raw numbers; there are no trends or insights.  
**Work:**
- Add a `/analytics` route with charts (use Recharts or visx)
- Completion rate over time by activity type (line chart)
- Todo throughput per week (bar chart)
- Habit streak history (heatmap, GitHub-style)
- "Best day" and "best time of day" computed from completion timestamps

**Acceptance:** User can see a 30-day productivity trend broken down by activity type.

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

## P3 — Infrastructure & DX

### #15 — Test suite (unit + integration)
**Problem:** There are zero automated tests. The scheduling algorithm, resolvers, and Zod validators are completely untested.  
**Work:**
- Unit tests for `scheduler.ts` with known fixture inputs (Vitest)
- Integration tests for all custom resolvers using PGLite in-memory
- Snapshot/type tests for Zod validators
- Set up a CI workflow (GitHub Actions) that runs `npm test` and `npm run typecheck`

**Acceptance:** `npm test` passes with >80% coverage on the scheduler and resolvers; CI blocks merges on failure.

---

### #16 — Replace PGLite with full Postgres for production
**Problem:** PGLite is a single-process embedded database. It cannot handle concurrent connections, making it unsuitable for a multi-user hosted deployment.  
**Work:**
- Add a `DATABASE_URL` env var and switch the DB driver based on it
- Test migrations against real Postgres
- Update Docker Compose to include a Postgres service
- Document the swap in AGENTS.md

**Acceptance:** `docker compose up` starts the app backed by real Postgres; PGLite still works for local dev without `DATABASE_URL`.

---

### #17 — Seed data for development
**Problem:** The seed file creates a demo user but no sample todos, habits, or time blocks. Starting the app for the first time shows an empty state with no guidance.  
**Work:**
- Extend `seed.ts` with realistic sample data (3 activity types, 5 todos, 3 habits, 6 time blocks)
- Guard with `NODE_ENV !== 'production'` check
- Add a `npm run db:seed` script

**Acceptance:** Running `npm run db:seed` populates a useful demo state; the dashboard is non-empty on first load.

---

### #18 — Error boundary + empty state UI polish
**Problem:** GraphQL errors surface as raw error text or silently fail; empty states show no call-to-action.  
**Work:**
- Add React error boundaries around each route
- Add empty-state illustrations/messages to `TodoList`, `HabitList`, `TimeBlockList` with a "Create your first X" CTA button
- Map GraphQL error codes to user-friendly messages in Apollo error handler

**Acceptance:** An empty todos list shows "No todos yet — add one to get started" with a button. A network error shows a user-friendly message instead of crashing.
