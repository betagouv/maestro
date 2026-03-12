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

  const optionIdByFieldAndValue: Record<
    string,
    Record<string, SpecificDataFieldOptionId>
  > = {};
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

  // Fetch existing (programmingPlanId, kind) pairs from the DB
  const programmingPlanKinds = await kysely
    .selectFrom('programmingPlanKinds')
    .select(['programmingPlanId', 'kind'])
    .execute();

  if (programmingPlanKinds.length === 0) {
    return;
  }

  const planKindFieldRows = await kysely
    .insertInto('programmingPlanKindFields')
    .values(
      programmingPlanKinds.flatMap(({ programmingPlanId, kind }) =>
        AllFieldConfigs.filter((c) => c.programmingPlanKind === kind).map(
          (c) => ({
            programmingPlanId,
            kind,
            fieldId: fieldIdByKey[c.field.key],
            required: c.required,
            order: c.order
          })
        )
      )
    )
    .returning(['id', 'programmingPlanId', 'kind', 'fieldId'])
    .execute();

  const fieldKeyById = Object.fromEntries(fieldRows.map((r) => [r.id, r.key]));
  const planKindFieldId: Record<
    string,
    Record<string, Record<string, ProgrammingPlanKindFieldId>>
  > = {};
  for (const r of planKindFieldRows) {
    planKindFieldId[r.programmingPlanId] ??= {};
    (planKindFieldId[r.programmingPlanId][r.kind] ??= {})[
      fieldKeyById[r.fieldId]
    ] = r.id;
  }

  // Insert plan-kind-field-option rows (only options enabled per plan kind)
  const planKindFieldOptionInserts = planKindFieldRows.flatMap((r) => {
    const key = fieldKeyById[r.fieldId];
    const config = AllFieldConfigs.find(
      (c) => c.programmingPlanKind === r.kind && c.field.key === key
    );
    return (config?.field.options ?? []).map((o) => ({
      programmingPlanKindFieldId:
        planKindFieldId[r.programmingPlanId][r.kind][key],
      specificDataFieldOptionId:
        optionIdByFieldAndValue[fieldIdByKey[key]]?.[o.value]
    }));
  });

  if (planKindFieldOptionInserts.length > 0) {
    await kysely
      .insertInto('programmingPlanKindFieldOptions')
      .values(planKindFieldOptionInserts)
      .execute();
  }
};
