import { isArray, isNil, omit, omitBy } from 'lodash-es';
import { Department } from 'maestro-shared/referential/Department';
import type { Region } from 'maestro-shared/referential/Region';
import type { FindProgrammingPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import { ProgrammingPlanLocalStatus as ProgrammingPlanLocalStatusType } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanLocalStatus';
import {
  ProgrammingPlanBase,
  ProgrammingPlanChecked,
  ProgrammingPlanSort
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import z from 'zod';
import { knexInstance as db } from './db';
import {
  ProgrammingSubPlans,
  programmingSubPlansTable
} from './programmingSubPlanRepository';

export const programmingPlansTable = 'programming_plans';
const programmingPlanLocalStatusTable = 'programming_plan_local_status';

const ProgrammingPlanDbo = ProgrammingPlanBase.omit({
  subPlans: true,
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

export const ProgrammingPlans = (transaction = db) =>
  transaction<ProgrammingPlanDbo>(programmingPlansTable);
export const ProgrammingPlanLocalStatus = (transaction = db) =>
  transaction<ProgrammingPlanLocalStatusDbo>(programmingPlanLocalStatusTable);

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
      db.raw(
        `(SELECT coalesce(json_agg(json_build_object('id', sp.id, 'programmingPlanId', sp.programming_plan_id, 'codeNat', sp.code_nat, 'stages', sp.stages, 'label', sp.label, 'analysisPermissionRole', sp.analysis_permission_role, 'contactListId', sp.contact_list_id, 'withSacha', sp.with_sacha, 'substanceKinds', sp.substance_kinds) ORDER BY sp.code_nat), '[]'::json) FROM ${programmingSubPlansTable} sp WHERE sp.programming_plan_id = ${programmingPlansTable}.id) as "sub_plans"`
      )
    )
    .join(
      programmingPlanLocalStatusTable,
      `${programmingPlansTable}.id`,
      `${programmingPlanLocalStatusTable}.programming_plan_id`
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
  subPlanIds: ProgrammingSubPlanId[],
  region?: Region | null
): Promise<ProgrammingPlanChecked | undefined> => {
  console.info('Find programming plan', year, subPlanIds, region);
  return ProgrammingPlanQuery()
    .where({ year })
    .whereExists(
      db(programmingSubPlansTable)
        .whereIn(`${programmingSubPlansTable}.id`, subPlanIds)
        .whereRaw(
          `${programmingSubPlansTable}.programming_plan_id = ${programmingPlansTable}.id`
        )
    )
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
    .where(omitBy(omit(findOptions, 'status', 'subPlanIds', 'ids'), isNil))
    .modify((builder) => {
      if (isArray(findOptions.ids)) {
        builder.whereIn('id', findOptions.ids);
      }
      if (isArray(findOptions.status)) {
        builder.whereIn('status', findOptions.status);
      }
      if (isArray(findOptions.subPlanIds)) {
        builder.whereExists(
          db(programmingSubPlansTable)
            .whereIn(`${programmingSubPlansTable}.id`, findOptions.subPlanIds)
            .whereRaw(
              `${programmingSubPlansTable}.programming_plan_id = ${programmingPlansTable}.id`
            )
        );
      }
    })
    .then((programmingPlans) =>
      [...programmingPlans].sort(ProgrammingPlanSort).map((_: any) => {
        return ProgrammingPlanChecked.parse(omitBy(_, isNil));
      })
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

    if (programmingPlan.subPlans.length > 0) {
      await ProgrammingSubPlans(transaction).insert(
        programmingPlan.subPlans.map((subPlan) => ({
          id: subPlan.id,
          programmingPlanId: programmingPlan.id,
          codeNat: subPlan.codeNat,
          stages: subPlan.stages,
          label: subPlan.label,
          analysisPermissionRole: subPlan.analysisPermissionRole ?? null,
          contactListId: subPlan.contactListId ?? null,
          withSacha: subPlan.withSacha,
          substanceKinds: subPlan.substanceKinds
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
