import type { Transaction } from 'kysely';
import {
  managedKey,
  ProgrammingPlanSettingKey,
  type ProgrammingPlanSettings
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettings';
import type {
  ProgrammingPlanSettingsForm,
  ProgrammingSubPlanSettingsForm
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettingsForm';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type { ProgrammingSubPlanFieldSetting } from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import type {
  ProgrammingPlanFieldId,
  ProgrammingSubPlanFieldId,
  SpecificDataFieldId
} from 'maestro-shared/schema/SpecificData/ProgrammingSubPlanFieldConfig';
import { executeTransaction } from '../repositories/kysely';
import type { DB } from '../repositories/kysely.type';
import { programmingSubPlanRepository } from '../repositories/programmingSubPlanRepository';
import { specificDataFieldConfigRepository } from '../repositories/specificDataFieldConfigRepository';

type PlanFieldRow = {
  id: ProgrammingPlanFieldId;
  fieldId: SpecificDataFieldId;
  required: boolean;
};

const freezePlanFieldOnSubPlanFields = async (
  trx: Transaction<DB>,
  planField: PlanFieldRow,
  programmingSubPlanFieldIds: ProgrammingSubPlanFieldId[]
): Promise<void> => {
  if (programmingSubPlanFieldIds.length === 0) {
    return;
  }

  await trx
    .updateTable('programmingSubPlanFieldsRaw')
    .set({ inheritance: 'Own', required: planField.required })
    .where('id', 'in', programmingSubPlanFieldIds)
    .execute();

  await trx
    .deleteFrom('programmingSubPlanFieldOptions')
    .where('programmingSubPlanFieldId', 'in', programmingSubPlanFieldIds)
    .execute();

  const planFieldOptions = await trx
    .selectFrom('programmingPlanFieldOptions')
    .select('specificDataFieldOptionId')
    .where('programmingPlanFieldId', '=', planField.id)
    .execute();

  if (planFieldOptions.length > 0) {
    await trx
      .insertInto('programmingSubPlanFieldOptions')
      .values(
        programmingSubPlanFieldIds.flatMap((programmingSubPlanFieldId) =>
          planFieldOptions.map(({ specificDataFieldOptionId }) => ({
            programmingSubPlanFieldId,
            specificDataFieldOptionId
          }))
        )
      )
      .execute();
  }
};

const releasePlanFields = async (
  trx: Transaction<DB>,
  programmingPlanId: string,
  planFields: PlanFieldRow[]
): Promise<void> => {
  for (const planField of planFields) {
    const subPlanFields = await trx
      .selectFrom('programmingSubPlanFieldsRaw as spf')
      .innerJoin(
        'programmingSubPlansRaw as sp',
        'sp.id',
        'spf.programmingSubPlanId'
      )
      .select(['spf.id', 'spf.inheritance'])
      .where('sp.programmingPlanId', '=', programmingPlanId)
      .where('spf.fieldId', '=', planField.fieldId)
      .execute();

    const excludedIds = subPlanFields
      .filter((_) => _.inheritance === 'Excluded')
      .map((_) => _.id);

    if (excludedIds.length > 0) {
      await trx
        .deleteFrom('programmingSubPlanFieldsRaw')
        .where('id', 'in', excludedIds)
        .execute();
    }

    await freezePlanFieldOnSubPlanFields(
      trx,
      planField,
      subPlanFields
        .filter((_) => _.inheritance === 'Inherited')
        .map((_) => _.id)
    );
  }
};

const attachPlanFieldsToSubPlans = async (
  trx: Transaction<DB>,
  programmingPlanId: string,
  fieldIds: SpecificDataFieldId[]
): Promise<void> => {
  if (fieldIds.length === 0) {
    return;
  }

  const subPlans = await trx
    .selectFrom('programmingSubPlansRaw')
    .select('id')
    .where('programmingPlanId', '=', programmingPlanId)
    .execute();

  if (subPlans.length === 0) {
    return;
  }

  const subPlanFieldOrders = await trx
    .selectFrom('programmingSubPlanFieldsRaw as spf')
    .innerJoin(
      'programmingSubPlansRaw as sp',
      'sp.id',
      'spf.programmingSubPlanId'
    )
    .select(['spf.programmingSubPlanId', 'spf.order'])
    .where('sp.programmingPlanId', '=', programmingPlanId)
    .execute();

  const lastOrderBySubPlanId: Record<string, number> = {};
  for (const row of subPlanFieldOrders) {
    lastOrderBySubPlanId[row.programmingSubPlanId] = Math.max(
      lastOrderBySubPlanId[row.programmingSubPlanId] ?? 0,
      row.order
    );
  }

  await trx
    .insertInto('programmingSubPlanFieldsRaw')
    .values(
      subPlans.flatMap(({ id }) =>
        fieldIds.map((fieldId, index) => ({
          programmingSubPlanId: id,
          fieldId,
          order: (lastOrderBySubPlanId[id] ?? 0) + index + 1,
          inheritance: 'Inherited' as const
        }))
      )
    )
    .onConflict((oc) =>
      oc
        .columns(['programmingSubPlanId', 'fieldId'])
        .doUpdateSet({ inheritance: 'Inherited' })
    )
    .execute();
};

const savePlanSettings = (
  programmingPlanId: string,
  { fields, ...settings }: ProgrammingPlanSettingsForm
): Promise<void> =>
  executeTransaction(async (trx) => {
    console.info('Update programming plan settings', programmingPlanId);

    const storedSettings = await trx
      .selectFrom('programmingPlans')
      .select(ProgrammingPlanSettingKey.options.map(managedKey))
      .where('id', '=', programmingPlanId)
      .executeTakeFirstOrThrow();

    await trx
      .updateTable('programmingPlans')
      .set(settings)
      .where('id', '=', programmingPlanId)
      .execute();

    for (const settingKey of ProgrammingPlanSettingKey.options) {
      const managed = settings[managedKey(settingKey)];

      if (managed === storedSettings[managedKey(settingKey)]) {
        continue;
      }

      if (managed) {
        await trx
          .updateTable('programmingSubPlansRaw')
          .set(managedKey(settingKey), false)
          .where('programmingPlanId', '=', programmingPlanId)
          .execute();
      } else {
        await trx
          .updateTable('programmingSubPlansRaw')
          .set(settingKey, settings[settingKey])
          .set(managedKey(settingKey), true)
          .where('programmingPlanId', '=', programmingPlanId)
          .where(managedKey(settingKey), '=', false)
          .execute();
      }
    }

    const storedFields =
      await specificDataFieldConfigRepository.findPlanFieldRows(
        trx,
        programmingPlanId
      );
    const nextFieldIds = new Set(fields.map(({ fieldId }) => fieldId));
    const storedFieldIds = new Set(storedFields.map(({ fieldId }) => fieldId));

    await releasePlanFields(
      trx,
      programmingPlanId,
      storedFields.filter(({ fieldId }) => !nextFieldIds.has(fieldId))
    );

    await specificDataFieldConfigRepository.replacePlanFields(
      trx,
      programmingPlanId,
      fields
    );

    await attachPlanFieldsToSubPlans(
      trx,
      programmingPlanId,
      fields
        .filter(({ fieldId }) => !storedFieldIds.has(fieldId))
        .map(({ fieldId }) => fieldId)
    );
  });

const saveSubPlanSettings = (
  programmingPlanId: string,
  programmingSubPlanId: ProgrammingSubPlanId,
  { fields, ...settings }: ProgrammingSubPlanSettingsForm
): Promise<void> =>
  executeTransaction(async (trx) => {
    console.info('Update programming sub-plan settings', programmingSubPlanId);

    const ownSettings: Partial<ProgrammingPlanSettings> = {};
    for (const settingKey of ProgrammingPlanSettingKey.options) {
      const managed = settings[managedKey(settingKey)];
      ownSettings[managedKey(settingKey)] = managed;
      if (managed) {
        ownSettings[settingKey] = settings[settingKey];
      }
    }

    await programmingSubPlanRepository.updateSettings(
      programmingSubPlanId,
      ownSettings,
      trx
    );

    const planFields =
      await specificDataFieldConfigRepository.findPlanFieldRows(
        trx,
        programmingPlanId
      );
    const planFieldIds = new Set(planFields.map(({ fieldId }) => fieldId));
    const bodyFieldIds = new Set(fields.map(({ fieldId }) => fieldId));

    const claimed: ProgrammingSubPlanFieldSetting[] = fields.map((field) => ({
      ...field,
      inheritance: planFieldIds.has(field.fieldId) ? field.inheritance : 'Own',
      managedAtPlanLevel: planFieldIds.has(field.fieldId)
    }));

    const omitted: ProgrammingSubPlanFieldSetting[] = planFields
      .filter(({ fieldId }) => !bodyFieldIds.has(fieldId))
      .map(({ fieldId, required }) => ({
        fieldId,
        required,
        optionIds: [],
        inheritance: 'Inherited',
        managedAtPlanLevel: true
      }));

    await specificDataFieldConfigRepository.replaceSubPlanFields(
      trx,
      programmingSubPlanId,
      [...claimed, ...omitted]
    );
  });

export const programmingPlanSettingsService = {
  savePlanSettings,
  saveSubPlanSettings
};
