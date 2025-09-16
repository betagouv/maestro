import { Knex } from 'knex';
import { isArray, isNil, omit, omitBy, uniq } from 'lodash-es';
import { Department } from 'maestro-shared/referential/Department';
import {
  FindRegionalPrescriptionOptions,
  RegionalPrescriptionOptionsInclude
} from 'maestro-shared/schema/RegionalPrescription/FindRegionalPrescriptionOptions';
import { RegionalPrescription } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { RegionalPrescriptionKey } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescriptionKey';
import {
  InProgressStatusList,
  RealizedStatusList
} from 'maestro-shared/schema/Sample/SampleStatus';
import { z } from 'zod';
import { knexInstance as db } from './db';
import { prescriptionsTable } from './prescriptionRepository';
import { regionalPrescriptionCommentsTable } from './regionalPrescriptionCommentRepository';
import { samplesTable } from './sampleRepository';
const regionalPrescriptionsTable = 'regional_prescriptions';

const RegionalPrescriptionsDbo = z.object({
  ...RegionalPrescription.shape,
  department: z.union([Department, z.literal('None')])
});

type RegionalPrescriptionsDbo = z.infer<typeof RegionalPrescriptionsDbo>;

export const RegionalPrescriptions = () =>
  db<RegionalPrescriptionsDbo>(regionalPrescriptionsTable);

const findUnique = async ({
  prescriptionId,
  region,
  department
}: RegionalPrescriptionKey): Promise<RegionalPrescription | undefined> => {
  console.info('Find regional prescription', prescriptionId, region);
  return RegionalPrescriptions()
    .where({ prescriptionId, region, department: department ?? 'None' })
    .first()
    .then((_) => _ && parseRegionalPrescription(_));
};

const findMany = async (
  findOptions: FindRegionalPrescriptionOptions
): Promise<RegionalPrescription[]> => {
  console.info('Find regional prescriptions', omitBy(findOptions, isNil));
  return RegionalPrescriptions()
    .select(`${regionalPrescriptionsTable}.*`)
    .where(
      omitBy(
        omit(
          findOptions,
          'programmingPlanIds',
          'programmingPlanKinds',
          'context',
          'includes',
          'region',
          'contexts'
        ),
        isNil
      )
    )
    .join(
      prescriptionsTable,
      `${regionalPrescriptionsTable}.prescription_id`,
      `${prescriptionsTable}.id`
    )
    .whereIn(
      `${prescriptionsTable}.programming_plan_id`,
      findOptions.programmingPlanIds
    )
    .modify((builder) => {
      if (findOptions.contexts) {
        builder.whereIn(`${prescriptionsTable}.context`, findOptions.contexts);
      }
      if (findOptions.region) {
        builder
          .where(`${regionalPrescriptionsTable}.region`, findOptions.region)
          .andWhereNot(`${regionalPrescriptionsTable}.sampleCount`, 0);
      }
      if (findOptions.programmingPlanKinds) {
        builder.whereIn(
          `${prescriptionsTable}.programming_plan_kind`,
          findOptions.programmingPlanKinds
        );
      }
    })
    .modify(include(findOptions))
    .then((regionalPrescriptions) =>
      regionalPrescriptions.map(parseRegionalPrescription)
    );
};

const include = (opts?: FindRegionalPrescriptionOptions) => {
  const joins: Record<
    RegionalPrescriptionOptionsInclude,
    (query: Knex.QueryBuilder) => void
  > = {
    comments: (query) => {
      query
        .select(
          db.raw(
            `case 
              when count(${regionalPrescriptionCommentsTable}.id) > 0 
                then array_agg(
                  json_build_object(
                    'id', ${regionalPrescriptionCommentsTable}.id, 
                    'comment', ${regionalPrescriptionCommentsTable}.comment, 
                    'createdAt', ${regionalPrescriptionCommentsTable}.created_at, 
                    'createdBy', ${regionalPrescriptionCommentsTable}.created_by
                  )
                ) 
              else '{}' end as comments`
          )
        )
        .leftJoin(regionalPrescriptionCommentsTable, (query) =>
          query
            .on(
              `${regionalPrescriptionCommentsTable}.prescription_id`,
              `${regionalPrescriptionsTable}.prescription_id`
            )
            .andOn(
              `${regionalPrescriptionCommentsTable}.region`,
              `${regionalPrescriptionsTable}.region`
            )
            .andOn(
              `${regionalPrescriptionCommentsTable}.department`,
              `${regionalPrescriptionsTable}.department`
            )
        )
        .groupBy(
          `${regionalPrescriptionsTable}.prescription_id`,
          `${regionalPrescriptionsTable}.region`,
          `${regionalPrescriptionsTable}.department`
        );
    },
    sampleCounts: (query) => {
      query
        .select(
          db.raw(
            `count(distinct(${samplesTable}.id)) filter(where ${samplesTable}.status = any(?)) as in_progress_sample_count`,
            [InProgressStatusList]
          ),
          db.raw(
            `count(distinct(${samplesTable}.id)) filter(where ${samplesTable}.status = any(?)) as realized_sample_count`,
            [RealizedStatusList]
          )
        )
        .leftJoin(samplesTable, (query) =>
          query
            .on(
              `${samplesTable}.prescription_id`,
              `${regionalPrescriptionsTable}.prescription_id`
            )
            .andOn(
              `${samplesTable}.region`,
              `${regionalPrescriptionsTable}.region`
            )
        )
        .groupBy(
          `${regionalPrescriptionsTable}.prescription_id`,
          `${regionalPrescriptionsTable}.region`,
          `${regionalPrescriptionsTable}.department`
        );
    }
  };

  return (query: Knex.QueryBuilder) => {
    const includes = opts?.includes
      ? isArray(opts.includes)
        ? opts.includes
        : [opts.includes]
      : [];
    uniq(includes).forEach((include) => {
      joins[include as RegionalPrescriptionOptionsInclude](query);
    });
  };
};

const insertMany = async (regionalPrescriptions: RegionalPrescription[]) => {
  console.info('Insert multiple regional prescriptions');
  if (regionalPrescriptions.length > 0) {
    await RegionalPrescriptions().insert(
      regionalPrescriptions.map(formatRegionalPrescription)
    );
  }
};

const update = async (regionalPrescription: RegionalPrescription) => {
  console.info('Update regional prescription', regionalPrescription);
  await RegionalPrescriptions()
    .where({
      prescriptionId: regionalPrescription.prescriptionId,
      region: regionalPrescription.region,
      department: regionalPrescription.department ?? 'None'
    })
    .update(formatRegionalPrescription(regionalPrescription));
};

export const formatRegionalPrescription = (
  regionalPrescription: RegionalPrescription
): RegionalPrescriptionsDbo => ({
  ...regionalPrescription,
  department: regionalPrescription.department ?? 'None'
});

const parseRegionalPrescription = (
  regionalPrescriptionDbo: RegionalPrescriptionsDbo
): RegionalPrescription =>
  RegionalPrescription.parse(
    omitBy(
      {
        ...regionalPrescriptionDbo,
        department:
          regionalPrescriptionDbo.department === 'None'
            ? undefined
            : regionalPrescriptionDbo.department
      },
      isNil
    )
  );

export default {
  findUnique,
  findMany,
  insertMany,
  update
};
