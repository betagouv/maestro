import type { Transaction } from 'kysely';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type { CommemoratifValueSigle } from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import type {
  AdminFieldConfig,
  AdminFieldOption,
  CreateFieldInput,
  CreateFieldOptionInput,
  ProgrammingPlanFieldSetting,
  ProgrammingSubPlanFieldSetting,
  UpdateFieldInput,
  UpdateFieldOptionInput
} from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import type { FieldInheritance } from 'maestro-shared/schema/SpecificData/FieldInheritance';
import {
  FieldInputType,
  type ProgrammingPlanFieldId,
  type ProgrammingSubPlanFieldConfig,
  type ProgrammingSubPlanFieldId,
  type SachaFieldConfig,
  type SpecificDataFieldId,
  type SpecificDataFieldOptionId
} from 'maestro-shared/schema/SpecificData/ProgrammingSubPlanFieldConfig';
import { kysely } from './kysely';
import type { DB } from './kysely.type';

type FieldOption = {
  id: SpecificDataFieldOptionId;
  value: string;
  label: string;
  order: number;
};

type SubPlanFieldRow = {
  id: ProgrammingSubPlanFieldId;
  programmingSubPlanId: ProgrammingSubPlanId;
  required: boolean;
  order: number;
  inheritance: FieldInheritance;
  programmingPlanFieldId: ProgrammingPlanFieldId | null;
};

const readsPlanOptions = <
  Row extends Pick<SubPlanFieldRow, 'inheritance' | 'programmingPlanFieldId'>
>(
  row: Row
): row is Row & { programmingPlanFieldId: ProgrammingPlanFieldId } =>
  row.inheritance !== 'Own' && row.programmingPlanFieldId !== null;

const findSubPlanFieldOptions = async <
  Row extends Pick<
    SubPlanFieldRow,
    'id' | 'inheritance' | 'programmingPlanFieldId'
  >
>(
  rows: Row[]
): Promise<Record<string, FieldOption[]>> => {
  const optionsByRowId: Record<string, FieldOption[]> = {};

  const ownRowIds = rows
    .filter((row) => !readsPlanOptions(row))
    .map(({ id }) => id);

  if (ownRowIds.length > 0) {
    const options = await kysely
      .selectFrom('programmingSubPlanFieldOptions as spfo')
      .innerJoin(
        'specificDataFieldOptions as sdfo',
        'sdfo.id',
        'spfo.specificDataFieldOptionId'
      )
      .select([
        'spfo.programmingSubPlanFieldId',
        'sdfo.id',
        'sdfo.value',
        'sdfo.label',
        'sdfo.order'
      ])
      .where('spfo.programmingSubPlanFieldId', 'in', ownRowIds)
      .orderBy('sdfo.order')
      .execute();

    for (const option of options) {
      const rowOptions = optionsByRowId[option.programmingSubPlanFieldId] ?? [];
      rowOptions.push(option);
      optionsByRowId[option.programmingSubPlanFieldId] = rowOptions;
    }
  }

  const planManagedRows = rows.filter(readsPlanOptions);

  if (planManagedRows.length > 0) {
    const planOptions = await kysely
      .selectFrom('programmingPlanFieldOptions as pfo')
      .innerJoin(
        'specificDataFieldOptions as sdfo',
        'sdfo.id',
        'pfo.specificDataFieldOptionId'
      )
      .select([
        'pfo.programmingPlanFieldId',
        'sdfo.id',
        'sdfo.value',
        'sdfo.label',
        'sdfo.order'
      ])
      .where(
        'pfo.programmingPlanFieldId',
        'in',
        planManagedRows.map(
          ({ programmingPlanFieldId }) => programmingPlanFieldId
        )
      )
      .orderBy('sdfo.order')
      .execute();

    const optionsByPlanFieldId: Record<string, FieldOption[]> = {};
    for (const option of planOptions) {
      const planFieldOptions =
        optionsByPlanFieldId[option.programmingPlanFieldId] ?? [];
      planFieldOptions.push(option);
      optionsByPlanFieldId[option.programmingPlanFieldId] = planFieldOptions;
    }

    for (const row of planManagedRows) {
      optionsByRowId[row.id] =
        optionsByPlanFieldId[row.programmingPlanFieldId] ?? [];
    }
  }

  return optionsByRowId;
};

const findByPlanSubPlan = async (
  programmingSubPlanId: ProgrammingSubPlanId
): Promise<ProgrammingSubPlanFieldConfig[]> => {
  console.info(
    'Find specific data field configs for sub-plan',
    programmingSubPlanId
  );

  const rows = await kysely
    .selectFrom('programmingSubPlanFields as spf')
    .innerJoin('specificDataFields as sdf', 'sdf.id', 'spf.fieldId')
    .select([
      'spf.id',
      'spf.programmingSubPlanId',
      'spf.required',
      'spf.order',
      'spf.inheritance',
      'spf.programmingPlanFieldId',
      'sdf.key',
      'sdf.inputType',
      'sdf.label',
      'sdf.hintText'
    ])
    .where('spf.programmingSubPlanId', '=', programmingSubPlanId)
    .orderBy('spf.order')
    .execute();

  if (rows.length === 0) {
    return [];
  }

  const optionsByRowId = await findSubPlanFieldOptions(rows);

  return rows.map((row) => ({
    id: row.id,
    programmingSubPlanId: row.programmingSubPlanId,
    required: row.required,
    order: row.order,
    inheritance: row.inheritance,
    field: {
      key: row.key,
      inputType: FieldInputType.parse(row.inputType),
      label: row.label,
      hintText: row.hintText,
      options: (optionsByRowId[row.id] ?? []).map(
        ({ value, label, order }) => ({
          value,
          label,
          order
        })
      )
    }
  }));
};

const findSubPlanFieldSettings = async (
  programmingSubPlanId: ProgrammingSubPlanId
): Promise<ProgrammingSubPlanFieldSetting[]> => {
  const rows = await kysely
    .selectFrom('programmingSubPlanFieldSettings')
    .select([
      'id',
      'fieldId',
      'required',
      'order',
      'inheritance',
      'programmingPlanFieldId'
    ])
    .where('programmingSubPlanId', '=', programmingSubPlanId)
    .orderBy('order')
    .execute();

  if (rows.length === 0) {
    return [];
  }

  const optionsByRowId = await findSubPlanFieldOptions(rows);

  return rows.map((row) => ({
    fieldId: row.fieldId,
    required: row.required,
    inheritance: row.inheritance,
    managedAtPlanLevel: row.programmingPlanFieldId !== null,
    optionIds: (optionsByRowId[row.id] ?? []).map(({ id }) => id)
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

const optionIdsOf = (
  fields: ProgrammingPlanFieldSetting[],
  fieldId: SpecificDataFieldId
): SpecificDataFieldOptionId[] =>
  fields.find((field) => field.fieldId === fieldId)?.optionIds ?? [];

const findPlanFieldSettings = async (
  programmingPlanId: string
): Promise<ProgrammingPlanFieldSetting[]> => {
  const rows = await kysely
    .selectFrom('programmingPlanFields')
    .select(['id', 'fieldId', 'required'])
    .where('programmingPlanId', '=', programmingPlanId)
    .orderBy('order')
    .execute();

  if (rows.length === 0) {
    return [];
  }

  const options = await kysely
    .selectFrom('programmingPlanFieldOptions as pfo')
    .innerJoin(
      'specificDataFieldOptions as sdfo',
      'sdfo.id',
      'pfo.specificDataFieldOptionId'
    )
    .select(['pfo.programmingPlanFieldId', 'pfo.specificDataFieldOptionId'])
    .where(
      'pfo.programmingPlanFieldId',
      'in',
      rows.map(({ id }) => id)
    )
    .orderBy('sdfo.order')
    .execute();

  const optionIdsByRowId: Record<string, SpecificDataFieldOptionId[]> = {};
  for (const option of options) {
    const rowOptionIds = optionIdsByRowId[option.programmingPlanFieldId] ?? [];
    rowOptionIds.push(option.specificDataFieldOptionId);
    optionIdsByRowId[option.programmingPlanFieldId] = rowOptionIds;
  }

  return rows.map((row) => ({
    fieldId: row.fieldId,
    required: row.required,
    optionIds: optionIdsByRowId[row.id] ?? []
  }));
};

const findPlanFieldRows = (
  trx: Transaction<DB>,
  programmingPlanId: string
): Promise<
  {
    id: ProgrammingPlanFieldId;
    fieldId: SpecificDataFieldId;
    required: boolean;
  }[]
> =>
  trx
    .selectFrom('programmingPlanFields')
    .select(['id', 'fieldId', 'required'])
    .where('programmingPlanId', '=', programmingPlanId)
    .execute();

const replacePlanFields = async (
  trx: Transaction<DB>,
  programmingPlanId: string,
  fields: ProgrammingPlanFieldSetting[]
): Promise<void> => {
  const keptFieldIds = fields.map(({ fieldId }) => fieldId);

  await trx
    .deleteFrom('programmingPlanFields')
    .where('programmingPlanId', '=', programmingPlanId)
    .$if(keptFieldIds.length > 0, (qb) =>
      qb.where('fieldId', 'not in', keptFieldIds)
    )
    .execute();

  if (fields.length === 0) {
    return;
  }

  const rows = await trx
    .insertInto('programmingPlanFields')
    .values(
      fields.map((field, index) => ({
        programmingPlanId,
        fieldId: field.fieldId,
        required: field.required,
        order: index
      }))
    )
    .onConflict((oc) =>
      oc.columns(['programmingPlanId', 'fieldId']).doUpdateSet((eb) => ({
        required: eb.ref('excluded.required'),
        order: eb.ref('excluded.order')
      }))
    )
    .returning(['id', 'fieldId'])
    .execute();

  await trx
    .deleteFrom('programmingPlanFieldOptions')
    .where(
      'programmingPlanFieldId',
      'in',
      rows.map(({ id }) => id)
    )
    .execute();

  const optionRows = rows.flatMap((row) =>
    optionIdsOf(fields, row.fieldId).map((specificDataFieldOptionId) => ({
      programmingPlanFieldId: row.id,
      specificDataFieldOptionId
    }))
  );

  if (optionRows.length > 0) {
    await trx
      .insertInto('programmingPlanFieldOptions')
      .values(optionRows)
      .execute();
  }
};

const replaceSubPlanFields = async (
  trx: Transaction<DB>,
  programmingSubPlanId: ProgrammingSubPlanId,
  fields: ProgrammingSubPlanFieldSetting[]
): Promise<void> => {
  const keptFieldIds = fields.map(({ fieldId }) => fieldId);

  await trx
    .deleteFrom('programmingSubPlanFieldsRaw')
    .where('programmingSubPlanId', '=', programmingSubPlanId)
    .$if(keptFieldIds.length > 0, (qb) =>
      qb.where('fieldId', 'not in', keptFieldIds)
    )
    .execute();

  if (fields.length === 0) {
    return;
  }

  const rows = await trx
    .insertInto('programmingSubPlanFieldsRaw')
    .values(
      fields.map((field, index) => ({
        programmingSubPlanId,
        fieldId: field.fieldId,
        required: field.required,
        order: index,
        inheritance: field.inheritance
      }))
    )
    .onConflict((oc) =>
      oc.columns(['programmingSubPlanId', 'fieldId']).doUpdateSet((eb) => ({
        required: eb.ref('excluded.required'),
        order: eb.ref('excluded.order'),
        inheritance: eb.ref('excluded.inheritance')
      }))
    )
    .returning(['id', 'fieldId'])
    .execute();

  await trx
    .deleteFrom('programmingSubPlanFieldOptions')
    .where(
      'programmingSubPlanFieldId',
      'in',
      rows.map(({ id }) => id)
    )
    .execute();

  const optionRows = rows.flatMap((row) =>
    optionIdsOf(fields, row.fieldId).map((specificDataFieldOptionId) => ({
      programmingSubPlanFieldId: row.id,
      specificDataFieldOptionId
    }))
  );

  if (optionRows.length > 0) {
    await trx
      .insertInto('programmingSubPlanFieldOptions')
      .values(optionRows)
      .execute();
  }
};

export const specificDataFieldConfigRepository = {
  findByPlanSubPlan,
  findSubPlanFieldSettings,
  findSachaFields,
  findAllFields,
  createField,
  updateField,
  deleteField,
  createFieldOption,
  updateFieldOption,
  deleteFieldOption,
  findPlanFieldSettings,
  findPlanFieldRows,
  replacePlanFields,
  replaceSubPlanFields
};
