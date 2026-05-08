# Scheduling Domain

## Overview

The scheduler auto-assigns `scheduledAt` timestamps to todos and habit instances within user-defined time blocks. It runs as a background side-effect after every mutation that could affect the schedule.

## Core Files

| File | Role |
|------|------|
| `packages/server/src/services/scheduler.ts` | Pure scheduling algorithm — no DB calls |
| `packages/server/src/services/scheduler-writeback.ts` | Fetches data, runs the algorithm, writes results back |

## Algorithm (`computeSchedule`)

1. Expand each `TimeBlock` into concrete `Slot` objects for the target week (one slot per `daysOfWeek` entry)
2. Group slots by `activityTypeId`, sorted by priority DESC then date/start-time ASC
3. Sort all tasks (todos + habit instances) by **priority DESC**, then **estimatedLength ASC**
4. For each task, find the first slot for its `activityTypeId` with enough remaining capacity (`effectiveSlotStart`)
   - Habit instances additionally try to spread across different days before falling back to any available slot
5. Return `ScheduledItem[]` with `scheduledStart`/`scheduledEnd` as naive ISO strings (`YYYY-MM-DDTHH:mm:ss`, no `Z`) so browsers interpret them as local time

## Writeback (`runSchedulerWriteback`)

Called after: `myCreateTodo`, `myUpdateTodo`, `myDeleteTodo`, `myCreateHabit`, `myUpdateHabit`, `myDeleteHabit`, `myCreateTimeBlock`, `myUpdateTimeBlock`, `myDeleteTimeBlock`, `myCompleteTodo`, `myReschedule`.

Steps:
1. Fetch all user data in one round-trip (time blocks, incomplete todos, habits, activity types, actual habit completions)
2. Reset overdue manually-scheduled todos (clear `manuallyScheduled` + `scheduledAt`)
3. **Pre-place already-scheduled todos** — todos with a future `scheduledAt` that still falls within a valid time block are excluded from the scheduling loop and their existing `scheduledAt` is preserved
4. Iterate week-by-week over a 2-month horizon, calling `computeSchedule` for each week; placed todos are removed from the pool
5. Write all `scheduledAt` values back to `todos`
6. Replace all tentative `habit_completions` rows (those with `scheduledAt` set and `completedAt` null) with fresh ones from the new schedule

## Pre-placement Lock

A todo is considered "pre-placed" (and skipped by the scheduler) if:
- `scheduledAt` is in the future
- A time block exists for the todo's `activityTypeId` that covers the scheduled day-of-week and start time

If either condition fails (block deleted, slot in the past), the todo re-enters the scheduling pool.

## Manually Scheduled Todos

Todos with `manuallyScheduled: true` are excluded from the scheduler entirely unless they are overdue (`scheduledAt < now`), at which point `manuallyScheduled` and `scheduledAt` are cleared and the todo re-enters the pool.

## Habit Instance Generation

For each habit, the writeback counts how many completions (actual + tentative) exist in the current week/month and computes a deficit (`frequencyCount - done`). That many instances are passed to `computeSchedule` with an `instanceIndex` suffix on the ID.
