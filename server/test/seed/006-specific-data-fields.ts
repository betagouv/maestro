/** biome-ignore-all lint/suspicious/noAssignInExpressions: old */
import { PPVSubPlanNumberPrefix } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { AllFieldConfigs } from 'maestro-shared/test/specificDataFixtures';
import { kysely } from '../../repositories/kysely';
import type {
  ProgrammingSubPlanFieldId,
  SpecificDataFieldOptionId
} from '../../repositories/kysely.type';

const spreadFieldsOverSiblingSubPlans = async (): Promise<void> => {
  const subPlans = await kysely
    .selectFrom('programmingSubPlansRaw')
    .select(['id', 'programmingPlanId', 'subPlanNumber'])
    .where('subPlanNumber', 'like', `${PPVSubPlanNumberPrefix}%`)
    .orderBy('subPlanNumber')
    .execute();

  const sourceByPlanId = new Map<string, (typeof subPlans)[number]>();
  for (const subPlan of subPlans) {
    if (!sourceByPlanId.has(subPlan.programmingPlanId)) {
      sourceByPlanId.set(subPlan.programmingPlanId, subPlan);
    }
  }

  for (const subPlan of subPlans) {
    const source = sourceByPlanId.get(subPlan.programmingPlanId);

    if (!source || source.id === subPlan.id) {
      continue;
    }

    const fields = await kysely
      .selectFrom('programmingSubPlanFieldsRaw')
      .select(['id', 'fieldId', 'required', 'order', 'inheritance'])
      .where('programmingSubPlanId', '=', source.id)
      .execute();

    for (const { id, ...field } of fields) {
      const { id: copiedFieldId } = await kysely
        .insertInto('programmingSubPlanFieldsRaw')
        .values({ ...field, programmingSubPlanId: subPlan.id })
        .returning('id')
        .executeTakeFirstOrThrow();

      const options = await kysely
        .selectFrom('programmingSubPlanFieldOptions')
        .select('specificDataFieldOptionId')
        .where('programmingSubPlanFieldId', '=', id)
        .execute();

      if (options.length > 0) {
        await kysely
          .insertInto('programmingSubPlanFieldOptions')
          .values(
            options.map((option) => ({
              ...option,
              programmingSubPlanFieldId: copiedFieldId
            }))
          )
          .execute();
      }
    }
  }
};

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
        fieldKey,
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
      .returning(['id', 'fieldKey', 'value'])
      .execute();

    for (const r of optionRows) {
      (optionIdByFieldAndValue[r.fieldKey] ??= {})[r.value] = r.id;
    }
  }

  const programmingSubPlans = await kysely
    .selectFrom('programmingSubPlans')
    .select(['id', 'subPlanNumber'])
    .execute();

  if (programmingSubPlans.length === 0) {
    return;
  }

  const programmingSubPlanFieldRows = await kysely
    .insertInto('programmingSubPlanFieldsRaw')
    .values(
      programmingSubPlans.flatMap(({ id: programmingSubPlanId }) =>
        AllFieldConfigs.filter(
          (c) => c.programmingSubPlanId === programmingSubPlanId
        ).map((c) => ({
          programmingSubPlanId,
          fieldId: fieldIdByKey[c.field.key],
          required: c.required,
          order: c.order
        }))
      )
    )
    .returning(['id', 'programmingSubPlanId', 'fieldId'])
    .execute();

  const fieldKeyById = Object.fromEntries(fieldRows.map((r) => [r.id, r.key]));
  const programmingSubPlanFieldId: Record<
    string,
    Record<string, ProgrammingSubPlanFieldId>
  > = {};
  for (const r of programmingSubPlanFieldRows) {
    (programmingSubPlanFieldId[r.programmingSubPlanId] ??= {})[
      fieldKeyById[r.fieldId]
    ] = r.id;
  }

  const programmingSubPlanFieldOptionInserts =
    programmingSubPlanFieldRows.flatMap((r) => {
      const key = fieldKeyById[r.fieldId];
      const config = AllFieldConfigs.find(
        (c) =>
          c.programmingSubPlanId === r.programmingSubPlanId &&
          c.field.key === key
      );
      return (config?.field.options ?? []).map((o) => ({
        programmingSubPlanFieldId:
          programmingSubPlanFieldId[r.programmingSubPlanId][key],
        specificDataFieldOptionId: optionIdByFieldAndValue[key]?.[o.value]
      }));
    });

  if (programmingSubPlanFieldOptionInserts.length > 0) {
    await kysely
      .insertInto('programmingSubPlanFieldOptions')
      .values(programmingSubPlanFieldOptionInserts)
      .execute();
  }

  await spreadFieldsOverSiblingSubPlans();
};
