import { Knex } from 'knex';
import { isArray, isNil, omit, omitBy, uniq } from 'lodash-es';
import { Department } from 'maestro-shared/referential/Department';
import {
  FindLocalPrescriptionOptions,
  LocalPrescriptionOptionsInclude
} from 'maestro-shared/schema/LocalPrescription/FindLocalPrescriptionOptions';
import { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import {
  InProgressStatusList,
  RealizedStatusList
} from 'maestro-shared/schema/Sample/SampleStatus';
import { z } from 'zod';
import { knexInstance as db } from './db';
import { localPrescriptionCommentsTable } from './localPrescriptionCommentRepository';
import { prescriptionsTable } from './prescriptionRepository';
import { samplesTable } from './sampleRepository';
const localPrescriptionsTable = 'local_prescriptions';

const LocalPrescriptionsDbo = z.object({
  ...LocalPrescription.shape,
  department: z.union([Department, z.literal('None')]),
  companySiret: z.union([z.guid(), z.literal('None')])
});

type LocalPrescriptionsDbo = z.infer<typeof LocalPrescriptionsDbo>;

export const LocalPrescriptions = (transaction = db) =>
  transaction<LocalPrescriptionsDbo>(localPrescriptionsTable);

const findUnique = async ({
  prescriptionId,
  region,
  department,
  companySiret
}: LocalPrescriptionKey): Promise<LocalPrescription | undefined> => {
  console.info('Find local prescription', prescriptionId, region);
  return LocalPrescriptions()
    .where({
      prescriptionId,
      region,
      department: department ?? 'None',
      companySiret: companySiret ?? 'None'
    })
    .first()
    .then((_) => _ && parseLocalPrescription(_));
};

const findMany = async (
  findOptions: FindLocalPrescriptionOptions
): Promise<LocalPrescription[]> => {
  console.info('Find local prescriptions', omitBy(findOptions, isNil));
  return LocalPrescriptions()
    .select(`${localPrescriptionsTable}.*`)
    .where(
      omitBy(
        omit(
          findOptions,
          'programmingPlanId',
          'programmingPlanKinds',
          'context',
          'includes',
          'region',
          'department',
          'contexts'
        ),
        isNil
      )
    )
    .join(
      prescriptionsTable,
      `${localPrescriptionsTable}.prescription_id`,
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

      if (!findOptions.region) {
        builder.where(`${localPrescriptionsTable}.department`, 'None');
        builder.where(`${localPrescriptionsTable}.companySiret`, 'None');
      } else {
        builder.where(`${localPrescriptionsTable}.region`, findOptions.region);
        if (!findOptions.department) {
          builder.where(`${localPrescriptionsTable}.companySiret`, 'None');
        } else {
          builder.where(
            `${localPrescriptionsTable}.department`,
            findOptions.department
          );
        }
      }
      if (findOptions.programmingPlanKinds) {
        builder.whereIn(
          `${prescriptionsTable}.programming_plan_kind`,
          findOptions.programmingPlanKinds
        );
      }
    })
    .modify(include(findOptions))
    .then((localPrescriptions) =>
      localPrescriptions.map(parseLocalPrescription)
    );
};

const include = (opts?: FindLocalPrescriptionOptions) => {
  const joins: Record<
    LocalPrescriptionOptionsInclude,
    (query: Knex.QueryBuilder) => void
  > = {
    comments: (query) => {
      query
        .select(
          db.raw(
            `case 
              when count(${localPrescriptionCommentsTable}.id) > 0 
                then array_agg(
                  json_build_object(
                    'id', ${localPrescriptionCommentsTable}.id, 
                    'comment', ${localPrescriptionCommentsTable}.comment, 
                    'createdAt', ${localPrescriptionCommentsTable}.created_at, 
                    'createdBy', ${localPrescriptionCommentsTable}.created_by
                  )
                ) 
              else '{}' end as comments`
          )
        )
        .leftJoin(localPrescriptionCommentsTable, (query) =>
          query
            .on(
              `${localPrescriptionCommentsTable}.prescription_id`,
              `${localPrescriptionsTable}.prescription_id`
            )
            .andOn(
              `${localPrescriptionCommentsTable}.region`,
              `${localPrescriptionsTable}.region`
            )
            .andOn(
              `${localPrescriptionCommentsTable}.department`,
              `${localPrescriptionsTable}.department`
            )
            .andOn(
              `${localPrescriptionCommentsTable}.company_siret`,
              `${localPrescriptionsTable}.companySiret`
            )
        )
        .groupBy(
          `${localPrescriptionsTable}.prescription_id`,
          `${localPrescriptionsTable}.region`,
          `${localPrescriptionsTable}.department`,
          `${localPrescriptionsTable}.companySiret`
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
              `${localPrescriptionsTable}.prescription_id`
            )
            .andOn(
              `${samplesTable}.region`,
              `${localPrescriptionsTable}.region`
            )
        )
        .groupBy(
          `${localPrescriptionsTable}.prescription_id`,
          `${localPrescriptionsTable}.region`,
          `${localPrescriptionsTable}.department`,
          `${localPrescriptionsTable}.companySiret`
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
      joins[include as LocalPrescriptionOptionsInclude](query);
    });
  };
};

const insertMany = async (localPrescriptions: LocalPrescription[]) => {
  console.info('Insert multiple local prescriptions');
  if (localPrescriptions.length > 0) {
    await LocalPrescriptions().insert(
      localPrescriptions.map(formatLocalPrescription)
    );
  }
};

const update = async (localPrescription: LocalPrescription) => {
  console.info('Update local prescription', localPrescription);
  await LocalPrescriptions()
    .where({
      prescriptionId: localPrescription.prescriptionId,
      region: localPrescription.region,
      department: localPrescription.department ?? 'None',
      companySiret: localPrescription.companySiret ?? 'None'
    })
    .update(formatLocalPrescription(localPrescription));
};

const updateMany = async (
  localPrescription: Omit<Required<LocalPrescriptionKey>, 'companySiret'>,
  subLocalPrescriptions: LocalPrescription[]
): Promise<void> => {
  console.info('Update local subprescriptions', localPrescription);
  await db.transaction(async (transaction) => {
    await LocalPrescriptions(transaction)
      .where({
        prescriptionId: localPrescription.prescriptionId,
        region: localPrescription.region,
        department: localPrescription.department as Department
      })
      .whereNot({
        companySiret: 'None'
      })
      .forUpdate();
    await LocalPrescriptions(transaction)
      .where({
        prescriptionId: localPrescription.prescriptionId,
        region: localPrescription.region,
        department: localPrescription.department as Department
      })
      .whereNot({
        companySiret: 'None'
      })
      .delete();
    if (subLocalPrescriptions.length > 0) {
      await LocalPrescriptions(transaction).insert(
        subLocalPrescriptions.map(formatLocalPrescription)
      );
    }
  });
};

export const formatLocalPrescription = (
  localPrescription: LocalPrescription
): LocalPrescriptionsDbo => ({
  ...localPrescription,
  department: localPrescription.department ?? 'None',
  companySiret: localPrescription.companySiret ?? 'None'
});

const parseLocalPrescription = (
  localPrescriptionDbo: LocalPrescriptionsDbo
): LocalPrescription =>
  LocalPrescription.parse(
    omitBy(
      {
        ...localPrescriptionDbo,
        department:
          localPrescriptionDbo.department === 'None'
            ? undefined
            : localPrescriptionDbo.department,
        companySiret:
          localPrescriptionDbo.companySiret === 'None'
            ? undefined
            : localPrescriptionDbo.companySiret
      },
      isNil
    )
  );

export default {
  findUnique,
  findMany,
  insertMany,
  update,
  updateMany
};
