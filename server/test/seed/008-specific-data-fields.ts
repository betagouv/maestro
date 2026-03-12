import { AllFieldConfigs } from 'maestro-shared/test/specificDataFixtures';
import { kysely } from '../../repositories/kysely';
import {
  ProgrammingPlanKindFieldId,
  SpecificDataFieldOptionId
} from '../../repositories/kysely.type';

export const seed = async (): Promise<void> => {
  await kysely.deleteFrom('specificDataFields').execute();

  const uniqueFields = [
    ...new Map(AllFieldConfigs.map((c) => [c.field.key, c.field])).values()
  ];

  const fieldRows = await kysely
    .insertInto('specificDataFields')
    .values(
      uniqueFields.map((f) => ({
        key: f.key,
        inputType: f.inputType,
        label: f.label,
        hintText: f.hintText ?? null
      }))
    )
    .returning(['id', 'key'])
    .execute();

  const fieldIdByKey = Object.fromEntries(fieldRows.map((r) => [r.key, r.id]));

  const uniqueOptionsByFieldKey: Record<
    string,
    { value: string; label: string; order: number }[]
  > = {};
  for (const config of AllFieldConfigs) {
    for (const option of config.field.options) {
      const list = (uniqueOptionsByFieldKey[config.field.key] ??= []);
      if (!list.find((o) => o.value === option.value)) {
        list.push(option);
      }
    }
  }

  const allOptionInserts = Object.entries(uniqueOptionsByFieldKey).flatMap(
    ([fieldKey, options]) =>
      options.map((o) => ({
        fieldId: fieldIdByKey[fieldKey],
        value: o.value,
        label: o.label,
        order: o.order
      }))
  );

  const optionIdByFieldAndValue: Record<string, Record<string, string>> = {};
  if (allOptionInserts.length > 0) {
    const optionRows = await kysely
      .insertInto('specificDataFieldOptions')
      .values(allOptionInserts)
      .returning(['id', 'fieldId', 'value'])
      .execute();

    for (const r of optionRows) {
      (optionIdByFieldAndValue[r.fieldId] ??= {})[r.value] = r.id;
    }
  }

  const planKindFieldRows = await kysely
    .insertInto('programmingPlanKindFields')
    .values(
      AllFieldConfigs.map((c) => ({
        programmingPlanKind: c.programmingPlanKind,
        fieldId: fieldIdByKey[c.field.key],
        required: c.required,
        order: c.order
      }))
    )
    .returning(['id', 'programmingPlanKind', 'fieldId'])
    .execute();

  const fieldKeyById = Object.fromEntries(fieldRows.map((r) => [r.id, r.key]));
  const planKindFieldId: Record<string, Record<string, string>> = {};
  for (const r of planKindFieldRows) {
    (planKindFieldId[r.programmingPlanKind] ??= {})[fieldKeyById[r.fieldId]] =
      r.id;
  }

  // Insert plan-kind-field-option rows (only options enabled per plan kind)
  const planKindFieldOptionInserts = AllFieldConfigs.flatMap((c) =>
    c.field.options.map((o) => ({
      programmingPlanKindFieldId: planKindFieldId[c.programmingPlanKind][
        c.field.key
      ] as ProgrammingPlanKindFieldId,
      specificDataFieldOptionId: optionIdByFieldAndValue[
        fieldIdByKey[c.field.key]
      ]?.[o.value] as SpecificDataFieldOptionId
    }))
  );

  if (planKindFieldOptionInserts.length > 0) {
    await kysely
      .insertInto('programmingPlanKindFieldOptions')
      .values(planKindFieldOptionInserts)
      .execute();
  }
};
