import { isArray, isNil, omit, omitBy } from 'lodash-es';
import type { Region } from 'maestro-shared/referential/Region';
import type { FindProgrammingPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import {
  ProgrammingPlanBase,
  ProgrammingPlanChecked,
  ProgrammingPlanSort
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type z from 'zod';
import { knexInstance as db } from './db';
import { programmingSubPlansTable } from './programmingSubPlanRepository';

export const programmingPlansTable = 'programming_plans';

const ProgrammingPlanDbo = ProgrammingPlanBase.omit({
  subPlanIds: true
});

type ProgrammingPlanDbo = z.infer<typeof ProgrammingPlanDbo>;

export const ProgrammingPlans = (transaction = db) =>
  transaction<ProgrammingPlanDbo>(programmingPlansTable);

const ProgrammingPlanQuery = () =>
  ProgrammingPlans()
    .select(`${programmingPlansTable}.*`)
    .select(
      db.raw(
        `(SELECT coalesce(json_agg(json_build_object( sp.id) ORDER BY sp.sub_plan_number), '[]'::json) FROM ${programmingSubPlansTable} sp WHERE sp.programming_plan_id = ${programmingPlansTable}.id) as "sub_plans"`
      )
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

const update = async (
  programmingPlan: ProgrammingPlanChecked
): Promise<void> => {
  console.info('Update programming plan with id', programmingPlan.id);
  await ProgrammingPlans()
    .where({ id: programmingPlan.id })
    .update(formatProgrammingPlan(programmingPlan));
};

// const insertManyLocalStatus = async (
//   programmingPlanId: string,
//   programmingPlanLocalStatusList: ProgrammingPlanLocalStatusType[]
// ): Promise<void> => {
//   console.info(
//     'Insert programming plan local status',
//     programmingPlanId,
//     programmingPlanLocalStatusList
//   );
//   await ProgrammingPlanLocalStatus().insert(
//     programmingPlanLocalStatusList.map((localStatus) => ({
//       ...localStatus,
//       programmingPlanId,
//       department: localStatus.department ?? 'None'
//     }))
//   );
// };
//
// const updateLocalStatus = async (
//   programmingPlanId: string,
//   localStatus: ProgrammingPlanLocalStatusType
// ): Promise<void> => {
//   console.info(
//     'Update programming plan local status',
//     programmingPlanId,
//     localStatus
//   );
//   await ProgrammingPlanLocalStatus()
//     .where({
//       programmingPlanId,
//       region: localStatus.region,
//       department: localStatus.department ?? 'None'
//     })
//     .update({
//       status: localStatus.status
//     });
// };

export const formatProgrammingPlan = (
  programmingPlan: ProgrammingPlanChecked
): ProgrammingPlanDbo => ProgrammingPlanDbo.parse(programmingPlan);

export default {
  findUnique,
  findOne,
  findMany,
  update
};
