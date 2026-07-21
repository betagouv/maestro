import { isNil } from 'lodash-es';
import { Department } from 'maestro-shared/referential/Department';
import { FindProgrammingSubPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingSubPlanOptions';
import { ProgrammingPlanLocalStatus as ProgrammingPlanLocalStatusType } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanLocalStatus';
import {
  ProgrammingSubPlanBase,
  type ProgrammingSubPlanId
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import z from 'zod';
import { knexInstance as db } from './db';
import { kysely } from './kysely';

export const programmingSubPlansTable = 'programming_sub_plans';
const programmingSubPlanLocalStatusTable = 'programming_sub_plan_local_status';

export const ProgrammingSubPlans = (transaction = db) =>
  transaction<ProgrammingSubPlanBase>(programmingSubPlansTable);

const ProgrammingSubPlanLocalStatusDbo = z.object({
  ...ProgrammingPlanLocalStatusType.shape,
  programmingSubPlanId: z.string(),
  department: z.union([Department, z.literal('None')])
});

type ProgrammingSubPlanLocalStatusDbo = z.infer<
  typeof ProgrammingSubPlanLocalStatusDbo
>;

export const ProgrammingSubPlanLocalStatus = (transaction = db) =>
  transaction<ProgrammingSubPlanLocalStatusDbo>(
    programmingSubPlanLocalStatusTable
  );

const findUnique = async (
  id: ProgrammingSubPlanId
): Promise<ProgrammingSubPlanBase | undefined> => {
  const result = await kysely
    .selectFrom('programmingSubPlans')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
  return result ? ProgrammingSubPlanBase.parse(result) : undefined;
};

const findMany = async (
  findOptions?: FindProgrammingSubPlanOptions
): Promise<ProgrammingSubPlanBase[]> => {
  console.info('Find programming sub-plans', findOptions);

  let query = kysely.selectFrom('programmingSubPlans').selectAll();

  for (const option of FindProgrammingSubPlanOptions.keyof().options) {
    switch (option) {
      case 'programmingPlanId':
        if (!isNil(findOptions?.programmingPlanId)) {
          query = query
            .where('programmingPlanId', '=', findOptions.programmingPlanId)
            .orderBy('subPlanNumber');
        }
        break;
      case 'ids':
        if (!isNil(findOptions?.ids)) {
          if (findOptions.ids.length === 0) return [];
          query = query.where('id', 'in', findOptions.ids);
        }
        break;
      default:
        assertUnreachable(option);
    }
  }

  return (await query.execute()).map((row) =>
    ProgrammingSubPlanBase.parse(row)
  );
};

const insertManyLocalStatus = async (
  programmingSubPlanId: ProgrammingSubPlanId,
  localStatusList: ProgrammingPlanLocalStatusType[],
  transaction = db
): Promise<void> => {
  if (localStatusList.length === 0) {
    return;
  }
  console.info(
    'Insert programming sub-plan local status',
    programmingSubPlanId,
    localStatusList
  );
  await ProgrammingSubPlanLocalStatus(transaction).insert(
    localStatusList.map((localStatus) => ({
      ...localStatus,
      programmingSubPlanId,
      department: localStatus.department ?? 'None'
    }))
  );
};

const updateLocalStatus = async (
  programmingSubPlanId: ProgrammingSubPlanId,
  localStatus: ProgrammingPlanLocalStatusType,
  transaction = db
): Promise<void> => {
  console.info(
    'Update programming sub-plan local status',
    programmingSubPlanId,
    localStatus
  );
  await ProgrammingSubPlanLocalStatus(transaction)
    .where({
      programmingSubPlanId,
      region: localStatus.region,
      department: localStatus.department ?? 'None'
    })
    .update({
      status: localStatus.status
    });
};

export const programmingSubPlanRepository = {
  findUnique,
  findMany,
  insertManyLocalStatus,
  updateLocalStatus
};
