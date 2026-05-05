### Auto Cal

## Purpose

The purpose of this application is to allow users to create todo's and habits.
Those are then automatically scheduled based on priority within a time block the user creates.
Time blocks are sections of time (5pm-7pm) that are labeled for certain kinds of activities.
Habits and tasks are tagged with an activity type.

The app will use the "tags" to schedule the tasks and habits within a time block.
If new tasks or habits are generated that are higher priority, it will reschedule all
tasks/habits to fit.


Todo's are a single time task that needs to be completed.
They have a title, description, priority, estimated length, and "activity type".

Habits are repeated tasks that should be completed X times per week or month.
They have a title, description, priority, estimated length and activity type.

The app should track how well habits are being done.
The app should track the number of completed todo's by activity type.

---

## Completion Behavior

### Todos

**Completing a todo**
- When a user marks a todo as complete, a dialog appears to confirm (or edit) the completion
  datetime, defaulting to now. This becomes `completedAt`.
- The todo's `scheduledAt` is updated to match `completedAt` — the calendar record moves to
  reflect *when the work actually happened*, not when it was originally planned.
- If `completedAt` is earlier than the original `scheduledAt` (completed early), the original
  scheduled slot is freed and the scheduler runs immediately to fill it with the next
  highest-priority unscheduled item.
- If `completedAt` is at or after the original `scheduledAt` (on-time or late), the slot
  was already "used" and no rescheduling is needed.
- On the calendar, completed todos render with a checkmark overlay and remain interactive
  (can be clicked to view details or uncompleted).

**Uncompleting a todo**
- Clears `completedAt` and clears `scheduledAt` (returns the item to the unscheduled pool).
- The scheduler runs to assign it a new future slot based on current priority and availability.
- The old calendar position is freed.

### Habits

**Completing a habit occurrence**
- Each completion creates a `habit_completions` row. The user is shown a dialog to confirm
  (or edit) the completion datetime, defaulting to now; this becomes `completedAt` on the row.
- The scheduled occurrence moves on the calendar to the actual `completedAt` time, with a
  checkmark overlay.
- If completed early (before the scheduled slot), the original slot is freed and the scheduler
  may fill it with another item.

**Uncompleting a habit occurrence**
- The `habit_completions` row is deleted (or soft-deleted).
- The slot is returned to the pool; the scheduler re-evaluates whether to place another
  occurrence there.

### Calendar display rules

| State                          | Calendar appearance                        | Interactive? |
|--------------------------------|--------------------------------------------|-------------|
| Scheduled, not complete        | Normal card                                | Yes         |
| Completed on-time / late       | Card at `completedAt` time, checkmark      | Yes         |
| Completed early (future freed) | Card at `completedAt` time, checkmark      | Yes         |
| Overdue (past slot, no complete) | Card with red/amber tint, overdue badge  | Yes         |

### Overdue items
- Items past their scheduled slot with no `completedAt` are **overdue**.
- They are automatically moved to the next available slot by the scheduler but flagged
  visually as overdue (red/amber tint + badge) so the user knows they are running late.
- They do not stay pinned to the missed slot; yesterday's calendar should not accumulate
  unactioned items.

### Completion time outside time blocks
- `completedAt` is recorded exactly as the user enters it, regardless of whether that time
  falls within any defined time block.
- The calendar renders the completed item floating at its exact `completedAt` time — there
  is no snapping to time block boundaries.

### Habit occurrence matching
- Habit completions are not matched to specific scheduled occurrences.
- A completion record is created with the user-entered `completedAt` timestamp.
- Period credit (e.g. "3 times this week") is calculated purely by counting completion
  timestamps that fall within the period window — no occurrence ID is tracked.

### Todo re-completion
- A todo is a single-time task. It has at most one `completedAt` value at any given time.
- Uncompleting and re-completing is valid (e.g. to correct the timestamp), but the latest
  `completedAt` always wins — there is no completion history log.

---

## Scheduler

### Horizon
- The scheduler looks ahead **2 months** from the current date when placing items.
- This may be made configurable in the future.

### Conflict resolution (priority bumping)
- When a higher-priority item needs a slot occupied by a lower-priority item, the
  lower-priority item is bumped to its next available slot.
- If no future slot exists within the 2-month horizon, the bumped item is marked
  **unschedulable** and shown with the same amber warning triangle used for items
  with no matching time block.
- Users are not prompted to resolve conflicts manually — the scheduler handles it.

### Write-back triggers
- The scheduler runs **after every mutation that could affect the schedule**: create/update/
  delete of a todo, habit, time block, or completion record.
- It runs **in the background** (fire-and-forget) — the mutation response is not blocked.
- In the future, a GraphQL subscription may be added so the client receives the updated
  schedule automatically without polling.

### Manual scheduling override
- Users can manually drag a todo or habit onto any calendar slot, including slots outside
  any defined time block. The dragged position sets `scheduledAt` directly.
- Manually placed items with no `isPinnedSchedule` flag may be evicted by the scheduler
  when a higher-priority item needs the slot.
- **`isPinnedSchedule` is removed** — there is no pin mechanic. All manual placements are
  treated the same as scheduler-assigned ones and subject to priority bumping.

### Activity type requirement
- Activity type is **required** on todos and habits. Without one the scheduler cannot
  match the item to a time block.
- Users may still manually drag an item to a calendar slot regardless of activity type,
  but it will not be auto-scheduled.
- The UI should enforce activity type selection before a todo or habit can be saved.

### No time blocks — onboarding gate
- If a user has no time blocks, the scheduler cannot place any items.
- The **Dashboard and Schedule views** show a blocking empty state directing the user to
  create a time block. All other pages (Todos, Habits, Activity Types) remain fully usable.
- Once at least one time block exists the gate disappears and the scheduler runs normally.

### Habit period boundaries
- A "week" runs **Sunday → Saturday**.
- A "month" is the calendar month.
- If a period ends with fewer completions than the target frequency, it is recorded as a
  partial failure — no catch-up scheduling into the next period.
- The scheduler will not cram remaining occurrences into the final days of a period; it
  schedules evenly across available slots and accepts whatever completes naturally.

---

## Time Blocks

### Overlapping time blocks and priority
- Time blocks can overlap in day/time coverage.
- Each time block has an integer **priority** field (higher = preferred, default 0).
- When two blocks cover the same slot, the scheduler fills the higher-priority block first
  before using the lower-priority one.
- Users set time block priority manually in the time block form.
