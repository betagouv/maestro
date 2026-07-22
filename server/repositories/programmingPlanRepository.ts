import { isArray, isNil, omit, omitBy } from 'lodash-es';
import { Department } from 'maestro-shared/referential/Department';
import { Region } from 'maestro-shared/referential/Region';
import type { DistributionKind } from 'maestro-shared/schema/ProgrammingPlan/DistributionKind';
import type { FindProgrammingPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import { hasSentOnward } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDisplayStatus';
import { ProgrammingPlanLocalStatus as ProgrammingPlanLocalStatusType } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanLocalStatus';
import type { ProgrammingPlanStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
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
  nationalStatus: true,
  regionalStatus: true,
  departmentalStatus: true
});

type ProgrammingPlanDbo = z.infer<typeof ProgrammingPlanDbo>;

const ProgrammingPlanLocalStatusDbo = z.object({
  ...ProgrammingPlanLocalStatusType.shape,
  programmingPlanId: z.string(),
  region: z.union([Region, z.literal('None')]),
  department: z.union([Department, z.literal('None')])
});

type ProgrammingPlanLocalStatusDbo = z.infer<
  typeof ProgrammingPlanLocalStatusDbo
>;

type ProgrammingPlanRow = ProgrammingPlanDbo & {
  nationalStatus: ProgrammingPlanLocalStatusDbo[];
  regionalStatus: ProgrammingPlanLocalStatusDbo[];
  departmentalStatus: ProgrammingPlanLocalStatusDbo[];
  subPlans: unknown[];
};

export const ProgrammingPlans = (transaction = db) =>
  transaction<ProgrammingPlanDbo>(programmingPlansTable);
export const ProgrammingPlanLocalStatus = (transaction = db) =>
  transaction<ProgrammingPlanLocalStatusDbo>(programmingPlanLocalStatusTable);

// json_build_object with explicit camelCase keys, not to_json(table.*): knex-stringcase
// only camelCases top-level query result columns, it never reaches into JSON blob
// contents built by to_json() — sentAt/lastModifiedAt would silently parse as absent
// (Zod .nullish()) since the raw blob keys would still be sent_at/last_modified_at.
const localStatusJsonObject = `json_build_object('status', ${programmingPlanLocalStatusTable}.status, 'region', ${programmingPlanLocalStatusTable}.region, 'department', ${programmingPlanLocalStatusTable}.department, 'sentAt', ${programmingPlanLocalStatusTable}.sent_at, 'lastModifiedAt', ${programmingPlanLocalStatusTable}.last_modified_at)`;

const ProgrammingPlanQuery = () =>
  ProgrammingPlans()
    .select(`${programmingPlansTable}.*`)
    .select(
      db.raw(
        `coalesce(array_agg(${localStatusJsonObject}) filter (where ${programmingPlanLocalStatusTable}.region = 'None'), '{}') as "national_status"`
      ),
      db.raw(
        `coalesce(array_agg(${localStatusJsonObject} order by ${programmingPlanLocalStatusTable}.region) filter (where ${programmingPlanLocalStatusTable}.department = 'None' and ${programmingPlanLocalStatusTable}.region != 'None'), '{}') as "regional_status"`
      ),
      db.raw(
        `coalesce(array_agg(${localStatusJsonObject} order by ${programmingPlanLocalStatusTable}.region, ${programmingPlanLocalStatusTable}.department) filter (where ${programmingPlanLocalStatusTable}.department != 'None'), '{}') as "departmental_status"`
      ),
      db.raw(
        `(SELECT coalesce(json_agg(json_build_object('id', sp.id, 'programmingPlanId', sp.programming_plan_id, 'subPlanNumber', sp.sub_plan_number, 'stages', sp.stages, 'label', sp.label, 'analysisPermissionRole', sp.analysis_permission_role, 'contactListId', sp.contact_list_id, 'withSacha', sp.with_sacha, 'substanceKinds', sp.substance_kinds) ORDER BY sp.sub_plan_number), '[]'::json) FROM ${programmingSubPlansTable} sp WHERE sp.programming_plan_id = ${programmingPlansTable}.id) as "sub_plans"`
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
    .then((_) => _ && parseProgrammingPlan(_));
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
    .then((_) => _ && parseProgrammingPlan(_));
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
      // The national row (region = 'None') must always survive this row-level
      // filter so nationalStatus can be populated by the aggregate below — region,
      // department and status here only gate which REGIONAL/DEPARTMENTAL rows are
      // visible to the requesting user, they have no bearing on the national row.
      if (
        findOptions.region ||
        findOptions.department ||
        isArray(findOptions.status)
      ) {
        builder.andWhere((qb) => {
          qb.where('region', 'None').orWhere((qb2) => {
            if (findOptions.region) {
              qb2.andWhere('region', findOptions.region);
            }
            if (findOptions.department) {
              qb2.andWhere('department', findOptions.department);
            }
            if (isArray(findOptions.status)) {
              qb2.andWhere('status', 'in', findOptions.status);
            }
          });
        });
      }
    })
    .then((programmingPlans) =>
      [...programmingPlans].sort(ProgrammingPlanSort).map((_: any) => {
        return parseProgrammingPlan(_);
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

    await ProgrammingPlanLocalStatus(transaction).insert({
      ...programmingPlan.nationalStatus,
      programmingPlanId: programmingPlan.id,
      region: 'None',
      department: 'None'
    });

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
          subPlanNumber: subPlan.subPlanNumber,
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
      region: localStatus.region ?? 'None',
      department: localStatus.department ?? 'None'
    }))
  );
};

const updateLocalStatus = async (
  programmingPlanId: string,
  localStatus: ProgrammingPlanLocalStatusType,
  distributionKind: DistributionKind
): Promise<void> => {
  console.info(
    'Update programming plan local status',
    programmingPlanId,
    localStatus
  );
  const echelon = localStatus.department ? 'Departmental' : 'Regional';
  const isSend = hasSentOnward(echelon, distributionKind, localStatus.status);

  await ProgrammingPlanLocalStatus()
    .where({
      programmingPlanId,
      region: localStatus.region,
      department: localStatus.department ?? 'None'
    })
    .update({
      status: localStatus.status,
      ...(isSend ? { sentAt: db.raw('coalesce(sent_at, now())') } : {})
    });
};

const updateNationalStatus = async (
  programmingPlanId: string,
  status: ProgrammingPlanStatus,
  distributionKind: DistributionKind
): Promise<void> => {
  console.info(
    'Update programming plan national status',
    programmingPlanId,
    status
  );
  const isSend = hasSentOnward('National', distributionKind, status);

  await ProgrammingPlanLocalStatus()
    .where({ programmingPlanId, region: 'None', department: 'None' })
    .update({
      status,
      ...(isSend ? { sentAt: db.raw('coalesce(sent_at, now())') } : {})
    });
};

const touchNationalSentAt = async (
  programmingPlanId: string,
  sentAt: Date = new Date()
): Promise<void> => {
  console.info('Touch programming plan national sentAt', programmingPlanId);
  await ProgrammingPlanLocalStatus()
    .where({ programmingPlanId, region: 'None', department: 'None' })
    .update({ sentAt });
};

const touchRegionalSentAt = async (
  programmingPlanId: string,
  region: Region,
  sentAt: Date = new Date()
): Promise<void> => {
  console.info(
    'Touch programming plan regional sentAt',
    programmingPlanId,
    region
  );
  await ProgrammingPlanLocalStatus()
    .where({ programmingPlanId, region, department: 'None' })
    .update({ sentAt });
};

const touchLocalStatus = async (
  programmingPlanId: string,
  scope: { region?: Region; department?: Department } = {}
): Promise<void> => {
  console.info('Touch programming plan local status', programmingPlanId, scope);
  const lastModifiedAt = new Date();
  await ProgrammingPlanLocalStatus()
    .where({ programmingPlanId })
    .modify((builder) => {
      if (scope.region) {
        builder.andWhere('region', scope.region);
      }
      if (scope.department) {
        builder.andWhere('department', scope.department);
      }
    })
    .update({ lastModifiedAt });

  // A department-level edit must also mark that region's own row as
  // modified-since-sent, so the regional coordinator's bulk-send eligibility
  // (send-to-departments) correctly flips back to "ready to send".
  if (scope.region && scope.department) {
    await ProgrammingPlanLocalStatus()
      .where({ programmingPlanId, region: scope.region, department: 'None' })
      .update({ lastModifiedAt });
  }

  // A regional/departmental edit must also mark the national row as
  // modified-since-sent, otherwise bulk-send eligibility (computed solely
  // from the national row's own sentAt/lastModifiedAt) never flips back to
  // "ready to send" after the plan was already sent once.
  if (scope.region) {
    await ProgrammingPlanLocalStatus()
      .where({ programmingPlanId, region: 'None', department: 'None' })
      .update({ lastModifiedAt });
  }
};

export const formatProgrammingPlan = (
  programmingPlan: ProgrammingPlanChecked
): ProgrammingPlanDbo => ProgrammingPlanDbo.parse(programmingPlan);

const parseProgrammingPlan = (
  row: ProgrammingPlanRow
): ProgrammingPlanChecked =>
  ProgrammingPlanChecked.parse(
    omitBy({ ...row, nationalStatus: row.nationalStatus?.[0] }, isNil)
  );

export default {
  findUnique,
  findOne,
  findMany,
  insert,
  update,
  insertManyLocalStatus,
  updateLocalStatus,
  updateNationalStatus,
  touchLocalStatus,
  touchNationalSentAt,
  touchRegionalSentAt
};
