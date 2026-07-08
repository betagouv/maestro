import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type { CommemoratifValueSigle } from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import type {
  AdminFieldConfig,
  AdminFieldOption,
  CreateFieldInput,
  CreateFieldOptionInput,
  CreateProgrammingSubPlanFieldInput,
  UpdateFieldInput,
  UpdateFieldOptionInput,
  UpdateProgrammingSubPlanFieldInput
} from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import {
  FieldInputType,
  type ProgrammingSubPlanFieldConfig,
  type ProgrammingSubPlanFieldId,
  type SachaFieldConfig,
  type SpecificDataFieldId,
  type SpecificDataFieldOptionId
} from 'maestro-shared/schema/SpecificData/ProgrammingSubPlanFieldConfig';
import { kysely } from './kysely';

const findByPlanSubPlan = async (
  programmingSubPlanId: ProgrammingSubPlanId
): Promise<ProgrammingSubPlanFieldConfig[]> => {
  console.info(
    'Find specific data field configs for sub-plan',
    programmingSubPlanId
  );

  const programmingSubPlanFields = await kysely
    .selectFrom('programmingSubPlanFields as ppkf')
    .innerJoin('specificDataFields as sdf', 'sdf.id', 'ppkf.fieldId')
    .select([
      'ppkf.id',
      'ppkf.programmingSubPlanId',
      'ppkf.required',
      'ppkf.order',
      'sdf.key',
      'sdf.inputType',
      'sdf.label',
      'sdf.hintText'
    ])
    .where('ppkf.programmingSubPlanId', '=', programmingSubPlanId)
    .orderBy('ppkf.order')
    .execute();

  if (programmingSubPlanFields.length === 0) {
    return [];
  }

  const programmingSubPlanFieldIds = programmingSubPlanFields.map((f) => f.id);

  const options = await kysely
    .selectFrom('programmingSubPlanFieldOptions as ppkfo')
    .innerJoin(
      'specificDataFieldOptions as sdfo',
      'sdfo.id',
      'ppkfo.specificDataFieldOptionId'
    )
    .select([
      'ppkfo.programmingSubPlanFieldId',
      'sdfo.value',
      'sdfo.label',
      'sdfo.order'
    ])
    .where('ppkfo.programmingSubPlanFieldId', 'in', programmingSubPlanFieldIds)
    .orderBy('sdfo.order')
    .execute();

  const optionsByFieldId = options.reduce<
    Record<string, { value: string; label: string; order: number }[]>
  >((acc, opt) => {
    const id = opt.programmingSubPlanFieldId;
    if (!acc[id]) acc[id] = [];
    acc[id].push({ value: opt.value, label: opt.label, order: opt.order });
    return acc;
  }, {});

  return programmingSubPlanFields.map((f) => ({
    id: f.id,
    programmingSubPlanId: f.programmingSubPlanId,
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
  console.info('Find specific data field configs for Sacha sub-plans');

  const fields = await kysely
    .selectFrom('specificDataFields as sdf')
    .innerJoin('programmingSubPlanFields as ppkf', 'ppkf.fieldId', 'sdf.id')
    .innerJoin(
      'programmingSubPlans as psp',
      'psp.id',
      'ppkf.programmingSubPlanId'
    )
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
    .where('psp.subPlanNumber', '!=', 'PPV')
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
    .select([
      'id',
      'key',
      'inputType',
      'label',
      'hintText',
      'sachaCommemoratifSigle',
      'sachaInDai',
      'sachaOptional'
    ])
    .orderBy('key')
    .execute();

  if (fields.length === 0) return [];

  const fieldKeys = fields.map((f) => f.key);

  const options = await kysely
    .selectFrom('specificDataFieldOptions')
    .select([
      'id',
      'fieldKey',
      'value',
      'label',
      'order',
      'sachaCommemoratifValueSigle'
    ])
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
        order: opt.order,
        sachaCommemoratifValueSigle: opt.sachaCommemoratifValueSigle
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
    sachaCommemoratifSigle: f.sachaCommemoratifSigle,
    sachaInDai: f.sachaInDai,
    sachaOptional: f.sachaOptional,
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
    sachaCommemoratifSigle: null,
    sachaInDai: false,
    sachaOptional: false,
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
    .returning([
      'id',
      'key',
      'inputType',
      'label',
      'hintText',
      'sachaCommemoratifSigle',
      'sachaInDai',
      'sachaOptional'
    ])
    .executeTakeFirst();

  if (!field) return null;

  const options = await kysely
    .selectFrom('specificDataFieldOptions')
    .select(['id', 'value', 'label', 'order', 'sachaCommemoratifValueSigle'])
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
      order: o.order,
      sachaCommemoratifValueSigle: o.sachaCommemoratifValueSigle
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
    .returning(['id', 'value', 'label', 'order', 'sachaCommemoratifValueSigle'])
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
    .returning(['id', 'value', 'label', 'order', 'sachaCommemoratifValueSigle'])
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
  programmingSubPlanId: ProgrammingSubPlanId,
  input: CreateProgrammingSubPlanFieldInput
): Promise<ProgrammingSubPlanFieldConfig | null> => {
  const inserted = await kysely
    .insertInto('programmingSubPlanFields')
    .values({
      programmingSubPlanId,
      fieldId: input.fieldId,
      required: input.required,
      order: input.order
    })
    .returning(['id', 'programmingSubPlanId', 'required', 'order', 'fieldId'])
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
    programmingSubPlanId: inserted.programmingSubPlanId,
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

const updateProgrammingSubPlanField = async (
  programmingSubPlanFieldId: ProgrammingSubPlanFieldId,
  input: UpdateProgrammingSubPlanFieldInput
): Promise<ProgrammingSubPlanFieldConfig | null> => {
  const updated = await kysely
    .updateTable('programmingSubPlanFields')
    .set({ required: input.required, order: input.order })
    .where('id', '=', programmingSubPlanFieldId)
    .returning(['id', 'programmingSubPlanId', 'required', 'order', 'fieldId'])
    .executeTakeFirst();

  if (!updated) return null;

  const field = await kysely
    .selectFrom('specificDataFields')
    .select(['key', 'inputType', 'label', 'hintText'])
    .where('id', '=', updated.fieldId)
    .executeTakeFirst();

  if (!field) return null;

  const options = await kysely
    .selectFrom('programmingSubPlanFieldOptions as ppkfo')
    .innerJoin(
      'specificDataFieldOptions as sdfo',
      'sdfo.id',
      'ppkfo.specificDataFieldOptionId'
    )
    .select(['sdfo.value', 'sdfo.label', 'sdfo.order'])
    .where('ppkfo.programmingSubPlanFieldId', '=', programmingSubPlanFieldId)
    .orderBy('sdfo.order')
    .execute();

  return {
    id: updated.id,
    programmingSubPlanId: updated.programmingSubPlanId,
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

const removeProgrammingSubPlanField = async (
  programmingSubPlanFieldId: ProgrammingSubPlanFieldId
): Promise<void> => {
  await kysely
    .deleteFrom('programmingSubPlanFields')
    .where('id', '=', programmingSubPlanFieldId)
    .execute();
};

const replaceProgrammingSubPlanFieldOptions = async (
  programmingSubPlanFieldId: ProgrammingSubPlanFieldId,
  optionIds: SpecificDataFieldOptionId[]
): Promise<void> => {
  await kysely
    .deleteFrom('programmingSubPlanFieldOptions')
    .where('programmingSubPlanFieldId', '=', programmingSubPlanFieldId)
    .execute();

  if (optionIds.length > 0) {
    await kysely
      .insertInto('programmingSubPlanFieldOptions')
      .values(
        optionIds.map((optionId) => ({
          programmingSubPlanFieldId: programmingSubPlanFieldId,
          specificDataFieldOptionId: optionId
        }))
      )
      .execute();
  }
};

export const specificDataFieldConfigRepository = {
  findByPlanSubPlan,
  findSachaFields,
  findAllFields,
  createField,
  updateField,
  deleteField,
  createFieldOption,
  updateFieldOption,
  deleteFieldOption,
  addFieldToPlanKind,
  updateProgrammingSubPlanField,
  removeProgrammingSubPlanField,
  replaceProgrammingSubPlanFieldOptions
};
