import z from 'zod';
import {
  FieldInputType,
  SpecificDataFieldId,
  SpecificDataFieldOptionId
} from './PlanKindFieldConfig';

export const AdminFieldOption = z.object({
  id: SpecificDataFieldOptionId,
  value: z.string(),
  label: z.string(),
  order: z.number()
});
export type AdminFieldOption = z.infer<typeof AdminFieldOption>;

export const AdminFieldConfig = z.object({
  id: SpecificDataFieldId,
  key: z.string(),
  inputType: FieldInputType,
  label: z.string(),
  hintText: z.string().nullable(),
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

export const CreatePlanKindFieldInput = z.object({
  fieldId: SpecificDataFieldId,
  required: z.boolean(),
  order: z.number().int().nonnegative()
});
export type CreatePlanKindFieldInput = z.infer<typeof CreatePlanKindFieldInput>;

export const UpdatePlanKindFieldInput = CreatePlanKindFieldInput.pick({
  required: true,
  order: true
});
export type UpdatePlanKindFieldInput = z.infer<typeof UpdatePlanKindFieldInput>;
