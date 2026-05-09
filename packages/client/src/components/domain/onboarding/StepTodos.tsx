import type {
  CreateTodoMutation,
  CreateTodoMutationVariables,
} from '@/__generated__/graphql.js';
import { graphql } from '@/__generated__/index.js';
import { ActivityTypeSelect } from '@/components/domain/activity-type/ActivityTypeSelect';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
  Form,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppForm } from '@/hooks/form-hook';
import { useMutation, useQuery } from '@apollo/client/react';
import { ArrowLeft, CheckCircle2, Plus, SkipForward } from 'lucide-react';
import { z } from 'zod';

const GET_TODOS = graphql(`
  query GetMyTodosForOnboarding {
    myTodos {
      id
      title
      priority
      activityType { id name color }
    }
  }
`);

const CREATE_TODO = graphql(`
  mutation CreateTodoOnboarding($input: CreateTodoArgs!) {
    myCreateTodo(input: $input) {
      id
      title
    }
  }
`);

const PRIORITY_OPTIONS = [
  { label: 'Low', value: '0' },
  { label: 'Medium', value: '25' },
  { label: 'High', value: '50' },
  { label: 'Urgent', value: '100' },
] as const;

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  activityTypeId: z.string().uuid('Activity type is required'),
  priority: z.number().int().min(0).max(100),
});

type FormValues = z.infer<typeof schema>;

interface StepTodosProps {
  onBack: () => void;
  onFinish: () => void;
  onSkip: () => void;
}

export function StepTodos({ onBack, onFinish, onSkip }: StepTodosProps) {
  const { data } = useQuery(GET_TODOS);
  const todos = data?.myTodos ?? [];

  const [createTodo] = useMutation<
    CreateTodoMutation,
    CreateTodoMutationVariables
  >(CREATE_TODO, { refetchQueries: ['GetMyTodosForOnboarding', 'GetMyTodos'] });

  const form = useAppForm({
    defaultValues: {
      title: '',
      activityTypeId: '',
      priority: 0,
    } as FormValues,
    validators: { onChange: schema },
    onSubmit: async ({ value, formApi }) => {
      await createTodo({
        variables: {
          input: {
            title: value.title,
            activityTypeId: value.activityTypeId,
            priority: value.priority,
            estimatedLength: 30,
          },
        },
      });
      formApi.reset();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add your first todos</CardTitle>
        <CardDescription>
          Todos are one-time tasks the scheduler places into your time blocks.
          This step is optional — you can add todos any time.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form.AppForm>
          <Form className="space-y-4">
            {/* Title */}
            <form.AppField name="title">
              {(field) => (
                <field.InputField
                  label="Title"
                  placeholder="e.g. Review Q2 report, Call dentist"
                />
              )}
            </form.AppField>

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
                          {PRIORITY_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldControl>
                    <FieldError />
                  </Field>
                )}
              </form.AppField>

              {/* Activity type */}
              <form.AppField name="activityTypeId">
                {(field) => (
                  <Field>
                    <FieldLabel>Activity type</FieldLabel>
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
            </div>

            <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || !!isSubmitting}>
                  <Plus className="mr-1 h-4 w-4" />
                  {isSubmitting ? 'Adding…' : 'Add todo'}
                </Button>
              )}
            </form.Subscribe>
          </Form>
        </form.AppForm>

        {/* Created list */}
        {todos.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Created ({todos.length})
            </p>
            <div className="divide-y rounded-md border">
              {todos.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 px-3 py-2 text-sm"
                >
                  {t.activityType && (
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: t.activityType.color }}
                    />
                  )}
                  <span className="font-medium">{t.title}</span>
                  <span className="ml-auto text-muted-foreground text-xs">
                    priority {t.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onSkip}>
            <SkipForward className="mr-1 h-4 w-4" />
            Skip
          </Button>
          <Button onClick={onFinish}>
            <CheckCircle2 className="mr-1 h-4 w-4" />
            Finish setup
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
