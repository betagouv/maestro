import { isArray, isNil, omit, omitBy } from 'lodash-es';
import { Region } from 'maestro-shared/referential/Region';
import { defaultPerPage } from 'maestro-shared/schema/commons/Pagination';
import { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import {
  PartialSample,
  SampleBase,
  SampleChecked
} from 'maestro-shared/schema/Sample/Sample';
import { DraftStatusList } from 'maestro-shared/schema/Sample/SampleStatus';
import z from 'zod';
import { analysisResiduesTable, analysisTable } from './analysisRepository';
import { companiesTable } from './companyRepository';
import { knexInstance as db, knexInstance } from './db';
import { kysely } from './kysely';
import { KyselyMaestro } from './kysely.type';
import { sampleItemsTable } from './sampleItemRepository';
import { usersTable } from './userRepository';

export const samplesTable = 'samples';
export const sampleStatusView = 'sample_status';
export const sampleDocumentsTable = 'sample_documents';
const sampleSequenceNumbers = 'sample_sequence_numbers';

const SampleStatusDbo = z.enum([
  'Draft',
  'DraftMatrix',
  'DraftItems',
  'Submitted',
  'Sent'
]);

const PartialSampleDbo = z.object({
  ...PartialSample.omit({
    items: true,
    company: true,
    sampler: true,
    additionalSampler: true,
    geolocation: true
  }).shape,
  companySiret: z.string().nullish(),
  geolocation: z.any().nullish(),
  sampledBy: z.guid(),
  additionalSampledBy: z.guid().nullish(),
  sentAt: z.string().nullish(),
  status: SampleStatusDbo
});

const PartialSampleJoinedDbo = PartialSampleDbo.merge(
  z.object({
    companySiret: z.string(),
    companyName: z.string(),
    companyTradeName: z.string().nullish(),
    companyAddress: z.string().nullish(),
    companyPostalCode: z.string().nullish(),
    companyCity: z.string().nullish(),
    companyNafCode: z.string().nullish(),
    companyKinds: z.array(z.string()).nullish(),
    samplerId: z.guid(),
    samplerName: z.string(),
    additionalSamplerId: z.guid().nullish(),
    additionalSamplerName: z.string().nullish()
  })
);

type SampleStatusDbo = z.infer<typeof SampleStatusDbo>;
type PartialSampleDbo = z.infer<typeof PartialSampleDbo>;
type PartialSampleJoinedDbo = z.infer<typeof PartialSampleJoinedDbo>;

export const Samples = () => db<PartialSampleDbo>(samplesTable);

const findUnique = async (id: string): Promise<PartialSample | undefined> => {
  console.info('Find sample', id);
  return Samples()
    .select(
      `${samplesTable}.*`,
      `${companiesTable}.siret as company_siret`,
      `${companiesTable}.name as company_name`,
      `${companiesTable}.trade_name as company_trade_name`,
      `${companiesTable}.address as company_address`,
      `${companiesTable}.postal_code as company_postal_code`,
      `${companiesTable}.city as company_city`,
      `${companiesTable}.naf_code as company_naf_code`,
      `${companiesTable}.kinds as company_kinds`,
      `${usersTable}.id as sampler_id`,
      `${usersTable}.name as sampler_name`,
      db.raw(`additional_sampler.id as additional_sampler_id`),
      db.raw(`additional_sampler.name as additional_sampler_name`),
      db.raw(
        `coalesce(array_agg(${sampleDocumentsTable}.document_id) filter (where ${sampleDocumentsTable}.document_id is not null), '{}') as document_ids`
      ),
      db.raw(`${sampleStatusView}.status`)
    )
    .where(`${samplesTable}.id`, id)
    .leftJoin(
      companiesTable,
      `${samplesTable}.companySiret`,
      `${companiesTable}.siret`
    )
    .join(usersTable, `${samplesTable}.sampled_by`, `${usersTable}.id`)
    .leftJoin(
      `${usersTable} as additional_sampler`,
      `${samplesTable}.additional_sampled_by`,
      `additional_sampler.id`
    )
    .leftJoin(
      sampleDocumentsTable,
      `${samplesTable}.id`,
      `${sampleDocumentsTable}.sample_id`
    )
    .join(
      sampleStatusView,
      `${sampleStatusView}.sample_id`,
      `${samplesTable}.id`
    )
    .groupBy(
      `${samplesTable}.id`,
      `${companiesTable}.siret`,
      `${usersTable}.id`,
      `additional_sampler.id`,
      `${sampleStatusView}.status`
    )
    .first()
    .then(parsePartialSample);
};

const findRequest = (findOptions: FindSampleOptions) =>
  Samples()
    .join(
      sampleStatusView,
      `${sampleStatusView}.sample_id`,
      `${samplesTable}.id`
    )
    .where(
      omitBy(
        omit(
          findOptions,
          'region',
          'sampledAt',
          'page',
          'perPage',
          'status',
          'reference',
          'contexts',
          'departments',
          'withAtLeastOneResidue',
          'programmingPlanIds',
          'kinds',
          'laboratoryId'
        ),
        (_) => isNil(_) || isArray(_)
      )
    )
    .modify((builder) => {
      if (findOptions.programmingPlanIds) {
        builder.whereIn(
          `${samplesTable}.programmingPlanId`,
          findOptions.programmingPlanIds
        );
      }
      if (findOptions.kinds) {
        builder.whereIn(
          `${samplesTable}.programmingPlanKind`,
          findOptions.kinds
        );
      }
      if (findOptions.region) {
        builder.where(`${samplesTable}.region`, findOptions.region);
      }
      if (findOptions.status) {
        if (isArray(findOptions.status)) {
          builder.whereIn(`${sampleStatusView}.status`, findOptions.status);
        } else {
          builder.where(`${sampleStatusView}.status`, findOptions.status);
        }
      }
      if (findOptions.sampledAt) {
        builder.whereRaw(
          `to_char(${samplesTable}.sampled_at, 'YYYY-MM-DD') = ?`,
          findOptions.sampledAt
        );
      }
      if (findOptions.reference) {
        builder.whereILike(
          `${samplesTable}.reference`,
          `%${findOptions.reference}%`
        );
      }
      if (findOptions.contexts) {
        builder.whereIn(`${samplesTable}.context`, findOptions.contexts);
      }
      if (findOptions.departments) {
        builder.whereIn(`${samplesTable}.department`, findOptions.departments);
      }
      if (findOptions.companySirets) {
        builder.whereIn(
          `${samplesTable}.companySiret`,
          findOptions.companySirets
        );
      }
      if (findOptions.withAtLeastOneResidue === true) {
        builder.whereExists((c) =>
          c
            .select(knexInstance.raw(1))
            .from(analysisTable)
            .join(
              analysisResiduesTable,
              `${analysisResiduesTable}.analysisId`,
              `${analysisTable}.id`
            )
            .where(
              `${analysisTable}.sampleId`,
              knexInstance.raw(`${samplesTable}.id`)
            )
            .whereNot(`${analysisResiduesTable}.resultKind`, 'ND')
            .limit(1)
        );
      }
      if (findOptions.laboratoryId) {
        builder.whereExists((c) =>
          c
            .select(knexInstance.raw(1))
            .from(sampleItemsTable)
            .where(
              `${sampleItemsTable}.sampleId`,
              knexInstance.raw(`${samplesTable}.id`)
            )
            .where(`${sampleItemsTable}.laboratoryId`, findOptions.laboratoryId)
            .limit(1)
        );
      }
    });

const findMany = async (
  findOptions: FindSampleOptions
): Promise<PartialSample[]> => {
  console.info('Find samples', omitBy(findOptions, isNil));
  return findRequest(findOptions)
    .select(
      `${samplesTable}.*`,
      `${companiesTable}.siret as company_siret`,
      `${companiesTable}.name as company_name`,
      `${companiesTable}.trade_name as company_trade_name`,
      `${companiesTable}.address as company_address`,
      `${companiesTable}.postal_code as company_postal_code`,
      `${companiesTable}.city as company_city`,
      `${companiesTable}.naf_code as company_naf_code`,
      `${usersTable}.id as sampler_id`,
      `${usersTable}.name as sampler_name`,
      db.raw(`additional_sampler.id as additional_sampler_id`),
      db.raw(`additional_sampler.name as additional_sampler_name`),
      db.raw(
        `coalesce(array_agg(${sampleDocumentsTable}.document_id) filter (where ${sampleDocumentsTable}.document_id is not null), '{}') as document_ids`
      ),
      db.raw(`${sampleStatusView}.status`)
    )
    .leftJoin(
      companiesTable,
      `${samplesTable}.companySiret`,
      `${companiesTable}.siret`
    )
    .join(usersTable, `${samplesTable}.sampled_by`, `${usersTable}.id`)
    .leftJoin(
      `${usersTable} as additional_sampler`,
      `${samplesTable}.additional_sampled_by`,
      `additional_sampler.id`
    )
    .leftJoin(
      sampleDocumentsTable,
      `${samplesTable}.id`,
      `${sampleDocumentsTable}.sample_id`
    )
    .groupBy(
      `${samplesTable}.id`,
      `${companiesTable}.siret`,
      `${usersTable}.id`,
      `additional_sampler.id`,
      `${sampleStatusView}.status`
    )
    .modify((builder) => {
      if (findOptions.page) {
        builder
          .limit(findOptions.perPage ?? defaultPerPage)
          .offset(
            (findOptions.page - 1) * (findOptions.perPage ?? defaultPerPage)
          );
      }
    })
    .orderBy('sampled_at', 'desc')
    .orderBy('created_at', 'desc')
    .orderBy(`${samplesTable}.id`)
    .then((samples) => samples.map(parsePartialSample));
};

const count = async (findOptions: FindSampleOptions): Promise<number> => {
  console.info('Count samples', omitBy(findOptions, isNil));
  return findRequest(findOptions)
    .count()
    .then(([{ count }]) => Number(count));
};

const getNextSequence = async (
  region: Region,
  programmingPlanYear: number
): Promise<number> => {
  console.info('Get next sequence', region, programmingPlanYear);
  const result = await db(sampleSequenceNumbers)
    .where({ region, programmingPlanYear })
    .select('next_sequence')
    .first();

  if (!result) {
    await db(sampleSequenceNumbers).insert({
      region,
      programmingPlanYear,
      next_sequence: 2
    });
    return 1;
  }

  await db(sampleSequenceNumbers)
    .where({ region, programmingPlanYear })
    .increment('next_sequence', 1);

  return result.nextSequence;
};

const insert = async (partialSample: PartialSample): Promise<void> => {
  console.info('Insert sample', partialSample.id);
  await Samples().insert(formatPartialSample(partialSample));
};

const update = async (
  partialSample: PartialSample | SampleBase
): Promise<void> => {
  console.info('Update sample', partialSample.id);
  if (Object.keys(partialSample).length > 0) {
    await Samples()
      .where({ id: partialSample.id })
      .update(formatPartialSample(partialSample));
  }
};

const updateDocumentIds = async (
  sampleId: string,
  documentIds: string[],
  trx: KyselyMaestro = kysely
) => {
  await trx
    .deleteFrom('sampleDocuments')
    .where('sampleId', '=', sampleId)
    .execute();
  if (documentIds.length > 0) {
    await trx
      .insertInto('sampleDocuments')
      .values(documentIds.map((documentId) => ({ sampleId, documentId })))
      .execute();
  }
};

const deleteOne = async (id: string): Promise<void> => {
  console.info('Delete sample', id);
  await Samples().where({ id }).delete();
};

const deleteDraftOnProgrammingPlan = async (
  programmingPlanId: string
): Promise<void> => {
  console.info('Delete draft samples on programmingPlan', programmingPlanId);
  await kysely
    .deleteFrom('samples')
    .where('programmingPlanId', '=', programmingPlanId)
    .where('status', 'in', DraftStatusList)
    .execute();
};

export const formatPartialSample = (
  partialSample: PartialSample | SampleChecked
): PartialSampleDbo => ({
  ...omit(partialSample, [
    'items',
    'company',
    'sampler',
    'additionalSampler',
    'documentIds',
    'status'
  ]),
  status: SampleStatusDbo.safeParse(partialSample.status)
    ? (partialSample.status as SampleStatusDbo)
    : 'Sent',
  geolocation: partialSample.geolocation
    ? db.raw('Point(?, ?)', [
        partialSample.geolocation.x,
        partialSample.geolocation.y
      ])
    : null,
  companySiret: partialSample.company?.siret,
  sampledBy: partialSample.sampler.id,
  additionalSampledBy: partialSample.additionalSampler?.id,
  sentAt: partialSample.sentAt?.toISOString()
});

const parsePartialSample = (sample: PartialSampleJoinedDbo): PartialSample =>
  sample &&
  PartialSample.parse({
    ...omit(omitBy(sample, isNil), ['companySiret']),
    geolocation: sample.geolocation && {
      x: sample.geolocation.x,
      y: sample.geolocation.y
    },
    company: sample.companySiret
      ? {
          siret: sample.companySiret,
          name: sample.companyName,
          tradeName: sample.companyTradeName ?? null,
          address: sample.companyAddress ?? null,
          postalCode: sample.companyPostalCode ?? null,
          city: sample.companyCity ?? null,
          nafCode: sample.companyNafCode ?? null,
          kinds: sample.companyKinds ?? null,
          geolocation: null,
          kind: null
        }
      : undefined,
    sampler: {
      id: sample.samplerId,
      name: sample.samplerName
    },
    additionalSampler: sample.additionalSamplerId
      ? {
          id: sample.additionalSamplerId,
          name: sample.additionalSamplerName!
        }
      : undefined,
    specificData: omitBy(sample.specificData, isNil)
  });

export const sampleRepository = {
  insert,
  update,
  updateDocumentIds,
  findUnique,
  findMany,
  count,
  getNextSequence,
  deleteOne,
  deleteDraftOnProgrammingPlan
};
