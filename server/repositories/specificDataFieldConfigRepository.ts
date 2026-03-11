import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import {
  FieldInputType,
  PlanKindFieldConfig,
  SachaFieldConfig
} from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import { kysely } from './kysely';

const findByPlanKind = async (
  kind: ProgrammingPlanKind
): Promise<PlanKindFieldConfig[]> => {
  console.info('Find specific data field configs for plan kind', kind);

  const planKindFields = await kysely
    .selectFrom('programmingPlanKindFields as ppkf')
    .innerJoin('specificDataFields as sdf', 'sdf.id', 'ppkf.fieldId')
    .select([
      'ppkf.id',
      'ppkf.programmingPlanKind',
      'ppkf.required',
      'ppkf.order',
      'sdf.key',
      'sdf.inputType',
      'sdf.label',
      'sdf.hintText'
    ])
    .where('ppkf.programmingPlanKind', '=', kind)
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
    programmingPlanKind: ProgrammingPlanKind.parse(f.programmingPlanKind),
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
    .where('ppkf.programmingPlanKind', '!=', 'PPV')
    .distinctOn('sdf.id')
    .execute();

  if (fields.length === 0) {
    return [];
  }

  const fieldIds = fields.map((f) => f.id);

  const options = await kysely
    .selectFrom('specificDataFieldOptions as sdfo')
    .select([
      'sdfo.fieldId',
      'sdfo.value',
      'sdfo.label',
      'sdfo.order',
      'sdfo.sachaCommemoratifValueSigle'
    ])
    .where('sdfo.fieldId', 'in', fieldIds)
    .orderBy('sdfo.order')
    .execute();

  const optionsByFieldId = options.reduce<
    Record<
      string,
      {
        value: string;
        label: string;
        order: number;
        sachaCommemoratifValueSigle: string | null;
      }[]
    >
  >((acc, opt) => {
    const id = opt.fieldId;
    if (!acc[id]) acc[id] = [];
    acc[id].push({
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
    sachaCommemoratifSigle: f.sachaCommemoratifSigle ?? null,
    inDai: f.sachaInDai,
    optional: f.sachaOptional,
    options: optionsByFieldId[f.id] ?? []
  }));
};

export const specificDataFieldConfigRepository = {
  findByPlanKind,
  findSachaFields
};
