import z from 'zod';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';

export const FieldOption = z.object({
  value: z.string(),
  label: z.string(),
  order: z.number()
});

export const FieldInputType = z.enum([
  'text',
  'number',
  'textarea',
  'select',
  'selectWithUnknown',
  'checkbox',
  'radio'
]);
export type FieldInputType = z.infer<typeof FieldInputType>;

export const FieldConfig = z.object({
  key: z.string(),
  inputType: FieldInputType,
  label: z.string(),
  whenValid: z.string(),
  hintText: z.string().nullable(),
  defaultOptionLabel: z.string().nullable(),
  options: z.array(FieldOption)
});

export const PlanKindFieldConfig = z.object({
  programmingPlanKind: ProgrammingPlanKind,
  required: z.boolean(),
  order: z.number(),
  field: FieldConfig
});

export type FieldOption = z.infer<typeof FieldOption>;
export type FieldConfig = z.infer<typeof FieldConfig>;
export type PlanKindFieldConfig = z.infer<typeof PlanKindFieldConfig>;
