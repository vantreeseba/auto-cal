import {
  FieldDescription as FieldDescriptionPrimitive,
  FieldError as FieldErrorPrimitive,
  FieldLabel as FieldLabelPrimitive,
  Field as FieldPrimitive,
} from '@/components/ui/field';
import type { Label } from '@/components/ui/label';
import { Slot } from '@radix-ui/react-slot';
import { createFormHookContexts, useStore } from '@tanstack/react-form';
import * as React from 'react';

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

// Internal context for per-field unique IDs
const IdContext = React.createContext<string | null>(null);

function useFieldComponentContext() {
  const field = useFieldContext();
  const id = React.useContext(IdContext);

  if (!id) throw new Error('Form field components must be used within <Field>');

  const errors = useStore(field.store, (s) => s.meta.errors);
  const isTouched = useStore(field.store, (s) => s.meta.isTouched);
  const submissionAttempts = useStore(
    field.form.store,
    (s) => s.submissionAttempts,
  );

  return React.useMemo(() => {
    const showError = isTouched || submissionAttempts > 0;
    let errorMessage: string | null = null;

    if (showError && errors.length > 0) {
      const err = errors[0];
      if (typeof err === 'string') errorMessage = err;
      else if (err && typeof err === 'object' && 'message' in err)
        errorMessage = String((err as { message: unknown }).message);
      else if (err != null) errorMessage = String(err);
    }

    return {
      controlId: `${id}-control`,
      descriptionId: `${id}-description`,
      messageId: `${id}-message`,
      error: errorMessage,
      hasError: showError && errorMessage !== null,
    };
  }, [id, isTouched, submissionAttempts, errors]);
}

// <Form> — auto-handles submit event
function Form({ ...props }: React.ComponentProps<'form'>) {
  const form = useFormContext();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      {...props}
    />
  );
}

// <Field> — provides ID context, sets data-invalid
function Field({
  className,
  ...props
}: React.ComponentProps<typeof FieldPrimitive>) {
  const uid = React.useId();
  const field = useFieldContext();
  const errors = useStore(field.store, (s) => s.meta.errors);
  const isTouched = useStore(field.store, (s) => s.meta.isTouched);
  const submissionAttempts = useStore(
    field.form.store,
    (s) => s.submissionAttempts,
  );
  const hasError = (isTouched || submissionAttempts > 0) && errors.length > 0;

  return (
    <IdContext.Provider value={uid}>
      <FieldPrimitive
        data-invalid={hasError ? 'true' : undefined}
        className={className}
        {...props}
      />
    </IdContext.Provider>
  );
}

// <FieldLabel> — auto-wires htmlFor
function FieldLabel({ ...props }: React.ComponentProps<typeof Label>) {
  const { controlId } = useFieldComponentContext();
  return <FieldLabelPrimitive htmlFor={controlId} {...props} />;
}

// <FieldControl> — passes id + aria attrs to child via Slot
function FieldControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { controlId, descriptionId, messageId, hasError } =
    useFieldComponentContext();
  const describedBy = [descriptionId, hasError ? messageId : null]
    .filter(Boolean)
    .join(' ');
  return (
    <Slot
      id={controlId}
      aria-describedby={describedBy || undefined}
      aria-invalid={hasError || undefined}
      {...props}
    />
  );
}

// <FieldDescription> — auto-wires id
function FieldDescription({
  ...props
}: React.ComponentProps<typeof FieldDescriptionPrimitive>) {
  const { descriptionId } = useFieldComponentContext();
  return <FieldDescriptionPrimitive id={descriptionId} {...props} />;
}

// <FieldError> — auto-reads errors from context
function FieldError({
  ...props
}: React.ComponentProps<typeof FieldErrorPrimitive>) {
  const { error, messageId } = useFieldComponentContext();
  if (!error) return null;
  return (
    <FieldErrorPrimitive id={messageId} {...props}>
      {error}
    </FieldErrorPrimitive>
  );
}

export { Form, Field, FieldLabel, FieldControl, FieldDescription, FieldError };
