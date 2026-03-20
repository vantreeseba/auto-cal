import type {
  CreateHabitMutation,
  CreateHabitMutationVariables,
  Habit_HabitListFragment,
  UpdateHabitMutation,
  UpdateHabitMutationVariables,
} from '@/__generated__/graphql.js';
import { graphql } from '@/__generated__/index.js';
import { ActivityTypeSelect } from '@/components/domain/activity-type/ActivityTypeSelect';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
  Form,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAppForm } from '@/hooks/form-hook';
import { useMutation } from '@apollo/client';
import { z } from 'zod';

// ─── GraphQL Operations ────────────────────────────────────────────────────

const CREATE_HABIT = graphql(`
  mutation CreateHabit($input: CreateHabitArgs!) {
    myCreateHabit(input: $input) {
      id
      title
      description
      activityType {
        id
        name
        color
      }
      priority
      estimatedLength
      frequencyCount
      frequencyUnit
    }
  }
`);

const UPDATE_HABIT = graphql(`
  mutation UpdateHabit($input: UpdateHabitArgs!) {
    myUpdateHabit(input: $input) {
      id
      title
      description
      activityType {
        id
        name
        color
      }
      priority
      estimatedLength
      frequencyCount
      frequencyUnit
    }
  }
`);

// ─── Constants ─────────────────────────────────────────────────────────────

const PRIORITY_OPTIONS = [
  { label: 'Low', value: '0' },
  { label: 'Medium', value: '25' },
  { label: 'High', value: '50' },
  { label: 'Urgent', value: '100' },
] as const;

const DURATION_OPTIONS = [
  { label: '15 minutes', value: '15' },
  { label: '30 minutes', value: '30' },
  { label: '45 minutes', value: '45' },
  { label: '1 hour', value: '60' },
  { label: '1.5 hours', value: '90' },
  { label: '2 hours', value: '120' },
  { label: '3 hours', value: '180' },
  { label: '4+ hours', value: '480' },
] as const;

const FREQUENCY_UNIT_OPTIONS = [
  { label: 'per week', value: 'week' },
  { label: 'per month', value: 'month' },
] as const;

// ─── Validation Schema ──────────────────────────────────────────────────────

const habitSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Max 200 characters'),
  description: z.string().max(2000, 'Max 2000 characters').optional(),
  activityTypeId: z.string().uuid().optional(),
  priority: z.string().min(1, 'Priority is required'),
  estimatedLength: z.string().min(1, 'Duration is required'),
  frequencyCount: z
    .number()
    .int()
    .min(1, 'Must be at least 1')
    .max(30, 'Max 30'),
  frequencyUnit: z.string().min(1, 'Frequency unit is required'),
});

// ─── Props ─────────────────────────────────────────────────────────────────

type HabitFormProps = {
  habit?: Habit_HabitListFragment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// ─── Component ─────────────────────────────────────────────────────────────

export function HabitForm({ habit, open, onOpenChange }: HabitFormProps) {
  const isEdit = habit !== undefined;

  const [createHabit] = useMutation<
    CreateHabitMutation,
    CreateHabitMutationVariables
  >(CREATE_HABIT, {
    refetchQueries: ['GetMyHabits'],
  });

  const [updateHabit] = useMutation<
    UpdateHabitMutation,
    UpdateHabitMutationVariables
  >(UPDATE_HABIT, {
    refetchQueries: ['GetMyHabits'],
  });

  const form = useAppForm({
    defaultValues: {
      title: habit?.title ?? '',
      description: habit?.description ?? '',
      activityTypeId: habit?.activityType?.id ?? undefined,
      priority: String(habit?.priority ?? 0),
      estimatedLength: String(habit?.estimatedLength ?? 30),
      frequencyCount: habit?.frequencyCount ?? 1,
      frequencyUnit: habit?.frequencyUnit ?? 'week',
    },
    validators: {
      onChange: habitSchema,
    },
    onSubmit: async ({ value }) => {
      if (isEdit && habit) {
        await updateHabit({
          variables: {
            input: {
              id: habit.id,
              title: value.title,
              description: value.description ?? null,
              activityTypeId: value.activityTypeId ?? null,
              priority: Number(value.priority),
              estimatedLength: Number(value.estimatedLength),
              frequencyCount: value.frequencyCount,
              frequencyUnit: value.frequencyUnit,
            },
          },
        });
      } else {
        await createHabit({
          variables: {
            input: {
              title: value.title,
              description: value.description ?? null,
              activityTypeId: value.activityTypeId ?? null,
              priority: Number(value.priority),
              estimatedLength: Number(value.estimatedLength),
              frequencyCount: value.frequencyCount,
              frequencyUnit: value.frequencyUnit,
            },
          },
        });
      }
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Habit' : 'New Habit'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details of this habit.'
              : 'Add a recurring habit to your schedule.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <Form className="space-y-4">
            {/* Title */}
            <form.AppField name="title">
              {(field) => (
                <field.InputField
                  label="Title"
                  placeholder="What habit do you want to build?"
                />
              )}
            </form.AppField>

            {/* Description */}
            <form.AppField name="description">
              {(field) => (
                <field.TextAreaField
                  label="Description (optional)"
                  placeholder="Add any notes or details..."
                />
              )}
            </form.AppField>

            {/* Activity Type */}
            <form.AppField name="activityTypeId">
              {(field) => (
                <Field>
                  <FieldLabel>Activity Type (optional)</FieldLabel>
                  <FieldControl>
                    <ActivityTypeSelect
                      value={field.state.value}
                      onValueChange={(v) => field.handleChange(v)}
                      onBlur={field.handleBlur}
                    />
                  </FieldControl>
                  <FieldError />
                </Field>
              )}
            </form.AppField>

            {/* Priority + Duration — two columns */}
            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <form.AppField name="priority">
                {(field) => (
                  <field.SelectField
                    label="Priority"
                    options={PRIORITY_OPTIONS}
                    placeholder="Select priority"
                  />
                )}
              </form.AppField>

              {/* Estimated Length */}
              <form.AppField name="estimatedLength">
                {(field) => (
                  <field.SelectField
                    label="Duration"
                    options={DURATION_OPTIONS}
                    placeholder="Select duration"
                  />
                )}
              </form.AppField>
            </div>

            {/* Frequency — count + unit side by side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Frequency Count */}
              <form.AppField name="frequencyCount">
                {(field) => (
                  <Field>
                    <FieldLabel>Times</FieldLabel>
                    <FieldControl>
                      <Input
                        type="number"
                        min={1}
                        max={30}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.target.valueAsNumber)
                        }
                      />
                    </FieldControl>
                    <FieldError />
                  </Field>
                )}
              </form.AppField>

              {/* Frequency Unit */}
              <form.AppField name="frequencyUnit">
                {(field) => (
                  <field.SelectField
                    label="Frequency"
                    options={FREQUENCY_UNIT_OPTIONS}
                    placeholder="Select frequency"
                  />
                )}
              </form.AppField>
            </div>

            <DialogFooter>
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!canSubmit}>
                      {isSubmitting
                        ? 'Saving...'
                        : isEdit
                          ? 'Save Changes'
                          : 'Create Habit'}
                    </Button>
                  </>
                )}
              </form.Subscribe>
            </DialogFooter>
          </Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
