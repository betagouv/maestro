import { isNil } from 'lodash-es';
import { LaboratoryAgreementSubPlan } from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import { FindProgrammingSubPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingSubPlanOptions';
import type { ProgrammingPlanSettings } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettings';
import {
  ProgrammingSubPlan,
  type ProgrammingSubPlanId
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import { knexInstance as db } from './db';
import { kysely } from './kysely';
import type { KyselyMaestro } from './kysely.type';
import {
  type ProgrammingPlanSettingsRow,
  toProgrammingPlanSettingsRow
} from './programmingPlanSettingsRow';

export const programmingSubPlansTable = 'programming_sub_plans';
const programmingSubPlansRawTable = 'programming_sub_plans_raw';

export const ProgrammingSubPlansRaw = (transaction = db) =>
  transaction<ProgrammingPlanSettingsRow<ProgrammingSubPlan>>(
    programmingSubPlansRawTable
  );

const findUnique = async (
  id: ProgrammingSubPlanId | null | undefined
): Promise<ProgrammingSubPlan | undefined> => {
  if (isNil(id)) {
    return undefined;
  }

  const result = await kysely
    .selectFrom('programmingSubPlans')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
  return result ? ProgrammingSubPlan.parse(result) : undefined;
};

const findMany = async (
  findOptions?: FindProgrammingSubPlanOptions
): Promise<ProgrammingSubPlan[]> => {
  console.info('Find programming sub-plans', findOptions);

  let query = kysely
    .selectFrom('programmingSubPlans')
    .innerJoin(
      'programmingPlans',
      'programmingPlans.id',
      'programmingSubPlans.programmingPlanId'
    )
    .selectAll('programmingSubPlans');

  for (const option of FindProgrammingSubPlanOptions.keyof().options) {
    switch (option) {
      case 'programmingPlanId':
        if (!isNil(findOptions?.programmingPlanId)) {
          query = query
            .where(
              'programmingSubPlans.programmingPlanId',
              '=',
              findOptions.programmingPlanId
            )
            .orderBy('subPlanNumber');
        }
        break;
      case 'ids':
        if (!isNil(findOptions?.ids)) {
          if (findOptions.ids.length === 0) return [];
          query = query.where('programmingSubPlans.id', 'in', findOptions.ids);
        }
        break;
      case 'year':
        if (!isNil(findOptions?.year)) {
          query = query
            .where('programmingPlans.year', '=', findOptions.year)
            .orderBy('subPlanNumber');
        }
        break;
      default:
        assertUnreachable(option);
    }
  }

  return (await query.execute()).map((row) => ProgrammingSubPlan.parse(row));
};

const findManyWithPlan = async (
  year: number
): Promise<LaboratoryAgreementSubPlan[]> => {
  console.info('Find programming sub-plans with plan', year);

  const rows = await kysely
    .selectFrom('programmingSubPlans')
    .innerJoin(
      'programmingPlans',
      'programmingPlans.id',
      'programmingSubPlans.programmingPlanId'
    )
    .selectAll('programmingSubPlans')
    .select([
      'programmingPlans.title as programmingPlanTitle',
      'programmingPlans.domainId as programmingPlanDomainId'
    ])
    .where('programmingPlans.year', '=', year)
    .orderBy('subPlanNumber')
    .execute();

  return rows.map((row) => LaboratoryAgreementSubPlan.parse(row));
};

const updateSettings = async (
  id: ProgrammingSubPlanId,
  settings: Partial<
    ProgrammingPlanSettings &
      Pick<
        ProgrammingSubPlan,
        'settingsCompleted' | 'subPlanNumber' | 'sachaContextSigle'
      >
  >,
  executor: KyselyMaestro = kysely
): Promise<void> => {
  console.info('Update programming sub-plan settings', id);

  await executor
    .updateTable('programmingSubPlansRaw')
    .set(toProgrammingPlanSettingsRow(settings))
    .where('id', '=', id)
    .execute();
};

const findYearSubPlanNumbers = async (
  year: number,
  executor: KyselyMaestro = kysely
): Promise<string[]> => {
  const rows = await executor
    .selectFrom('programmingSubPlansRaw')
    .innerJoin(
      'programmingPlans',
      'programmingPlans.id',
      'programmingSubPlansRaw.programmingPlanId'
    )
    .select('programmingSubPlansRaw.subPlanNumber')
    .where('programmingPlans.year', '=', year)
    .execute();

  return rows.map(({ subPlanNumber }) => subPlanNumber);
};

const insert = async (
  {
    programmingPlanId,
    subPlanNumber,
    ...settings
  }: ProgrammingPlanSettings &
    Pick<ProgrammingSubPlan, 'programmingPlanId' | 'subPlanNumber'>,
  executor: KyselyMaestro = kysely
): Promise<ProgrammingSubPlanId> => {
  console.info('Insert programming sub-plan', programmingPlanId, subPlanNumber);

  const id = crypto.randomUUID() as ProgrammingSubPlanId;

  await executor
    .insertInto('programmingSubPlansRaw')
    .values({
      ...toProgrammingPlanSettingsRow(settings),
      id,
      programmingPlanId,
      subPlanNumber,
      settingsCompleted: false,
      contactListId: null,
      withSacha: false
    })
    .execute();

  return id;
};

const deleteOne = async (id: ProgrammingSubPlanId): Promise<void> => {
  console.info('Delete programming sub-plan', id);

  await kysely
    .deleteFrom('programmingSubPlansRaw')
    .where('id', '=', id)
    .execute();
};

export const programmingSubPlanRepository = {
  findUnique,
  findMany,
  findManyWithPlan,
  findYearSubPlanNumbers,
  insert,
  updateSettings,
  deleteOne
};
