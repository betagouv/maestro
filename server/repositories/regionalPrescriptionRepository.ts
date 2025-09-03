import { Knex } from 'knex';
import { isArray, isNil, omit, omitBy, uniq } from 'lodash-es';
import {
  FindRegionalPrescriptionOptions,
  RegionalPrescriptionOptionsInclude
} from 'maestro-shared/schema/RegionalPrescription/FindRegionalPrescriptionOptions';
import { RegionalPrescription } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import {
  InProgressStatusList,
  RealizedStatusList
} from 'maestro-shared/schema/Sample/SampleStatus';
import { knexInstance as db } from './db';
import { prescriptionsTable } from './prescriptionRepository';
import { regionalPrescriptionCommentsTable } from './regionalPrescriptionCommentRepository';
import { samplesTable } from './sampleRepository';
const regionalPrescriptionsTable = 'regional_prescriptions';

export const RegionalPrescriptions = () =>
  db<RegionalPrescription>(regionalPrescriptionsTable);

const findUnique = async (
  id: string
): Promise<RegionalPrescription | undefined> => {
  console.info('Find regional prescription', id);
  return RegionalPrescriptions()
    .where('id', id)
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
        omit(
          findOptions,
          'programmingPlanId',
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
    .where(
      `${prescriptionsTable}.programming_plan_id`,
      findOptions.programmingPlanId
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
          query.on(
            `${regionalPrescriptionCommentsTable}.regional_prescription_id`,
            `${regionalPrescriptionsTable}.id`
          )
        )
        .groupBy(`${regionalPrescriptionsTable}.id`);
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
    .where('id', regionalPrescription.id)
    .update(regionalPrescription);
};

export default {
  findUnique,
  findMany,
  insertMany,
  update
};
