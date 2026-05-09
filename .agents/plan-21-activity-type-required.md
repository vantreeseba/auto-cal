# Plan: #21 — Make activity type required on todos and habits

**Branch:** `feat/activity-type-required`
**Scope:** Closes the silent "item never schedules" failure mode by requiring `activityTypeId` at form, resolver, and DB layers.

## Goal

Today, both `todos.activityTypeId` and `habits.activityTypeId` are nullable; the form Zod schemas accept `undefined`; the scheduler silently skips items without an activity type. Make activity type required end-to-end so the failure mode is impossible to enter.

## Decisions (locked)

1. **Null-row migration strategy: DELETE null rows** from `todos`, `habits`, `time_blocks`. Destructive. Single-user hobby DB; user explicitly chose this over backfill.
2. **Bundle `time_blocks.activityTypeId` notNull**: yes. Same migration touches all three tables.
3. **Empty-state UX**: link to `/activity-types` from the form when no activity types exist. No inline-create.

Additional decision made during planning:
- **FK `onDelete` behavior on `activity_types`**: change from `'set null'` to `'restrict'` for `todos.activity_type_id`, `habits.activity_type_id`, `time_blocks.activity_type_id`. With the column becoming `NOT NULL`, `set null` is no longer valid. `restrict` blocks deletion of an activity type that has dependents — surfaces a clear error rather than silent data loss. UX layer can add a "you have N todos using this — reassign or delete first" message later (separate PR).

## Work units

1. **DB migration: delete + notNull + restrict**
   - Update Drizzle models (`todos.ts`, `habits.ts`, `time_blocks.ts`) to add `.notNull()` on `activityTypeId` and change `onDelete: 'set null'` to `onDelete: 'restrict'`
   - `npm run db:generate` to scaffold the migration file
   - Hand-edit the generated migration to prepend `DELETE FROM <table> WHERE activity_type_id IS NULL;` for `time_blocks`, `todos`, `habits` (in that order; `habits` cascades to `habit_completions`, fine)
   - User runs `npm run db:migrate` themselves (don't apply unprompted)

2. **Tighten server-side Zod validators** (`packages/server/src/schema/validators.ts`)
   - `CreateTodoInput.activityTypeId`: required (drop `.optional()`)
   - `UpdateTodoInput.activityTypeId`: required when present (drop `.nullable()`, keep `.optional()` for partial updates)
   - Same for `CreateHabitInput` / `UpdateHabitInput` / `CreateTimeBlockInput` / `UpdateTimeBlockInput`
   - Update `validators.test.ts` to cover the new required-field behavior

3. **Tighten client-side form validation**
   - `TodoForm.tsx` Zod: `activityTypeId: z.string().uuid()` (drop `.or(z.undefined())`)
   - `HabitForm.tsx` Zod: same
   - `TimeBlockForm.tsx` Zod: same (verify current state)
   - Add inline error rendering on the field
   - Add empty-state copy when `activityTypes.length === 0` with a link to `/activity-types`

4. **GraphQL SDL update** (`schema/resolvers/index.ts`)
   - Mark `activityTypeId` as `ID!` (non-nullable) on `CreateTodoArgs`, `CreateHabitArgs`, `CreateTimeBlockArgs`
   - On the `Update*Args` inputs keep it nullable for partial-update reasons (the resolver / Zod handles required-on-create)
   - Mark `Todo.activityTypeId`, `Habit.activityTypeId`, `TimeBlock.activityTypeId` as `String!` in the auto-generated types — actually this is drizzle-generated, may just flip when the column becomes notNull, verify

5. **Scheduler simplification (optional)**
   - The scheduler currently has guards for `if (!item.activityTypeId)` skips. Once required, those branches become unreachable and can be removed. Low priority — leave for a follow-up.

6. **Client codegen**
   - Run `npm run codegen:server` then `npm run codegen` after SDL changes

## Quality gates

- `npm run typecheck` (will catch any client code that assumed activityTypeId could be null)
- `npm run lint`
- `npm test` (validators tests should be updated)
- Manual smoke: create a new todo without selecting an activity type → should be blocked at form

## Out of scope

- The `myCompleteHabit` `activityTypeId` lookup (it reads from the parent habit, no change needed)
- Migrating existing `activityTypes` shape — only the FKs change
- Improving the activity-type dropdown UX beyond the empty-state guard

## Risk

- **PGLite migration behavior with backfill loops** — the backfill needs to insert General activity types per user, then update FKs. PGLite supports this but worth running on a copy of `pgdata/` first to confirm.
- **Breaking change for any external consumers of the iCal feed or GraphQL API** — none expected, single-user app.
