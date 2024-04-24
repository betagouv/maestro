import fp from 'lodash';
import {
  ProgrammingPlan,
  RegionalProgrammingPlan,
  RegionalProgrammingPlanDB,
} from '../../shared/schema/ProgrammingPlan/ProgrammingPlans';
import { Region } from '../../shared/schema/Region';
import db from './db';

const programmingPlansTable = 'programming_plans';
const regionalProgrammingPlansTable = 'regional_programming_plans';

export const ProgrammingPlans = () =>
  db<ProgrammingPlan>(programmingPlansTable);

export const ProgrammingPlansRegions = () =>
  db<RegionalProgrammingPlanDB>(regionalProgrammingPlansTable);

const findUnique = async (id: string): Promise<ProgrammingPlan | undefined> => {
  console.info('Find programming plan', id);
  return ProgrammingPlans()
    .where({ id })
    .first()
    .then((_) => _ && ProgrammingPlan.parse(fp.omitBy(_, fp.isNil)));
};

const findMany = async (
  region?: Region
): Promise<(ProgrammingPlan | RegionalProgrammingPlan)[]> => {
  console.info('Find programming plans');
  return ProgrammingPlans()
    .modify((builder) => {
      if (region) {
        builder
          .join(
            'regional_programming_plans',
            `${programmingPlansTable}.id`,
            `${regionalProgrammingPlansTable}.programming_plan_id`
          )
          .where('region', region);
      }
    })
    .then((programmingPlans) =>
      programmingPlans.map((_: any) =>
        region
          ? RegionalProgrammingPlan.parse(fp.omitBy(_, fp.isNil))
          : ProgrammingPlan.parse(fp.omitBy(_, fp.isNil))
      )
    );
};

const insert = async (programmingPlan: ProgrammingPlan): Promise<void> => {
  console.info('Insert programming plan', programmingPlan.id);
  await ProgrammingPlans().insert(programmingPlan);
};

export default {
  findUnique,
  findMany,
  insert,
};
