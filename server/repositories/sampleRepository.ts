import { isArray, isNil, omit, omitBy } from 'lodash-es';
import { Region } from 'maestro-shared/referential/Region';
import { defaultPerPage } from 'maestro-shared/schema/commons/Pagination';
import { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import { PartialSample, Sample } from 'maestro-shared/schema/Sample/Sample';
import { SampleStatus } from 'maestro-shared/schema/Sample/SampleStatus';
import z from 'zod';
import { analysisResiduesTable, analysisTable } from './analysisRepository';
import { companiesTable } from './companyRepository';
import { knexInstance as db, knexInstance } from './db';
import { kysely } from './kysely';
import { KyselyMaestro } from './kysely.type';
import { usersTable } from './userRepository';

export const samplesTable = 'samples';
export const sampleDocumentsTable = 'sample_documents';
const sampleSequenceNumbers = 'sample_sequence_numbers';

const PartialSampleDbo = PartialSample.omit({
  items: true,
  company: true,
  sampler: true,
  geolocation: true
}).merge(
  z.object({
    companySiret: z.string().nullish(),
    geolocation: z.any().nullish(),
    sampledBy: z.guid()
  })
);

const PartialSampleJoinedDbo = PartialSampleDbo.merge(
  z.object({
    companySiret: z.string(),
    companyName: z.string(),
    companyTradeName: z.string().nullish(),
    companyAddress: z.string().nullish(),
    companyPostalCode: z.string().nullish(),
    companyCity: z.string().nullish(),
    companyNafCode: z.string().nullish(),
    samplerId: z.guid(),
    samplerFirstName: z.string(),
    samplerLastName: z.string()
  })
);

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
      `${usersTable}.id as sampler_id`,
      `${usersTable}.first_name as sampler_first_name`,
      `${usersTable}.last_name as sampler_last_name`,
      db.raw(
        `coalesce(array_agg(${sampleDocumentsTable}.document_id) filter (where ${sampleDocumentsTable}.document_id is not null), '{}') as document_ids`
      )
    )
    .where(`${samplesTable}.id`, id)
    .leftJoin(
      companiesTable,
      `${samplesTable}.companySiret`,
      `${companiesTable}.siret`
    )
    .join(usersTable, `${samplesTable}.sampled_by`, `${usersTable}.id`)
    .leftJoin(
      sampleDocumentsTable,
      `${samplesTable}.id`,
      `${sampleDocumentsTable}.sample_id`
    )
    .groupBy(
      `${samplesTable}.id`,
      `${companiesTable}.siret`,
      `${usersTable}.id`
    )
    .first()
    .then(parsePartialSample);
};

const findRequest = (findOptions: FindSampleOptions) =>
  Samples()
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
          'compliance',
          'withAtLeastOneResidue'
        ),
        (_) => isNil(_) || isArray(_)
      )
    )
    .modify((builder) => {
      if (findOptions.region) {
        builder.where(`${samplesTable}.region`, findOptions.region);
      }
      if (findOptions.status) {
        if (isArray(findOptions.status)) {
          builder.whereIn(`${samplesTable}.status`, findOptions.status);
        } else {
          builder.where(`${samplesTable}.status`, findOptions.status);
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
      if (!isNil(findOptions.compliance)) {
        builder.leftJoin(
          analysisTable,
          `${analysisTable}.sampleId`,
          `${samplesTable}.id`
        );
        builder.where(
          `${analysisTable}.compliance`,
          findOptions.compliance === 'conform'
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
      `${usersTable}.first_name as sampler_first_name`,
      `${usersTable}.last_name as sampler_last_name`,
      db.raw(
        `coalesce(array_agg(${sampleDocumentsTable}.document_id) filter (where ${sampleDocumentsTable}.document_id is not null), '{}') as document_ids`
      )
    )
    .leftJoin(
      companiesTable,
      `${samplesTable}.companySiret`,
      `${companiesTable}.siret`
    )
    .join(usersTable, `${samplesTable}.sampled_by`, `${usersTable}.id`)
    .leftJoin(
      sampleDocumentsTable,
      `${samplesTable}.id`,
      `${sampleDocumentsTable}.sample_id`
    )
    .groupBy(
      `${samplesTable}.id`,
      `${companiesTable}.siret`,
      `${usersTable}.id`
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

const update = async (partialSample: PartialSample): Promise<void> => {
  console.info('Update sample', partialSample.id);
  if (Object.keys(partialSample).length > 0) {
    await Samples()
      .where({ id: partialSample.id })
      .update(formatPartialSample(partialSample));
  }
};

const updateStatus = async (
  sampleId: string,
  status: SampleStatus,
  trx: KyselyMaestro = kysely
) => {
  await trx
    .updateTable('samples')
    .where('id', '=', sampleId)
    .set('status', status)
    .execute();
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

export const formatPartialSample = (
  partialSample: PartialSample | Sample
): PartialSampleDbo => ({
  ...omit(partialSample, ['items', 'company', 'sampler', 'documentIds']),
  geolocation: partialSample.geolocation
    ? db.raw('Point(?, ?)', [
        partialSample.geolocation.x,
        partialSample.geolocation.y
      ])
    : null,
  companySiret: partialSample.company?.siret,
  sampledBy: partialSample.sampler.id
});

const parsePartialSample = (sample: PartialSampleJoinedDbo): PartialSample =>
  sample &&
  PartialSample.parse({
    ...omit(omitBy(sample, isNil), ['companyId']),
    geolocation: sample.geolocation && {
      x: sample.geolocation.x,
      y: sample.geolocation.y
    },
    company: sample.companySiret
      ? {
          siret: sample.companySiret,
          name: sample.companyName,
          tradeName: sample.companyTradeName ?? undefined,
          address: sample.companyAddress ?? undefined,
          postalCode: sample.companyPostalCode ?? undefined,
          city: sample.companyCity ?? undefined,
          nafCode: sample.companyNafCode ?? undefined
        }
      : undefined,
    sampler: {
      id: sample.samplerId,
      firstName: sample.samplerFirstName,
      lastName: sample.samplerLastName
    },
    specificData: omitBy(sample.specificData, isNil)
  });

export const sampleRepository = {
  insert,
  update,
  updateStatus,
  updateDocumentIds,
  findUnique,
  findMany,
  count,
  getNextSequence,
  deleteOne
};
