import { Knex } from 'knex';
import { isArray, isNil, omit, omitBy, uniq } from 'lodash-es';
import {
  FindRegionalPrescriptionOptions,
  RegionalPrescriptionOptionsInclude
} from 'maestro-shared/schema/RegionalPrescription/FindRegionalPrescriptionOptions';
import {
  RegionalPrescription,
  RegionalPrescriptionKey
} from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { knexInstance as db } from './db';
import { prescriptionsTable } from './prescriptionRepository';
import { regionalPrescriptionCommentsTable } from './regionalPrescriptionCommentRepository';
import { samplesTable } from './sampleRepository';
export const regionalPrescriptionsTable = 'regional_prescriptions';

export const RegionalPrescriptions = () =>
  db<RegionalPrescription>(regionalPrescriptionsTable);

const findUnique = async ({
  prescriptionId,
  region
}: RegionalPrescriptionKey): Promise<RegionalPrescription | undefined> => {
  console.info('Find regional prescription', prescriptionId, region);
  return RegionalPrescriptions()
    .where('prescriptionId', prescriptionId)
    .where('region', region)
    .first()
    .then((_) => _ && RegionalPrescription.parse(omitBy(_, isNil)));
};

const findMany = async (
  findOptions: FindRegionalPrescriptionOptions
): Promise<RegionalPrescription[]> => {
  console.info('Find regional prescriptions', omitBy(findOptions, isNil));
  return RegionalPrescriptions()
    .select(`${regionalPrescriptionsTable}.*`)
    .where(
      omitBy(
        omit(findOptions, 'programmingPlanId', 'context', 'includes', 'region'),
        isNil
      )
    )
    .join(
      prescriptionsTable,
      `${regionalPrescriptionsTable}.prescription_id`,
      `${prescriptionsTable}.id`
    )
    .where(
      `${prescriptionsTable}.programming_plan_id`,
      findOptions.programmingPlanId
    )
    .where(`${prescriptionsTable}.context`, findOptions.context)
    .modify((builder) => {
      if (findOptions.region) {
        builder
          .where(`${regionalPrescriptionsTable}.region`, findOptions.region)
          .andWhereNot(`${regionalPrescriptionsTable}.sampleCount`, 0);
      }
    })
    .modify(include(findOptions))
    .then((regionalPrescriptions) =>
      regionalPrescriptions.map((_: RegionalPrescription) =>
        RegionalPrescription.parse(omitBy(_, isNil))
      )
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
        )
        .groupBy(
          `${regionalPrescriptionsTable}.prescription_id`,
          `${regionalPrescriptionsTable}.region`
        );
    },
    realizedSampleCount: (query) => {
      query
        .select(db.raw(`count(${samplesTable}.id) as realized_sample_count`))
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
          `${regionalPrescriptionsTable}.region`
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
    await RegionalPrescriptions().insert(regionalPrescriptions);
  }
};

const update = async (regionalPrescription: RegionalPrescription) => {
  console.info('Update regional prescription', regionalPrescription);
  await RegionalPrescriptions()
    .where('prescriptionId', regionalPrescription.prescriptionId)
    .where('region', regionalPrescription.region)
    .update(regionalPrescription);
};

export default {
  findUnique,
  findMany,
  insertMany,
  update
};
