import { gql, useMutation } from '@apollo/client';
import { Trash2 } from 'lucide-react';
import { z } from 'zod';
import { useAppForm } from '../hooks/form-hook';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Field, FieldControl, FieldError, FieldLabel, Form } from './ui/form';
import { Input } from './ui/input';

// ─── GraphQL Operations ─────────────────────────────────────────────────────

const CREATE_ACTIVITY_TYPE = gql`
  mutation CreateActivityType($input: CreateActivityTypeArgs!) {
    myCreateActivityType(input: $input) {
      id
      name
      color
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_ACTIVITY_TYPE = gql`
  mutation UpdateActivityType($input: UpdateActivityTypeArgs!) {
    myUpdateActivityType(input: $input) {
      id
      name
      color
      createdAt
      updatedAt
    }
  }
`;

const DELETE_ACTIVITY_TYPE = gql`
  mutation DeleteActivityType($id: ID!) {
    myDeleteActivityType(id: $id)
  }
`;

// ─── Validation Schema ──────────────────────────────────────────────────────

const activityTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color like #6366f1'),
});

type ActivityTypeFormValues = z.infer<typeof activityTypeSchema>;

// ─── Types ──────────────────────────────────────────────────────────────────

interface ActivityType {
  id: string;
  name: string;
  color: string;
}

interface ActivityTypeFormProps {
  activityType?: ActivityType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ActivityTypeForm({
  activityType,
  open,
  onOpenChange,
}: ActivityTypeFormProps) {
  const isEdit = !!activityType;

  const [createActivityType] = useMutation(CREATE_ACTIVITY_TYPE, {
    refetchQueries: ['GetMyActivityTypes'],
  });

  const [updateActivityType] = useMutation(UPDATE_ACTIVITY_TYPE, {
    refetchQueries: ['GetMyActivityTypes'],
  });

  const [deleteActivityType] = useMutation(DELETE_ACTIVITY_TYPE, {
    refetchQueries: ['GetMyActivityTypes'],
  });

  const form = useAppForm({
    defaultValues: {
      name: activityType?.name ?? '',
      color: activityType?.color ?? '#6366f1',
    } as ActivityTypeFormValues,
    validators: { onChange: activityTypeSchema },
    onSubmit: async ({ value }) => {
      if (isEdit && activityType) {
        await updateActivityType({
          variables: { input: { id: activityType.id, ...value } },
        });
      } else {
        await createActivityType({ variables: { input: value } });
      }
      onOpenChange(false);
    },
  });

  const handleDelete = async () => {
    if (!activityType) return;
    await deleteActivityType({ variables: { id: activityType.id } });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Activity Type' : 'New Activity Type'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the name or color of this activity type.'
              : 'Create a new activity type to categorize your todos, habits, and time blocks.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <Form className="space-y-4">
            <div className="flex flex-col gap-4 py-2">
              {/* Name */}
              <form.AppField name="name">
                {(field) => (
                  <Field>
                    <FieldLabel>Name</FieldLabel>
                    <FieldControl>
                      <Input
                        placeholder="e.g. Work, Exercise, Learning"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </FieldControl>
                    <FieldError />
                  </Field>
                )}
              </form.AppField>

              {/* Color */}
              <form.AppField name="color">
                {(field) => (
                  <Field>
                    <FieldLabel>Color</FieldLabel>
                    <FieldControl>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className="h-10 w-16 cursor-pointer rounded border border-input bg-background p-1"
                        />
                        <Input
                          placeholder="#6366f1"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className="font-mono"
                        />
                      </div>
                    </FieldControl>
                    <FieldError />
                  </Field>
                )}
              </form.AppField>
            </div>

            <DialogFooter className="mt-4 flex items-center justify-between">
              <div>
                {isEdit && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit || !!isSubmitting}
                    >
                      {isSubmitting
                        ? 'Saving...'
                        : isEdit
                          ? 'Save Changes'
                          : 'Create'}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </DialogFooter>
          </Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
