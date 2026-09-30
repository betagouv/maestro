import { kysely } from '../../../repositories/kysely';
import { seed as seedSpecificDataFields } from '../../../test/seed/006-specific-data-fields';
import { ppvStageValuesBySubPlanId } from './005-prescriptions-ppv';

const applyPpvStageOptions = async (): Promise<void> => {
  const stageField = await kysely
    .selectFrom('specificDataFields')
    .select('id')
    .where('key', '=', 'stage')
    .executeTakeFirst();

  if (!stageField) {
    return;
  }

  const options = await kysely
    .selectFrom('specificDataFieldOptions')
    .select(['id', 'value'])
    .where('fieldKey', '=', 'stage')
    .execute();

  const optionIdByValue = new Map(options.map(({ id, value }) => [value, id]));

  for (const [subPlanId, stageValues] of ppvStageValuesBySubPlanId) {
    const subPlanField = await kysely
      .selectFrom('programmingSubPlanFieldsRaw')
      .select('id')
      .where('programmingSubPlanId', '=', subPlanId)
      .where('fieldId', '=', stageField.id)
      .executeTakeFirst();

    if (!subPlanField) {
      continue;
    }

    await kysely
      .deleteFrom('programmingSubPlanFieldOptions')
      .where('programmingSubPlanFieldId', '=', subPlanField.id)
      .execute();

    const optionIds = stageValues
      .map((value) => optionIdByValue.get(value))
      .filter((optionId) => optionId !== undefined);

    if (optionIds.length === 0) {
      continue;
    }

    await kysely
      .insertInto('programmingSubPlanFieldOptions')
      .values(
        optionIds.map((specificDataFieldOptionId) => ({
          programmingSubPlanFieldId: subPlanField.id,
          specificDataFieldOptionId
        }))
      )
      .execute();
  }
};

export const seed = async (): Promise<void> => {
  await seedSpecificDataFields();
  await applyPpvStageOptions();
};
