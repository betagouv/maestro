import { isArray, isNil, omit, omitBy } from 'lodash-es';
import { Region } from 'maestro-shared/referential/Region';
import { FindProgrammingPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlanRegionalStatus as ProgrammingPlanRegionalStatusType } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanRegionalStatus';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import z from 'zod';
import { knexInstance as db } from './db';
export const programmingPlansTable = 'programming_plans';
const programmingPlanRegionalStatusTable = 'programming_plan_regional_status';

const ProgrammingPlanDbo = ProgrammingPlan.omit({
  regionalStatus: true
});

type ProgrammingPlanDbo = z.infer<typeof ProgrammingPlanDbo>;

const ProgrammingPlanRegionalStatusDbo =
  ProgrammingPlanRegionalStatusType.extend({
    programmingPlanId: z.string()
  });

type ProgrammingPlanRegionalStatusDbo = z.infer<
  typeof ProgrammingPlanRegionalStatusDbo
>;

export const ProgrammingPlans = (transaction = db) =>
  transaction<ProgrammingPlanDbo>(programmingPlansTable);
export const ProgrammingPlanRegionalStatus = (transaction = db) =>
  transaction<ProgrammingPlanRegionalStatusDbo>(
    programmingPlanRegionalStatusTable
  );

const ProgrammingPlanQuery = () =>
  ProgrammingPlans()
    .select(`${programmingPlansTable}.*`)
    .select(
      db.raw(
        `array_agg(to_json(${programmingPlanRegionalStatusTable}.*)) as regional_status`
      )
    )
    .join(
      programmingPlanRegionalStatusTable,
      `${programmingPlansTable}.id`,
      `${programmingPlanRegionalStatusTable}.programming_plan_id`
    )
    .groupBy(`${programmingPlansTable}.id`);

const findUnique = async (id: string): Promise<ProgrammingPlan | undefined> => {
  console.info('Find programming plan', id);
  return ProgrammingPlanQuery()
    .where({ id })
    .first()
    .then((_) => _ && ProgrammingPlan.parse(omitBy(_, isNil)));
};

const findOne = async (
  year: number,
  kinds: ProgrammingPlanKind[],
  region?: Region | null
): Promise<ProgrammingPlan | undefined> => {
  console.info('Find programming plan', year);
  return ProgrammingPlanQuery()
    .where({ year, kinds })
    .modify((builder) => {
      if (region) {
        builder.where('region', region);
      }
    })
    .first()
    .then((_) => _ && ProgrammingPlan.parse(omitBy(_, isNil)));
};

const findMany = async (
  findOptions: FindProgrammingPlanOptions
): Promise<ProgrammingPlan[]> => {
  console.info('Find programming plans', omitBy(findOptions, isNil));
  return ProgrammingPlanQuery()
    .where(omitBy(omit(findOptions, 'status'), isNil))
    .modify((builder) => {
      if (isArray(findOptions.status)) {
        builder.whereIn('status', findOptions.status);
      }
    })
    .then((programmingPlans) =>
      programmingPlans.map((_: any) => ProgrammingPlan.parse(omitBy(_, isNil)))
    );
};

const insert = async (programmingPlan: ProgrammingPlan): Promise<void> => {
  console.info('Insert programming plan', programmingPlan.id);

  await db.transaction(async (transaction) => {
    await ProgrammingPlans(transaction).insert(
      formatProgrammingPlan(programmingPlan)
    );

    await Promise.all(
      programmingPlan.regionalStatus.map((regionalStatus) =>
        transaction(programmingPlanRegionalStatusTable).insert({
          ...regionalStatus,
          programmingPlanId: programmingPlan.id
        })
      )
    );
  });
};

const update = async (programmingPlan: ProgrammingPlan): Promise<void> => {
  console.info('Update programming plan with id', programmingPlan.id);
  await ProgrammingPlans()
    .where({ id: programmingPlan.id })
    .update(formatProgrammingPlan(programmingPlan));
};

const updateRegionalStatus = async (
  programmingPlanId: string,
  regionalStatus: ProgrammingPlanRegionalStatusType
): Promise<void> => {
  console.info(
    'Update programming plan regional status',
    programmingPlanId,
    regionalStatus
  );
  await ProgrammingPlanRegionalStatus()
    .where({ programmingPlanId, region: regionalStatus.region })
    .update(regionalStatus);
};

export const formatProgrammingPlan = (
  programmingPlan: ProgrammingPlan
): ProgrammingPlanDbo => ProgrammingPlanDbo.parse(programmingPlan);

export default {
  findUnique,
  findOne,
  findMany,
  insert,
  update,
  updateRegionalStatus
};
