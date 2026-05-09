# Plan: #19 — Completion datetime dialog + early-completion freeing

**Branch:** `feat/completion-dialog`
**Scope:** Replace the bare "complete" click with a confirm dialog that lets the user set the actual completion datetime; trigger rescheduling when the move frees a slot.

## Goal

Per `specifications.md` → "Completion Behavior":
- Completing a todo or habit shows a dialog with a datetime picker (default: now)
- On confirm, set `completedAt` AND update `scheduledAt` to match — the calendar record moves to where the work actually happened
- If completed early (`completedAt < original scheduledAt`), free the original slot and trigger a writeback so something else fills it
- Uncomplete (todos): clear `completedAt` + `scheduledAt`, return to unscheduled pool, run scheduler
- Uncomplete (habits): delete the `habit_completions` row, run scheduler

## Decisions (locked)

1. **Datetime picker**: shadcn-style — install `react-day-picker` and add the shadcn `calendar` primitive; pair with a styled time input. No native `datetime-local`.
2. **Dialog instantiation**: per-surface modal instance using a shared `<CompletionDialog>` component (no global modal at the root).
3. **Habit uncomplete**: hard-delete the `habit_completions` row per spec.
4. **Calendar checkmark**: extend the existing event renderer in `CalendarView` to show a checkmark glyph for items with `completedAt != null`.
5. **Out-of-block completion render**: spec says completedAt renders at exact time, no snap. Verify before changing render logic.

## Work units

1. **Backend: scheduler-aware completion**
   - Update `myCompleteTodo` resolver to accept an optional `completedAt: String` arg (default to server `now()`); set both `completedAt` and `scheduledAt` to that value
   - Update `myCompleteHabit` resolver similarly — already accepts `scheduledAt`; thread `completedAt` through too
   - Both already trigger `runSchedulerWriteback` fire-and-forget; verify

2. **Backend: free-slot logic**
   - In `runSchedulerWriteback`, when computing the pre-placement skip set for completed-early todos: ensure that a todo whose `completedAt < previous scheduledAt` is treated as freeing the original slot (which it already does — completed todos are filtered out of the scheduling pool)
   - If a previously-completed todo is uncompleted (we get a new `myUpdateTodo` with `completedAt: null` + `scheduledAt: null`), it re-enters the pool — already handled

3. **Backend: habit uncomplete mutation**
   - Add `myUncompleteHabit(completionId: ID!): Boolean` (or piggyback on an existing mutation): hard-delete the `habit_completions` row, trigger writeback
   - Update SDL in `extensionSDL`

4. **Shared client component: `<CompletionDialog>`**
   - File: `packages/client/src/components/domain/CompletionDialog.tsx`
   - Props: `open`, `onOpenChange`, `item: { id, kind: 'todo' | 'habit', title, scheduledAt? }`
   - Body: title + native `<input type="datetime-local">` defaulted to now
   - Confirm calls `myCompleteTodo({ id, completedAt })` or `myCompleteHabit({ habitId, scheduledAt: completedAt })`
   - Success: close dialog, optimistic cache update if straightforward

5. **Wire the dialog into existing surfaces**
   - `TodoItem` complete button → opens dialog instead of immediate mutation
   - `HabitItem` complete button → ditto
   - `CalendarView` event click on incomplete item → ditto
   - `ScheduleView` row complete button → ditto

6. **Calendar event renderer**
   - Add a checkmark glyph (lucide `<Check>`) to the event renderer when `completedAt != null`
   - Verify completed events stay interactive (clickable for edit/uncomplete)

7. **Uncomplete UX**
   - Add an "Uncomplete" action to the dialog when reopened on an already-completed item, OR a separate context-menu / button on the completed event
   - Wires to `myUpdateTodo({ id, completedAt: null, scheduledAt: null })` for todos, `myUncompleteHabit` for habits

8. **Tests**
   - Add a vitest case to `validators.test.ts` for the new optional `completedAt` arg on the relevant inputs
   - Manual smoke per the acceptance criteria below

## Quality gates

- `npm run typecheck`
- `npm run lint`
- `npm test`
- Manual smoke:
  - Complete a todo at "now" → calendar item moves to that time, scheduler fills the freed slot if early
  - Complete a todo at a past time → calendar shows it at the past time
  - Uncomplete a todo → returns to pool, gets rescheduled
  - Complete a habit similarly; uncomplete deletes the completion row
  - Completion outside any time block → renders at exact time, no snap

## Out of scope

- Logging completion history (single `completedAt` value per todo, per spec)
- Bulk completion (#12)
- Completion notes / reflection text

## Risk

- **Slot-freeing race** — if the user marks several items complete in quick succession, multiple writebacks fire concurrently. Existing fire-and-forget semantics already accept this; should be fine but worth eyeballing for visible races.
- **Calendar event filtering** — current `CalendarView` filters events by `isScheduled` and time-window; need to verify completed-out-of-block items don't get hidden.
