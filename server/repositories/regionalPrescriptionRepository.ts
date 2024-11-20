import { Knex } from 'knex';
import { default as fp, default as _, isArray } from 'lodash';
import { RegionList, Regions } from '../../shared/referential/Region';
import {
  FindRegionalPrescriptionOptions,
  FindRegionalPrescriptionOptionsInclude,
} from '../../shared/schema/RegionalPrescription/FindRegionalPrescriptionOptions';
import { RegionalPrescription } from '../../shared/schema/RegionalPrescription/RegionalPrescription';
import { RealizedStatusList } from '../../shared/schema/Sample/SampleStatus';
import db from './db';
import { prescriptionsTable } from './prescriptionRepository';
import { regionalPrescriptionCommentsTable } from './regionalPrescriptionCommentRepository';
import { samplesTable } from './sampleRepository';
export const regionalPrescriptionsTable = 'regional_prescriptions';

export const RegionalPrescriptions = () =>
  db<RegionalPrescription>(regionalPrescriptionsTable);

const findUnique = async (
  id: string
): Promise<RegionalPrescription | undefined> => {
  console.info('Find regional prescription by id', id);
  return RegionalPrescriptions()
    .where({ id })
    .first()
    .then((_) => _ && RegionalPrescription.parse(fp.omitBy(_, fp.isNil)));
};

const findMany = async (
  findOptions: FindRegionalPrescriptionOptions
): Promise<RegionalPrescription[]> => {
  console.info('Find regional prescriptions', fp.omitBy(findOptions, fp.isNil));
  return RegionalPrescriptions()
    .select(`${regionalPrescriptionsTable}.*`)
    .where(
      fp.omitBy(
        fp.omit(findOptions, 'programmingPlanId', 'context', 'includes'),
        fp.isNil
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
        builder.where(
          `${regionalPrescriptionsTable}.region`,
          findOptions.region
        );
      }
    })
    .modify(include(findOptions))
    .then((regionalPrescriptions) =>
      regionalPrescriptions.map((_: RegionalPrescription) =>
        RegionalPrescription.parse(fp.omitBy(_, fp.isNil))
      )
    );
};

const include = (opts?: FindRegionalPrescriptionOptions) => {
  const joins: Record<
    FindRegionalPrescriptionOptionsInclude,
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
        .leftJoin(
          regionalPrescriptionCommentsTable,
          `${regionalPrescriptionCommentsTable}.regional_prescription_id`,
          `${regionalPrescriptionsTable}.id`
        )
        .groupBy(`${regionalPrescriptionsTable}.id`);
    },
    realizedSampleCount: (query) => {
      query
        .select(db.raw(`count(${samplesTable}.id) as realized_sample_count`))
        .leftJoin(samplesTable, (query) =>
          query
            .on({
              [`${samplesTable}.programming_plan_id`]: `${prescriptionsTable}.programming_plan_id`,
              [`${samplesTable}.matrix`]: `${prescriptionsTable}.matrix`,
            })
            .andOn(
              db.raw(
                `${samplesTable}.stage = any(${prescriptionsTable}.stages)`
              )
            )
            .andOn(
              db.raw(
                `${regionalPrescriptionsTable}.region = case ${RegionList.map(
                  (region) =>
                    `when '${Regions[region].shortName}' = split_part(${samplesTable}.reference, '-', 1) then '${region}'`
                ).join(' ')} end`
              )
            )
            .andOnIn(`${samplesTable}.status`, RealizedStatusList)
        )
        .groupBy(`${regionalPrescriptionsTable}.id`);
    },
  };

  return (query: Knex.QueryBuilder) => {
    const includes = opts?.includes
      ? isArray(opts.includes)
        ? opts.includes
        : [opts.includes]
      : [];
    _.uniq(includes).forEach((include) => {
      joins[include as FindRegionalPrescriptionOptionsInclude](query);
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
  update,
};
