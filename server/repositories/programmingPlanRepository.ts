import { isArray, isNil, omit, omitBy } from 'lodash-es';
import { Department } from 'maestro-shared/referential/Department';
import type { Region } from 'maestro-shared/referential/Region';
import type { FindProgrammingPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlanLocalStatus as ProgrammingPlanLocalStatusType } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanLocalStatus';
import {
  ProgrammingPlanBase,
  ProgrammingPlanChecked
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import z from 'zod';
import { knexInstance as db } from './db';
export const programmingPlansTable = 'programming_plans';
const programmingPlanLocalStatusTable = 'programming_plan_local_status';
const programmingPlanKindsTable = 'programming_plan_kinds';

const ProgrammingPlanDbo = ProgrammingPlanBase.omit({
  kinds: true,
  regionalStatus: true,
  departmentalStatus: true
});

type ProgrammingPlanDbo = z.infer<typeof ProgrammingPlanDbo>;

const ProgrammingPlanLocalStatusDbo = z.object({
  ...ProgrammingPlanLocalStatusType.shape,
  programmingPlanId: z.string(),
  department: z.union([Department, z.literal('None')])
});

type ProgrammingPlanLocalStatusDbo = z.infer<
  typeof ProgrammingPlanLocalStatusDbo
>;

const ProgrammingPlanKindDbo = z.object({
  programmingPlanId: z.guid(),
  kind: ProgrammingPlanKind
});

type ProgrammingPlanKindDbo = z.infer<typeof ProgrammingPlanKindDbo>;

export const ProgrammingPlans = (transaction = db) =>
  transaction<ProgrammingPlanDbo>(programmingPlansTable);
export const ProgrammingPlanLocalStatus = (transaction = db) =>
  transaction<ProgrammingPlanLocalStatusDbo>(programmingPlanLocalStatusTable);
export const ProgrammingPlanKinds = (transaction = db) =>
  transaction<ProgrammingPlanKindDbo>(programmingPlanKindsTable);

const ProgrammingPlanQuery = () =>
  ProgrammingPlans()
    .select(`${programmingPlansTable}.*`)
    .select(
      db.raw(
        `coalesce(array_agg(to_json(${programmingPlanLocalStatusTable}.*)) filter (where ${programmingPlanLocalStatusTable}.department = 'None'), '{}') as "regional_status"`
      ),
      db.raw(
        `coalesce(array_agg(to_json(${programmingPlanLocalStatusTable}.*)) filter (where ${programmingPlanLocalStatusTable}.department != 'None'), '{}') as "departmental_status"`
      ),
      db.raw(`array_agg(distinct(${programmingPlanKindsTable}.kind)) as kinds`)
    )
    .join(
      programmingPlanLocalStatusTable,
      `${programmingPlansTable}.id`,
      `${programmingPlanLocalStatusTable}.programming_plan_id`
    )
    .join(
      programmingPlanKindsTable,
      `${programmingPlansTable}.id`,
      `${programmingPlanKindsTable}.programming_plan_id`
    )
    .groupBy(`${programmingPlansTable}.id`);

const findUnique = async (
  id: string
): Promise<ProgrammingPlanChecked | undefined> => {
  console.info('Find programming plan', id);
  return ProgrammingPlanQuery()
    .where({ id })
    .first()
    .then((_) => _ && ProgrammingPlanChecked.parse(omitBy(_, isNil)));
};

const findOne = async (
  year: number,
  kinds: ProgrammingPlanKind[],
  region?: Region | null
): Promise<ProgrammingPlanChecked | undefined> => {
  console.info('Find programming plan', year, kinds, region);
  return ProgrammingPlanQuery()
    .where({ year })
    .whereIn(`${programmingPlanKindsTable}.kind`, kinds)
    .modify((builder) => {
      if (region) {
        builder.where('region', region);
      }
    })
    .first()
    .then((_) => _ && ProgrammingPlanChecked.parse(omitBy(_, isNil)));
};

const findMany = async (
  findOptions: FindProgrammingPlanOptions
): Promise<ProgrammingPlanChecked[]> => {
  console.info('Find programming plans', omitBy(findOptions, isNil));
  return ProgrammingPlanQuery()
    .where(omitBy(omit(findOptions, 'status', 'kinds', 'ids'), isNil))
    .modify((builder) => {
      if (isArray(findOptions.ids)) {
        builder.whereIn('id', findOptions.ids);
      }
      if (isArray(findOptions.status)) {
        builder.whereIn('status', findOptions.status);
      }
      if (isArray(findOptions.kinds)) {
        builder.whereIn(`${programmingPlanKindsTable}.kind`, findOptions.kinds);
      }
    })
    .then((programmingPlans) =>
      programmingPlans.map((_: any) =>
        ProgrammingPlanChecked.parse(omitBy(_, isNil))
      )
    );
};

const insert = async (
  programmingPlan: ProgrammingPlanChecked
): Promise<void> => {
  console.info('Insert programming plan', programmingPlan.id);

  await db.transaction(async (transaction) => {
    await ProgrammingPlans(transaction).insert(
      formatProgrammingPlan(programmingPlan)
    );

    if (programmingPlan.regionalStatus.length > 0) {
      await ProgrammingPlanLocalStatus(transaction).insert(
        programmingPlan.regionalStatus.map((regionalStatus) => ({
          ...regionalStatus,
          programmingPlanId: programmingPlan.id,
          department: 'None'
        }))
      );
    }

    if (programmingPlan.kinds.length > 0) {
      await ProgrammingPlanKinds(transaction).insert(
        programmingPlan.kinds.map((kind) => ({
          programmingPlanId: programmingPlan.id,
          kind
        }))
      );
    }
  });
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
  programmingPlanId: string,
  programmingPlanLocalStatusList: ProgrammingPlanLocalStatusType[]
): Promise<void> => {
  console.info(
    'Insert programming plan local status',
    programmingPlanId,
    programmingPlanLocalStatusList
  );
  await ProgrammingPlanLocalStatus().insert(
    programmingPlanLocalStatusList.map((localStatus) => ({
      ...localStatus,
      programmingPlanId,
      department: localStatus.department ?? 'None'
    }))
  );
};

const updateLocalStatus = async (
  programmingPlanId: string,
  localStatus: ProgrammingPlanLocalStatusType
): Promise<void> => {
  console.info(
    'Update programming plan local status',
    programmingPlanId,
    localStatus
  );
  await ProgrammingPlanLocalStatus()
    .where({
      programmingPlanId,
      region: localStatus.region,
      department: localStatus.department ?? 'None'
    })
    .update({
      status: localStatus.status
    });
};

export const formatProgrammingPlan = (
  programmingPlan: ProgrammingPlanChecked
): ProgrammingPlanDbo => ProgrammingPlanDbo.parse(programmingPlan);

export default {
  findUnique,
  findOne,
  findMany,
  insert,
  update,
  insertManyLocalStatus,
  updateLocalStatus
};
