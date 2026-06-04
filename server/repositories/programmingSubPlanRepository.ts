import { isNil } from 'lodash-es';
import { FindProgrammingSubPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingSubPlanOptions';
import type {
  ProgrammingSubPlan,
  ProgrammingSubPlanId
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import { knexInstance as db } from './db';
import { kysely } from './kysely';

export const programmingSubPlansTable = 'programming_sub_plans';
export const ProgrammingSubPlans = (transaction = db) =>
  transaction<ProgrammingSubPlan>(programmingSubPlansTable);

const findUnique = async (
  id: ProgrammingSubPlanId
): Promise<ProgrammingSubPlan | undefined> => {
  return kysely
    .selectFrom('programmingSubPlans')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
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
            .orderBy('codeNat');
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

  return query.execute();
};

export const programmingSubPlanRepository = {
  findUnique,
  findMany
};
