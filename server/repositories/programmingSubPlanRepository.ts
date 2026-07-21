import { isNil } from 'lodash-es';
import { Department } from 'maestro-shared/referential/Department';
import { Region } from 'maestro-shared/referential/Region';
import { FindProgrammingSubPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingSubPlanOptions';
import { ProgrammingPlanLocalStatus as ProgrammingPlanLocalStatusType } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanLocalStatus';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  ProgrammingSubPlan,
  type ProgrammingSubPlanId
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import { z } from 'zod';
import { knexInstance as db } from './db';
import { kysely } from './kysely';
import {
  formatProgrammingPlan,
  ProgrammingPlans
} from './programmingPlanRepository';

export const programmingSubPlansTable = 'programming_sub_plans';
const programmingSubPlanLocalStatusTable = 'programming_sub_plan_local_status';

const ProgrammingSubPlanDbo = ProgrammingSubPlan.omit({
  nationalStatus: true,
  regionalStatus: true,
  departmentalStatus: true
});

type ProgrammingSubPlanDbo = z.infer<typeof ProgrammingSubPlanDbo>;

const ProgrammingSubPlanLocalStatusDbo = z.object({
  ...ProgrammingPlanLocalStatusType.shape,
  programmingPlanId: z.string(),
  region: z.union([Region, z.literal('None')]),
  department: z.union([Department, z.literal('None')])
});

type ProgrammingSubPlanLocalStatusDbo = z.infer<
  typeof ProgrammingSubPlanLocalStatusDbo
>;

export const ProgrammingSubPlans = (transaction = db) =>
  transaction<ProgrammingSubPlan>(programmingSubPlansTable);
export const ProgrammingSubPlanLocalStatus = (transaction = db) =>
  transaction<ProgrammingSubPlanLocalStatusDbo>(
    programmingSubPlanLocalStatusTable
  );

const findUnique = async (
  id: ProgrammingSubPlanId
): Promise<ProgrammingSubPlan | undefined> => {
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

  return (await query.execute()).map((row) => ProgrammingSubPlan.parse(row));
};

const update = async (
  programmingPlan: ProgrammingPlanChecked
): Promise<void> => {
  console.info('Update programming plan with id', programmingPlan.id);
  await ProgrammingPlans()
    .where({ id: programmingPlan.id })
    .update(formatProgrammingPlan(programmingPlan));
};

const insertManyLocalStatus = async (
  programmingSubPlanId: string,
  programmingPlanLocalStatusList: ProgrammingPlanLocalStatusType[]
): Promise<void> => {
  console.info(
    'Insert programming plan local status',
    programmingSubPlanId,
    programmingPlanLocalStatusList
  );
  await ProgrammingSubPlanLocalStatus().insert(
    programmingPlanLocalStatusList.map((localStatus) => ({
      ...localStatus,
      programmingSubPlanId,
      department: localStatus.department ?? 'None'
    }))
  );
};

const updateLocalStatus = async (
  programmingSubPlanId: string,
  localStatus: ProgrammingPlanLocalStatusType
): Promise<void> => {
  console.info(
    'Update programming plan local status',
    programmingSubPlanId,
    localStatus
  );
  await ProgrammingSubPlanLocalStatus()
    .where({
      programmingSubPlanId: programmingSubPlanId,
      region: localStatus.region ?? 'None',
      department: localStatus.department ?? 'None'
    })
    .update({
      status: localStatus.status
    });
};

export const formatProgrammingSubPlan = (
  programmingSubPlan: ProgrammingSubPlan
): ProgrammingSubPlanDbo => ProgrammingSubPlanDbo.parse(programmingSubPlan);

export const programmingSubPlanRepository = {
  findUnique,
  findMany,
  update,
  insertManyLocalStatus,
  updateLocalStatus
};
