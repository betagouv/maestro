import { isArray, isNil, omit, omitBy } from 'lodash-es';
import { FindProgrammingPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { knexInstance as db } from './db';

export const programmingPlansTable = 'programming_plans';

export const ProgrammingPlans = () =>
  db<ProgrammingPlan>(programmingPlansTable);

const findUnique = async (id: string): Promise<ProgrammingPlan | undefined> => {
  console.info('Find programming plan', id);
  return ProgrammingPlans()
    .where({ id })
    .first()
    .then((_) => _ && ProgrammingPlan.parse(omitBy(_, isNil)));
};

const findOne = async (year: number): Promise<ProgrammingPlan | undefined> => {
  console.info('Find programming plan', year);
  return ProgrammingPlans()
    .where({ year })
    .first()
    .then((_) => _ && ProgrammingPlan.parse(omitBy(_, isNil)));
};

const findMany = async (
  findOptions: FindProgrammingPlanOptions
): Promise<ProgrammingPlan[]> => {
  console.info('Find programming plans', omitBy(findOptions, isNil));
  return ProgrammingPlans()
    .where(omitBy(omit(findOptions, 'status', 'isDrom'), isNil))
    .modify((builder) => {
      if (isArray(findOptions.status)) {
        builder.whereIn(
          findOptions.isDrom ? 'statusDrom' : 'status',
          findOptions.status
        );
      }
    })
    .then((programmingPlans) =>
      programmingPlans.map((_: any) => ProgrammingPlan.parse(omitBy(_, isNil)))
    );
};

const insert = async (programmingPlan: ProgrammingPlan): Promise<void> => {
  console.info('Insert programming plan', programmingPlan.id);
  await ProgrammingPlans().insert(programmingPlan);
};

const update = async (programmingPlan: ProgrammingPlan): Promise<void> => {
  console.info('Update programming plan', programmingPlan.id);
  await ProgrammingPlans()
    .where({ id: programmingPlan.id })
    .update(programmingPlan);
};

export default {
  findUnique,
  findOne,
  findMany,
  insert,
  update
};
