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
import { Textarea } from '@/components/ui/textarea';
import { useAppForm } from '@/hooks/form-hook';
import { gql, useMutation, useQuery } from '@apollo/client';
import { z } from 'zod';

// ─── GraphQL Operations ────────────────────────────────────────────────────

const GET_MY_ACTIVITY_TYPES = gql`
  query GetActivityTypesForTodoForm {
    myActivityTypes {
      id
      name
      color
    }
  }
`;

const CREATE_TODO = gql`
  mutation CreateTodo($input: CreateTodoArgs!) {
    myCreateTodo(input: $input) {
      id
      title
      description
      activityTypeId
      priority
      estimatedLength
      scheduledAt
      completedAt
    }
  }
`;

const UPDATE_TODO = gql`
  mutation UpdateTodo($input: UpdateTodoArgs!) {
    myUpdateTodo(input: $input) {
      id
      title
      description
      activityTypeId
      priority
      estimatedLength
      scheduledAt
      completedAt
    }
  }
`;

// ─── Constants ─────────────────────────────────────────────────────────────

const PRIORITY_OPTIONS = [
  { label: 'Low', value: 0 },
  { label: 'Medium', value: 25 },
  { label: 'High', value: 50 },
  { label: 'Urgent', value: 100 },
] as const;

const DURATION_OPTIONS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
  { label: '4+ hours', value: 480 },
] as const;

// ─── Validation Schema ──────────────────────────────────────────────────────

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Max 200 characters'),
  description: z.string().max(2000, 'Max 2000 characters').optional(),
  activityTypeId: z.string().optional(),
  priority: z.number().int().min(0).max(100),
  estimatedLength: z.number().int().min(1, 'Duration is required').max(1440),
});

type TodoFormValues = z.infer<typeof todoSchema>;

// ─── Types ─────────────────────────────────────────────────────────────────

interface ActivityType {
  id: string;
  name: string;
  color: string;
}

interface Todo {
  id: string;
  title: string;
  description?: string | null;
  activityTypeId?: string | null;
  priority: number;
  estimatedLength: number;
  scheduledAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

// ─── Props ─────────────────────────────────────────────────────────────────

type TodoFormProps = {
  todo?: Todo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// ─── Component ─────────────────────────────────────────────────────────────

export function TodoForm({ todo, open, onOpenChange }: TodoFormProps) {
  const isEdit = todo !== undefined;

  const { data: activityTypesData } = useQuery<{
    myActivityTypes: ActivityType[];
  }>(GET_MY_ACTIVITY_TYPES);

  const [createTodo] = useMutation(CREATE_TODO, {
    refetchQueries: ['GetMyTodos'],
  });

  const [updateTodo] = useMutation(UPDATE_TODO, {
    refetchQueries: ['GetMyTodos'],
  });

  const form = useAppForm({
    defaultValues: {
      title: todo?.title ?? '',
      description: todo?.description ?? '',
      activityTypeId: todo?.activityTypeId ?? undefined,
      priority: todo?.priority ?? 0,
      estimatedLength: todo?.estimatedLength ?? 30,
    } as TodoFormValues,
    validators: {
      onChange: todoSchema,
    },
    onSubmit: async ({ value }) => {
      if (isEdit) {
        await updateTodo({
          variables: { input: { id: todo.id, ...value } },
        });
      } else {
        await createTodo({ variables: { input: value } });
      }
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Todo' : 'New Todo'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details of your todo.'
              : 'Add a new task to your list.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <Form className="space-y-4">
            {/* Title */}
            <form.AppField name="title">
              {(field) => (
                <Field>
                  <FieldLabel>Title</FieldLabel>
                  <FieldControl>
                    <Input
                      placeholder="What needs to be done?"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </FieldControl>
                  <FieldError />
                </Field>
              )}
            </form.AppField>

            {/* Description */}
            <form.AppField name="description">
              {(field) => (
                <Field>
                  <FieldLabel>Description (optional)</FieldLabel>
                  <FieldControl>
                    <Textarea
                      placeholder="Add any notes or details..."
                      value={field.state.value ?? ''}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </FieldControl>
                  <FieldError />
                </Field>
              )}
            </form.AppField>

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

            {/* Priority + Duration — two columns */}
            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <form.AppField name="priority">
                {(field) => (
                  <Field>
                    <FieldLabel>Priority</FieldLabel>
                    <FieldControl>
                      <Select
                        value={String(field.state.value)}
                        onValueChange={(v) => field.handleChange(Number(v))}
                      >
                        <SelectTrigger onBlur={field.handleBlur}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map(({ label, value }) => (
                            <SelectItem key={value} value={String(value)}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldControl>
                    <FieldError />
                  </Field>
                )}
              </form.AppField>

              {/* Estimated Length */}
              <form.AppField name="estimatedLength">
                {(field) => (
                  <Field>
                    <FieldLabel>Duration</FieldLabel>
                    <FieldControl>
                      <Select
                        value={String(field.state.value)}
                        onValueChange={(v) => field.handleChange(Number(v))}
                      >
                        <SelectTrigger onBlur={field.handleBlur}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DURATION_OPTIONS.map(({ label, value }) => (
                            <SelectItem key={value} value={String(value)}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      {isSubmitting
                        ? 'Saving...'
                        : isEdit
                          ? 'Save Changes'
                          : 'Create Todo'}
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
