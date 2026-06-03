import z from 'zod';
import { ProgrammingSubPlanId } from '../ProgrammingPlan/ProgrammingSubPlan';
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

export const ProgrammingSubPlanFieldId = z
  .string()
  .brand<'ProgrammingSubPlanFieldId'>();
export type ProgrammingSubPlanFieldId = z.infer<
  typeof ProgrammingSubPlanFieldId
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

export const fieldInputTypeHasOptions = (inputType: FieldInputType): boolean =>
  inputType === 'select' ||
  inputType === 'selectWithUnknown' ||
  inputType === 'radio';

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

export const ProgrammingSubPlanFieldConfig = z.object({
  programmingSubPlanId: ProgrammingSubPlanId,
  required: z.boolean(),
  order: z.number(),
  field: FieldConfig,
  id: ProgrammingSubPlanFieldId
});

export type FieldConfig = z.infer<typeof FieldConfig>;
export type SachaFieldConfig = z.infer<typeof SachaFieldConfig>;
export type ProgrammingSubPlanFieldConfig = z.infer<
  typeof ProgrammingSubPlanFieldConfig
>;
