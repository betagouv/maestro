import type { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import type { CommemoratifValueSigle } from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import type {
  AdminFieldConfig,
  AdminFieldOption,
  CreateFieldInput,
  CreateFieldOptionInput,
  CreatePlanKindFieldInput,
  UpdateFieldInput,
  UpdateFieldOptionInput,
  UpdatePlanKindFieldInput
} from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import {
  FieldInputType,
  type PlanKindFieldConfig,
  type ProgrammingPlanKindFieldId,
  type SachaFieldConfig,
  type SpecificDataFieldId,
  type SpecificDataFieldOptionId
} from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import { kysely } from './kysely';

const findByPlanKind = async (
  programmingPlanId: string,
  kind: ProgrammingPlanKind
): Promise<PlanKindFieldConfig[]> => {
  console.info('Find specific data field configs for plan kind', kind);

  const planKindFields = await kysely
    .selectFrom('programmingPlanKindFields as ppkf')
    .innerJoin('specificDataFields as sdf', 'sdf.id', 'ppkf.fieldId')
    .select([
      'ppkf.id',
      'ppkf.kind',
      'ppkf.required',
      'ppkf.order',
      'sdf.key',
      'sdf.inputType',
      'sdf.label',
      'sdf.hintText'
    ])
    .where('ppkf.programmingPlanId', '=', programmingPlanId)
    .where('ppkf.kind', '=', kind)
    .orderBy('ppkf.order')
    .execute();

  if (planKindFields.length === 0) {
    return [];
  }

  const planKindFieldIds = planKindFields.map((f) => f.id);

  const options = await kysely
    .selectFrom('programmingPlanKindFieldOptions as ppkfo')
    .innerJoin(
      'specificDataFieldOptions as sdfo',
      'sdfo.id',
      'ppkfo.specificDataFieldOptionId'
    )
    .select([
      'ppkfo.programmingPlanKindFieldId',
      'sdfo.value',
      'sdfo.label',
      'sdfo.order'
    ])
    .where('ppkfo.programmingPlanKindFieldId', 'in', planKindFieldIds)
    .orderBy('sdfo.order')
    .execute();

  const optionsByFieldId = options.reduce<
    Record<string, { value: string; label: string; order: number }[]>
  >((acc, opt) => {
    const id = opt.programmingPlanKindFieldId;
    if (!acc[id]) acc[id] = [];
    acc[id].push({ value: opt.value, label: opt.label, order: opt.order });
    return acc;
  }, {});

  return planKindFields.map((f) => ({
    id: f.id,
    programmingPlanKind: f.kind,
    required: f.required,
    order: f.order,
    field: {
      key: f.key,
      inputType: FieldInputType.parse(f.inputType),
      label: f.label,
      hintText: f.hintText,
      options: optionsByFieldId[f.id] ?? []
    }
  }));
};

const findSachaFields = async (): Promise<SachaFieldConfig[]> => {
  console.info(
    'Find specific data field configs for Sacha (non-PPV plan kinds)'
  );

  const fields = await kysely
    .selectFrom('specificDataFields as sdf')
    .innerJoin('programmingPlanKindFields as ppkf', 'ppkf.fieldId', 'sdf.id')
    .select([
      'sdf.id',
      'sdf.key',
      'sdf.inputType',
      'sdf.label',
      'sdf.hintText',
      'sdf.sachaCommemoratifSigle',
      'sdf.sachaInDai',
      'sdf.sachaOptional'
    ])
    .where('ppkf.kind', '!=', 'PPV')
    .distinctOn('sdf.id')
    .execute();

  if (fields.length === 0) {
    return [];
  }

  const fieldKeys = fields.map((f) => f.key);

  const options = await kysely
    .selectFrom('specificDataFieldOptions as sdfo')
    .select([
      'sdfo.fieldKey',
      'sdfo.value',
      'sdfo.label',
      'sdfo.order',
      'sdfo.sachaCommemoratifValueSigle'
    ])
    .where('sdfo.fieldKey', 'in', fieldKeys)
    .orderBy('sdfo.order')
    .execute();

  const optionsByFieldKey = options.reduce<
    Record<
      string,
      {
        value: string;
        label: string;
        order: number;
        sachaCommemoratifValueSigle: CommemoratifValueSigle | null;
      }[]
    >
  >((acc, opt) => {
    const key = opt.fieldKey;
    if (!acc[key]) acc[key] = [];
    acc[key].push({
      value: opt.value,
      label: opt.label,
      order: opt.order,
      sachaCommemoratifValueSigle: opt.sachaCommemoratifValueSigle ?? null
    });
    return acc;
  }, {});

  return fields.map((f) => ({
    key: f.key,
    inputType: FieldInputType.parse(f.inputType),
    label: f.label,
    hintText: f.hintText,
    sachaCommemoratifSigle: f.sachaCommemoratifSigle,
    inDai: f.sachaInDai,
    optional: f.sachaOptional,
    options: optionsByFieldKey[f.key] ?? []
  }));
};

const findAllFields = async (): Promise<AdminFieldConfig[]> => {
  console.info('Find all specific data field configs');

  const fields = await kysely
    .selectFrom('specificDataFields')
    .select(['id', 'key', 'inputType', 'label', 'hintText'])
    .orderBy('key')
    .execute();

  if (fields.length === 0) return [];

  const fieldKeys = fields.map((f) => f.key);

  const options = await kysely
    .selectFrom('specificDataFieldOptions')
    .select(['id', 'fieldKey', 'value', 'label', 'order'])
    .where('fieldKey', 'in', fieldKeys)
    .orderBy('order')
    .execute();

  const optionsByFieldKey = options.reduce<Record<string, AdminFieldOption[]>>(
    (acc, opt) => {
      if (!acc[opt.fieldKey]) acc[opt.fieldKey] = [];
      acc[opt.fieldKey].push({
        id: opt.id,
        value: opt.value,
        label: opt.label,
        order: opt.order
      });
      return acc;
    },
    {}
  );

  return fields.map((f) => ({
    id: f.id,
    key: f.key,
    inputType: FieldInputType.parse(f.inputType),
    label: f.label,
    hintText: f.hintText,
    options: optionsByFieldKey[f.key] ?? []
  }));
};

const createField = async (
  input: CreateFieldInput
): Promise<AdminFieldConfig> => {
  const field = await kysely
    .insertInto('specificDataFields')
    .values({
      key: input.key,
      inputType: input.inputType,
      label: input.label,
      hintText: input.hintText ?? null
    })
    .returning(['id', 'key', 'inputType', 'label', 'hintText'])
    .executeTakeFirstOrThrow();

  return {
    ...field,
    inputType: FieldInputType.parse(field.inputType),
    options: []
  };
};

const updateField = async (
  fieldId: SpecificDataFieldId,
  input: UpdateFieldInput
): Promise<AdminFieldConfig | null> => {
  const field = await kysely
    .updateTable('specificDataFields')
    .set({
      ...(input.inputType !== undefined && { inputType: input.inputType }),
      ...(input.label !== undefined && { label: input.label }),
      ...(input.hintText !== undefined && { hintText: input.hintText })
    })
    .where('id', '=', fieldId)
    .returning(['id', 'key', 'inputType', 'label', 'hintText'])
    .executeTakeFirst();

  if (!field) return null;

  const options = await kysely
    .selectFrom('specificDataFieldOptions')
    .select(['id', 'value', 'label', 'order'])
    .where('fieldKey', '=', field.key)
    .orderBy('order')
    .execute();

  return {
    ...field,
    inputType: FieldInputType.parse(field.inputType),
    options: options.map((o) => ({
      id: o.id,
      value: o.value,
      label: o.label,
      order: o.order
    }))
  };
};

const deleteField = async (fieldId: SpecificDataFieldId): Promise<void> => {
  await kysely
    .deleteFrom('specificDataFields')
    .where('id', '=', fieldId)
    .execute();
};

const createFieldOption = async (
  fieldId: SpecificDataFieldId,
  input: CreateFieldOptionInput
): Promise<AdminFieldOption | null> => {
  const field = await kysely
    .selectFrom('specificDataFields')
    .select('key')
    .where('id', '=', fieldId)
    .executeTakeFirst();

  if (!field) return null;

  return kysely
    .insertInto('specificDataFieldOptions')
    .values({
      fieldKey: field.key,
      value: input.value,
      label: input.label,
      order: input.order,
      sachaCommemoratifValueSigle: null
    })
    .returning(['id', 'value', 'label', 'order'])
    .executeTakeFirstOrThrow();
};

const updateFieldOption = async (
  optionId: SpecificDataFieldOptionId,
  input: UpdateFieldOptionInput
): Promise<AdminFieldOption | null> => {
  const option = await kysely
    .updateTable('specificDataFieldOptions')
    .set({
      ...(input.value !== undefined && { value: input.value }),
      ...(input.label !== undefined && { label: input.label }),
      ...(input.order !== undefined && { order: input.order })
    })
    .where('id', '=', optionId)
    .returning(['id', 'value', 'label', 'order'])
    .executeTakeFirst();

  return option ?? null;
};

const deleteFieldOption = async (
  optionId: SpecificDataFieldOptionId
): Promise<void> => {
  await kysely
    .deleteFrom('specificDataFieldOptions')
    .where('id', '=', optionId)
    .execute();
};

const addFieldToPlanKind = async (
  programmingPlanId: string,
  kind: ProgrammingPlanKind,
  input: CreatePlanKindFieldInput
): Promise<PlanKindFieldConfig | null> => {
  const inserted = await kysely
    .insertInto('programmingPlanKindFields')
    .values({
      programmingPlanId,
      kind,
      fieldId: input.fieldId,
      required: input.required,
      order: input.order
    })
    .returning(['id', 'kind', 'required', 'order', 'fieldId'])
    .executeTakeFirst();

  if (!inserted) return null;

  const field = await kysely
    .selectFrom('specificDataFields')
    .select(['key', 'inputType', 'label', 'hintText'])
    .where('id', '=', inserted.fieldId)
    .executeTakeFirst();

  if (!field) return null;

  return {
    id: inserted.id,
    programmingPlanKind: inserted.kind,
    required: inserted.required,
    order: inserted.order,
    field: {
      key: field.key,
      inputType: FieldInputType.parse(field.inputType),
      label: field.label,
      hintText: field.hintText,
      options: []
    }
  };
};

const updatePlanKindField = async (
  planKindFieldId: ProgrammingPlanKindFieldId,
  input: UpdatePlanKindFieldInput
): Promise<PlanKindFieldConfig | null> => {
  const updated = await kysely
    .updateTable('programmingPlanKindFields')
    .set({ required: input.required, order: input.order })
    .where('id', '=', planKindFieldId)
    .returning(['id', 'kind', 'required', 'order', 'fieldId'])
    .executeTakeFirst();

  if (!updated) return null;

  const field = await kysely
    .selectFrom('specificDataFields')
    .select(['key', 'inputType', 'label', 'hintText'])
    .where('id', '=', updated.fieldId)
    .executeTakeFirst();

  if (!field) return null;

  const options = await kysely
    .selectFrom('programmingPlanKindFieldOptions as ppkfo')
    .innerJoin(
      'specificDataFieldOptions as sdfo',
      'sdfo.id',
      'ppkfo.specificDataFieldOptionId'
    )
    .select(['sdfo.value', 'sdfo.label', 'sdfo.order'])
    .where('ppkfo.programmingPlanKindFieldId', '=', planKindFieldId)
    .orderBy('sdfo.order')
    .execute();

  return {
    id: updated.id,
    programmingPlanKind: updated.kind,
    required: updated.required,
    order: updated.order,
    field: {
      key: field.key,
      inputType: FieldInputType.parse(field.inputType),
      label: field.label,
      hintText: field.hintText,
      options
    }
  };
};

const removePlanKindField = async (
  planKindFieldId: ProgrammingPlanKindFieldId
): Promise<void> => {
  await kysely
    .deleteFrom('programmingPlanKindFields')
    .where('id', '=', planKindFieldId)
    .execute();
};

const replacePlanKindFieldOptions = async (
  planKindFieldId: ProgrammingPlanKindFieldId,
  optionIds: SpecificDataFieldOptionId[]
): Promise<void> => {
  await kysely
    .deleteFrom('programmingPlanKindFieldOptions')
    .where('programmingPlanKindFieldId', '=', planKindFieldId)
    .execute();

  if (optionIds.length > 0) {
    await kysely
      .insertInto('programmingPlanKindFieldOptions')
      .values(
        optionIds.map((optionId) => ({
          programmingPlanKindFieldId: planKindFieldId,
          specificDataFieldOptionId: optionId
        }))
      )
      .execute();
  }
};

export const specificDataFieldConfigRepository = {
  findByPlanKind,
  findSachaFields,
  findAllFields,
  createField,
  updateField,
  deleteField,
  createFieldOption,
  updateFieldOption,
  deleteFieldOption,
  addFieldToPlanKind,
  updatePlanKindField,
  removePlanKindField,
  replacePlanKindFieldOptions
};
