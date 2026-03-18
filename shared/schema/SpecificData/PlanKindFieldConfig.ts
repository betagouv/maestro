import z from 'zod';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import {
  CommemoratifSigle,
  CommemoratifValueSigle
} from '../SachaCommemoratif/SachaCommemoratif';

export const SpecificDataFieldId = z.string().brand<'SpecificDataFieldId'>();
export type SpecificDataFieldId = z.infer<typeof SpecificDataFieldId>;

export const SpecificDataFieldOptionId = z
  .string()
  .brand<'SpecificDataFieldOptionId'>();
export type SpecificDataFieldOptionId = z.infer<
  typeof SpecificDataFieldOptionId
>;

export const ProgrammingPlanKindFieldId = z
  .string()
  .brand<'ProgrammingPlanKindFieldId'>();
export type ProgrammingPlanKindFieldId = z.infer<
  typeof ProgrammingPlanKindFieldId
>;

const FieldOption = z.object({
  value: z.string(),
  label: z.string(),
  order: z.number()
});

const SachaFieldOption = FieldOption.extend({
  sachaCommemoratifValueSigle: CommemoratifValueSigle.nullable()
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
  sachaCommemoratifSigle: CommemoratifSigle.nullable(),
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

export type FieldConfig = z.infer<typeof FieldConfig>;
export type SachaFieldConfig = z.infer<typeof SachaFieldConfig>;
export type PlanKindFieldConfig = z.infer<typeof PlanKindFieldConfig>;
