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

### Open questions (to be decided)
- Should overdue items be rescheduled automatically to the next available slot, or stay put
  as a visual record until the user acts?
- What is the display behavior when `completedAt` falls outside any time block (e.g. 2am)?
- Should there be a cap on how far back a user can set `completedAt`?
