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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppForm } from '@/hooks/form-hook';
import { cn } from '@/lib/utils';
import { gql, useMutation, useQuery } from '@apollo/client';
import { z } from 'zod';

// ─── GraphQL Operations ────────────────────────────────────────────────────

const GET_MY_ACTIVITY_TYPES = gql`
  query GetActivityTypesForTimeBlockForm {
    myActivityTypes {
      id
      name
      color
    }
  }
`;

const CREATE_TIME_BLOCK = gql`
  mutation CreateTimeBlock($input: CreateTimeBlockArgs!) {
    myCreateTimeBlock(input: $input) {
      id
      activityTypeId
      daysOfWeek
      startTime
      endTime
    }
  }
`;

// ─── Constants ─────────────────────────────────────────────────────────────

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

// ─── Validation Schema ──────────────────────────────────────────────────────

const timeBlockSchema = z
  .object({
    activityTypeId: z.string().optional(),
    daysOfWeek: z
      .array(z.number().int().min(0).max(6))
      .min(1, 'Select at least one day')
      .max(7)
      .refine((days) => new Set(days).size === days.length, {
        message: 'Days of week must be unique',
      }),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

type TimeBlockFormValues = z.infer<typeof timeBlockSchema>;

// ─── Types ─────────────────────────────────────────────────────────────────

interface ActivityType {
  id: string;
  name: string;
  color: string;
}

// ─── Props ─────────────────────────────────────────────────────────────────

type TimeBlockFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// ─── Component ─────────────────────────────────────────────────────────────

export function TimeBlockForm({ open, onOpenChange }: TimeBlockFormProps) {
  const { data: activityTypesData } = useQuery<{
    myActivityTypes: ActivityType[];
  }>(GET_MY_ACTIVITY_TYPES);

  const [createTimeBlock] = useMutation(CREATE_TIME_BLOCK, {
    refetchQueries: ['GetMyTimeBlocks'],
  });

  const form = useAppForm({
    defaultValues: {
      activityTypeId: undefined,
      daysOfWeek: [1], // Monday by default
      startTime: '09:00',
      endTime: '10:00',
    } as TimeBlockFormValues,
    validators: {
      onChange: timeBlockSchema,
    },
    onSubmit: async ({ value }) => {
      await createTimeBlock({
        variables: {
          input: {
            activityTypeId: value.activityTypeId,
            daysOfWeek: value.daysOfWeek,
            startTime: value.startTime,
            endTime: value.endTime,
          },
        },
      });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>New Time Block</DialogTitle>
          <DialogDescription>
            Define a recurring time slot for a specific activity type.
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <Form className="space-y-4">
            {/* Activity Type */}
            <form.AppField name="activityTypeId">
              {(field) => (
                <Field>
                  <FieldLabel>Activity Type</FieldLabel>
                  <FieldControl>
                    <Select
                      value={field.state.value ?? ''}
                      onValueChange={(v) => field.handleChange(v || undefined)}
                    >
                      <SelectTrigger onBlur={field.handleBlur}>
                        <SelectValue placeholder="Select activity type (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {(activityTypesData?.myActivityTypes ?? []).map(
                          (at) => (
                            <SelectItem key={at.id} value={at.id}>
                              <span className="flex items-center gap-2">
                                <span
                                  className="inline-block h-3 w-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: at.color }}
                                />
                                {at.name}
                              </span>
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </FieldControl>
                  <FieldError />
                </Field>
              )}
            </form.AppField>

            {/* Days of Week — toggle button group */}
            <form.AppField name="daysOfWeek">
              {(field) => (
                <div className="space-y-2">
                  <FieldLabel>Days of Week</FieldLabel>
                  <div className="flex gap-1 flex-wrap">
                    {DAY_NAMES.map((day, index) => {
                      const current = field.state.value as number[];
                      const selected = current.includes(index);
                      const isLastSelected = selected && current.length === 1;
                      return (
                        <button
                          key={day}
                          type="button"
                          disabled={isLastSelected}
                          onClick={() => {
                            if (selected) {
                              if (isLastSelected) return;
                              field.handleChange(
                                current.filter((d) => d !== index),
                              );
                            } else {
                              field.handleChange(
                                [...current, index].sort((a, b) => a - b),
                              );
                            }
                          }}
                          className={cn(
                            'px-2 py-1 rounded text-sm font-medium border transition-colors',
                            selected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background text-foreground border-border hover:bg-muted',
                            isLastSelected && 'opacity-60 cursor-not-allowed',
                          )}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {(() => {
                        const err = field.state.meta.errors[0];
                        if (typeof err === 'string') return err;
                        if (err && typeof err === 'object' && 'message' in err)
                          return String((err as { message: unknown }).message);
                        return String(err);
                      })()}
                    </p>
                  )}
                </div>
              )}
            </form.AppField>

            {/* Start + End Time — two columns */}
            <div className="grid grid-cols-2 gap-4">
              {/* Start Time */}
              <form.AppField name="startTime">
                {(field) => (
                  <Field>
                    <FieldLabel>Start Time</FieldLabel>
                    <FieldControl>
                      <Input
                        type="time"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </FieldControl>
                    <FieldError />
                  </Field>
                )}
              </form.AppField>

              {/* End Time */}
              <form.AppField name="endTime">
                {(field) => (
                  <Field>
                    <FieldLabel>End Time</FieldLabel>
                    <FieldControl>
                      <Input
                        type="time"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </FieldControl>
                    <FieldError />
                  </Field>
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
                      {isSubmitting ? 'Saving...' : 'Create Time Block'}
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
