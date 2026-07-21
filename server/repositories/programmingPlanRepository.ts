import { isArray, isNil, omit, omitBy } from 'lodash-es';
import type { FindProgrammingPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import {
  ProgrammingPlanBase,
  ProgrammingPlanChecked,
  ProgrammingPlanSort
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type z from 'zod';
import { knexInstance as db } from './db';
import {
  ProgrammingSubPlans,
  programmingSubPlanRepository,
  programmingSubPlansTable
} from './programmingSubPlanRepository';

export const programmingPlansTable = 'programming_plans';
const programmingSubPlanLocalStatusTable = 'programming_sub_plan_local_status';

const ProgrammingPlanDbo = ProgrammingPlanBase.omit({
  subPlans: true
});

type ProgrammingPlanDbo = z.infer<typeof ProgrammingPlanDbo>;

export const ProgrammingPlans = (transaction = db) =>
  transaction<ProgrammingPlanDbo>(programmingPlansTable);

const ProgrammingPlanQuery = () =>
  ProgrammingPlans()
    .select(`${programmingPlansTable}.*`)
    .select(
      db.raw(
        `(SELECT coalesce(json_agg(json_build_object(
            'id', sp.id,
            'programmingPlanId', sp.programming_plan_id,
            'subPlanNumber', sp.sub_plan_number,
            'stages', sp.stages,
            'label', sp.label,
            'analysisPermissionRole', sp.analysis_permission_role,
            'contactListId', sp.contact_list_id,
            'withSacha', sp.with_sacha,
            'substanceKinds', sp.substance_kinds,
            'regionalStatus', (
              SELECT coalesce(json_agg(json_build_object('status', pspls.status, 'region', pspls.region) ORDER BY pspls.region), '[]'::json)
              FROM ${programmingSubPlanLocalStatusTable} pspls
              WHERE pspls.programming_sub_plan_id = sp.id AND pspls.department = 'None'
            ),
            'departmentalStatus', (
              SELECT coalesce(json_agg(json_build_object('status', pspls.status, 'region', pspls.region, 'department', pspls.department) ORDER BY pspls.region, pspls.department), '[]'::json)
              FROM ${programmingSubPlanLocalStatusTable} pspls
              WHERE pspls.programming_sub_plan_id = sp.id AND pspls.department != 'None'
            )
          ) ORDER BY sp.sub_plan_number), '[]'::json)
          FROM ${programmingSubPlansTable} sp
          WHERE sp.programming_plan_id = ${programmingPlansTable}.id) as "sub_plans"`
      )
    );

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
  subPlanIds: ProgrammingSubPlanId[]
): Promise<ProgrammingPlanChecked | undefined> => {
  console.info('Find programming plan', year, subPlanIds);
  return ProgrammingPlanQuery()
    .where({ year })
    .whereExists(
      db(programmingSubPlansTable)
        .whereIn(`${programmingSubPlansTable}.id`, subPlanIds)
        .whereRaw(
          `${programmingSubPlansTable}.programming_plan_id = ${programmingPlansTable}.id`
        )
    )
    .first()
    .then((_) => _ && ProgrammingPlanChecked.parse(omitBy(_, isNil)));
};

const findMany = async (
  findOptions: FindProgrammingPlanOptions
): Promise<ProgrammingPlanChecked[]> => {
  console.info('Find programming plans', omitBy(findOptions, isNil));
  return ProgrammingPlanQuery()
    .where(
      omitBy(
        omit(
          findOptions,
          'status',
          'subPlanIds',
          'ids',
          'region',
          'department'
        ),
        isNil
      )
    )
    .modify((builder) => {
      if (isArray(findOptions.ids)) {
        builder.whereIn('id', findOptions.ids);
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
      if (
        isArray(findOptions.status) ||
        findOptions.region ||
        findOptions.department
      ) {
        builder.whereExists(
          db(programmingSubPlanLocalStatusTable)
            .join(
              programmingSubPlansTable,
              `${programmingSubPlansTable}.id`,
              `${programmingSubPlanLocalStatusTable}.programming_sub_plan_id`
            )
            .whereRaw(
              `${programmingSubPlansTable}.programming_plan_id = ${programmingPlansTable}.id`
            )
            .modify((statusBuilder) => {
              if (isArray(findOptions.status)) {
                statusBuilder.whereIn(
                  `${programmingSubPlanLocalStatusTable}.status`,
                  findOptions.status
                );
              }
              if (findOptions.region) {
                statusBuilder.where(
                  `${programmingSubPlanLocalStatusTable}.region`,
                  findOptions.region
                );
              }
              if (findOptions.department) {
                statusBuilder.where(
                  `${programmingSubPlanLocalStatusTable}.department`,
                  findOptions.department
                );
              }
            })
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

    if (programmingPlan.subPlans.length > 0) {
      await ProgrammingSubPlans(transaction).insert(
        programmingPlan.subPlans.map((subPlan) => ({
          id: subPlan.id,
          programmingPlanId: programmingPlan.id,
          subPlanNumber: subPlan.subPlanNumber,
          stages: subPlan.stages,
          label: subPlan.label,
          analysisPermissionRole: subPlan.analysisPermissionRole ?? null,
          contactListId: subPlan.contactListId ?? null,
          withSacha: subPlan.withSacha,
          substanceKinds: subPlan.substanceKinds
        }))
      );

      await Promise.all(
        programmingPlan.subPlans.flatMap((subPlan) => [
          programmingSubPlanRepository.insertManyLocalStatus(
            subPlan.id,
            subPlan.regionalStatus,
            transaction
          ),
          programmingSubPlanRepository.insertManyLocalStatus(
            subPlan.id,
            subPlan.departmentalStatus,
            transaction
          )
        ])
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

export const formatProgrammingPlan = (
  programmingPlan: ProgrammingPlanChecked
): ProgrammingPlanDbo => ProgrammingPlanDbo.parse(programmingPlan);

export default {
  findUnique,
  findOne,
  findMany,
  insert,
  update
};
