import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { PlanKindFieldConfig } from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
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
      'sdf.whenValid',
      'sdf.hintText',
      'sdf.defaultOptionLabel'
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
      inputType: f.inputType,
      label: f.label,
      whenValid: f.whenValid,
      hintText: f.hintText,
      defaultOptionLabel: f.defaultOptionLabel,
      options: optionsByFieldId[f.id] ?? []
    }
  }));
};

export const specificDataFieldConfigRepository = {
  findByPlanKind
};
