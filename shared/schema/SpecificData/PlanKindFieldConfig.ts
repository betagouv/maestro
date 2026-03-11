import z from 'zod';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';

export const FieldOption = z.object({
  value: z.string(),
  label: z.string(),
  order: z.number()
});

export const SachaFieldOption = FieldOption.extend({
  sachaCommemoratifValueSigle: z.string().nullable()
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
  hintText: z.string().nullable(),
  options: z.array(FieldOption)
});

export const SachaFieldConfig = FieldConfig.extend({
  sachaCommemoratifSigle: z.string().nullable(),
  inDai: z.boolean(),
  optional: z.boolean(),
  options: z.array(SachaFieldOption)
});

export const PlanKindFieldConfig = z.object({
  programmingPlanKind: ProgrammingPlanKind,
  required: z.boolean(),
  order: z.number(),
  field: FieldConfig
});

export type FieldOption = z.infer<typeof FieldOption>;
export type SachaFieldOption = z.infer<typeof SachaFieldOption>;
export type FieldConfig = z.infer<typeof FieldConfig>;
export type SachaFieldConfig = z.infer<typeof SachaFieldConfig>;
export type PlanKindFieldConfig = z.infer<typeof PlanKindFieldConfig>;
