import type {
  CreateTodoMutation,
  CreateTodoMutationVariables,
  Todo_TodoListFragment,
  UpdateTodoMutation,
  UpdateTodoMutationVariables,
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
import { useAppForm } from '@/hooks/form-hook';
import { useMutation } from '@apollo/client/react';
import { Check } from 'lucide-react';
import { z } from 'zod';

// ─── GraphQL Operations ────────────────────────────────────────────────────

const CREATE_TODO = graphql(`
  mutation CreateTodo($input: CreateTodoArgs!) {
    myCreateTodo(input: $input) {
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
      scheduledAt
      completedAt
    }
  }
`);

const UPDATE_TODO = graphql(`
  mutation UpdateTodo($input: UpdateTodoArgs!) {
    myUpdateTodo(input: $input) {
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
      scheduledAt
      completedAt
    }
  }
`);

const COMPLETE_TODO = graphql(`
  mutation CompleteTodoFromForm($id: ID!) {
    myCompleteTodo(id: $id) {
      id
      completedAt
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

// ─── Validation Schema ──────────────────────────────────────────────────────

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Max 200 characters'),
  description: z.string().max(2000, 'Max 2000 characters'),
  activityTypeId: z.string().uuid('Activity type is required'),
  priority: z.string().min(1, 'Priority is required'),
  estimatedLength: z.string().min(1, 'Duration is required'),
});

type TodoFormValues = z.infer<typeof todoSchema>;

// ─── Types ─────────────────────────────────────────────────────────────────

type Todo = Todo_TodoListFragment;

// ─── Props ─────────────────────────────────────────────────────────────────

type TodoFormProps = {
  todo?: Todo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// ─── Component ─────────────────────────────────────────────────────────────

export function TodoForm({ todo, open, onOpenChange }: TodoFormProps) {
  const isEdit = todo !== undefined;

  const [createTodo] = useMutation<
    CreateTodoMutation,
    CreateTodoMutationVariables
  >(CREATE_TODO, {
    refetchQueries: ['GetMyTodos'],
  });

  const [updateTodo] = useMutation<
    UpdateTodoMutation,
    UpdateTodoMutationVariables
  >(UPDATE_TODO, {
    refetchQueries: ['GetMyTodos'],
  });

  const [completeTodo, { loading: completing }] = useMutation(COMPLETE_TODO, {
    refetchQueries: ['GetMyTodos'],
  });

  const form = useAppForm({
    defaultValues: {
      title: todo?.title ?? '',
      description: todo?.description ?? '',
      activityTypeId: todo?.activityType?.id ?? '',
      priority: String(todo?.priority ?? 0),
      estimatedLength: String(todo?.estimatedLength ?? 30),
    } as TodoFormValues,
    validators: {
      onChange: todoSchema,
    },
    onSubmit: async ({ value }) => {
      if (isEdit) {
        await updateTodo({
          variables: {
            input: {
              id: todo.id,
              title: value.title,
              description: value.description ?? null,
              activityTypeId: value.activityTypeId,
              priority: Number(value.priority),
              estimatedLength: Number(value.estimatedLength),
            },
          },
        });
      } else {
        await createTodo({
          variables: {
            input: {
              title: value.title,
              description: value.description ?? null,
              activityTypeId: value.activityTypeId,
              priority: Number(value.priority),
              estimatedLength: Number(value.estimatedLength),
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
          <DialogTitle>{isEdit ? 'Edit Todo' : 'New Todo'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details of your todo.'
              : 'Add a new task to your list.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <Form className="space-y-4">
            <form.AppField name="title">
              {(field) => (
                <field.InputField
                  label="Title"
                  placeholder="What needs to be done?"
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
                  <FieldLabel>Activity Type</FieldLabel>
                  <FieldControl>
                    <ActivityTypeSelect
                      value={field.state.value || undefined}
                      onValueChange={(v) => field.handleChange(v ?? '')}
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

            <DialogFooter className="flex items-center justify-between">
              <div>
                {isEdit && !todo?.completedAt && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={completing}
                    onClick={async () => {
                      await completeTodo({ variables: { id: todo?.id } });
                      onOpenChange(false);
                    }}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Mark Complete
                  </Button>
                )}
                {isEdit && !!todo?.completedAt && (
                  <span className="text-sm text-muted-foreground">
                    ✓ Completed
                  </span>
                )}
              </div>
              <div className="flex gap-2">
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
              </div>
            </DialogFooter>
          </Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
