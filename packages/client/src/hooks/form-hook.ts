import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  fieldContext,
  formContext,
} from '@/components/ui/form';
import { createFormHook } from '@tanstack/react-form';

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    Field,
    Label: FieldLabel,
    Control: FieldControl,
    Description: FieldDescription,
    Error: FieldError,
  },
  formComponents: {},
});
