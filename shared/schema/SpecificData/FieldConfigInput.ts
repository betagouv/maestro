import z from 'zod';
import {
  CommemoratifSigle,
  CommemoratifValueSigle
} from '../SachaCommemoratif/SachaCommemoratif';
import { FieldInheritance } from './FieldInheritance';
import {
  FieldInputType,
  SpecificDataFieldId,
  SpecificDataFieldOptionId
} from './ProgrammingSubPlanFieldConfig';

export const AdminFieldOption = z.object({
  id: SpecificDataFieldOptionId,
  value: z.string(),
  label: z.string(),
  order: z.number(),
  sachaCommemoratifValueSigle: CommemoratifValueSigle.nullable()
});
export type AdminFieldOption = z.infer<typeof AdminFieldOption>;

export const AdminFieldConfig = z.object({
  id: SpecificDataFieldId,
  key: z.string(),
  inputType: FieldInputType,
  label: z.string(),
  hintText: z.string().nullable(),
  sachaCommemoratifSigle: CommemoratifSigle.nullable(),
  sachaInDai: z.boolean(),
  sachaOptional: z.boolean(),
  options: z.array(AdminFieldOption)
});
export type AdminFieldConfig = z.infer<typeof AdminFieldConfig>;

export const CreateFieldInput = z.object({
  key: z.string().min(1),
  inputType: FieldInputType,
  label: z.string().min(1),
  hintText: z.string().optional()
});
export type CreateFieldInput = z.infer<typeof CreateFieldInput>;

export const UpdateFieldInput = z
  .object({
    inputType: FieldInputType,
    label: z.string().min(1),
    hintText: z.string().nullable()
  })
  .partial();
export type UpdateFieldInput = z.infer<typeof UpdateFieldInput>;

export const CreateFieldOptionInput = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  order: z.number().int().positive()
});
export type CreateFieldOptionInput = z.infer<typeof CreateFieldOptionInput>;

export const UpdateFieldOptionInput = CreateFieldOptionInput.partial();
export type UpdateFieldOptionInput = z.infer<typeof UpdateFieldOptionInput>;

export const ProgrammingPlanFieldSetting = z.object({
  fieldId: SpecificDataFieldId,
  required: z.boolean(),
  optionIds: z.array(SpecificDataFieldOptionId)
});
export type ProgrammingPlanFieldSetting = z.infer<
  typeof ProgrammingPlanFieldSetting
>;

export const ProgrammingSubPlanFieldSetting =
  ProgrammingPlanFieldSetting.extend({
    inheritance: FieldInheritance,
    managedAtPlanLevel: z.boolean()
  });
export type ProgrammingSubPlanFieldSetting = z.infer<
  typeof ProgrammingSubPlanFieldSetting
>;
