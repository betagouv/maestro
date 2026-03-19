import { Knex } from 'knex';
import { isArray, isNil, omit, omitBy } from 'lodash-es';
import { Region } from 'maestro-shared/referential/Region';
import { defaultPerPage } from 'maestro-shared/schema/commons/Pagination';
import { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import {
  PartialSample,
  SampleChecked
} from 'maestro-shared/schema/Sample/Sample';
import {
  DraftStatusList,
  SampleStatus
} from 'maestro-shared/schema/Sample/SampleStatus';
import { SpecificData } from 'maestro-shared/schema/SpecificData/SpecificData';
import z from 'zod';
import { analysisResiduesTable, analysisTable } from './analysisRepository';
import { companiesTable } from './companyRepository';
import { knexInstance as db, knexInstance } from './db';
import { kysely } from './kysely';
import { KyselyMaestro } from './kysely.type';
import { sampleItemsTable } from './sampleItemRepository';
import { usersTable } from './userRepository';

export const samplesTable = 'samples';
export const sampleDocumentsTable = 'sample_documents';
const sampleSpecificDataValuesTable = 'sample_specific_data_values';
const sampleSequenceNumbers = 'sample_sequence_numbers';

const PartialSampleDbo = z.object({
  ...PartialSample.omit({
    items: true,
    company: true,
    sampler: true,
    additionalSampler: true,
    geolocation: true,
    specificData: true
  }).shape,
  companySiret: z.string().nullish(),
  geolocation: z.any().nullish(),
  sampledBy: z.guid(),
  additionalSampledBy: z.guid().nullish(),
  sentAt: z.string().nullish()
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
    additionalSamplerName: z.string().nullish(),
    specificData: SpecificData
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
      `${companiesTable}.kinds as company_kinds`,
      `${usersTable}.id as sampler_id`,
      `${usersTable}.name as sampler_name`,
      db.raw(`additional_sampler.id as additional_sampler_id`),
      db.raw(`additional_sampler.name as additional_sampler_name`),
      db.raw(
        `coalesce(array_agg(${sampleDocumentsTable}.document_id) filter (where ${sampleDocumentsTable}.document_id is not null), '{}') as document_ids`
      ),
      db.raw(
        `coalesce(jsonb_object_agg(sdf_sd.key, case sdf_sd.input_type when 'checkbox' then to_jsonb(sdv_sd.value = 'true') when 'number' then to_jsonb(sdv_sd.value::numeric) else coalesce(to_jsonb(sdv_sd.value), to_jsonb(sdfo_sd.value)) end) filter (where sdv_sd.field_id is not null), '{}'::jsonb) as specific_data`
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
      `${usersTable} as additional_sampler`,
      `${samplesTable}.additional_sampled_by`,
      `additional_sampler.id`
    )
    .leftJoin(
      sampleDocumentsTable,
      `${samplesTable}.id`,
      `${sampleDocumentsTable}.sample_id`
    )
    .leftJoin(
      `${sampleSpecificDataValuesTable} as sdv_sd`,
      `${samplesTable}.id`,
      'sdv_sd.sample_id'
    )
    .leftJoin('specific_data_fields as sdf_sd', 'sdv_sd.field_id', 'sdf_sd.id')
    .leftJoin(
      'specific_data_field_options as sdfo_sd',
      'sdv_sd.option_id',
      'sdfo_sd.id'
    )
    .groupBy(
      `${samplesTable}.id`,
      `${companiesTable}.siret`,
      `${usersTable}.id`,
      `additional_sampler.id`
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
      if (findOptions.companySirets) {
        builder.whereIn(
          `${samplesTable}.companySiret`,
          findOptions.companySirets
        );
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
      db.raw(
        `coalesce(jsonb_object_agg(sdf_sd.key, case sdf_sd.input_type when 'checkbox' then to_jsonb(sdv_sd.value = 'true') when 'number' then to_jsonb(sdv_sd.value::numeric) else coalesce(to_jsonb(sdv_sd.value), to_jsonb(sdfo_sd.value)) end) filter (where sdv_sd.field_id is not null), '{}'::jsonb) as specific_data`
      )
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
    .leftJoin(
      `${sampleSpecificDataValuesTable} as sdv_sd`,
      `${samplesTable}.id`,
      'sdv_sd.sample_id'
    )
    .leftJoin('specific_data_fields as sdf_sd', 'sdv_sd.field_id', 'sdf_sd.id')
    .leftJoin(
      'specific_data_field_options as sdfo_sd',
      'sdv_sd.option_id',
      'sdfo_sd.id'
    )
    .groupBy(
      `${samplesTable}.id`,
      `${companiesTable}.siret`,
      `${usersTable}.id`,
      `additional_sampler.id`
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

const upsertSpecificDataValues = async (
  sampleId: string,
  specificData: SpecificData,
  trx: Knex.Transaction
): Promise<void> => {
  await trx(sampleSpecificDataValuesTable)
    .where({ sample_id: sampleId })
    .delete();

  const entries = Object.entries(specificData).filter(
    ([, v]) => v != null && v !== ''
  );
  if (entries.length === 0) return;

  const fields = await trx('specific_data_fields')
    .whereIn(
      'key',
      entries.map(([k]) => k)
    )
    .select('id', 'key');
  const fieldMap = new Map<string, string>(
    fields.map((f: { id: string; key: string }) => [f.key, f.id])
  );

  const valuePairs = entries.map(([key, value]) => [key, String(value)]);
  const options = await trx('specific_data_field_options')
    .whereIn(['field_key', 'value'], valuePairs)
    .select('id', 'field_key', 'value');
  const optionMap = new Map<string, string>(
    options.map((o: { id: string; field_key: string; value: string }) => [
      `${o.field_key}:${o.value}`,
      o.id
    ])
  );

  const rows = valuePairs
    .filter(([key]) => fieldMap.has(key))
    .map(([key, value]) => {
      const optionId = optionMap.get(`${key}:${value}`) ?? null;
      return {
        sample_id: sampleId,
        field_id: fieldMap.get(key),
        value: optionId ? null : value,
        option_id: optionId
      };
    });

  if (rows.length > 0) {
    await trx(sampleSpecificDataValuesTable).insert(rows);
  }
};

const insert = async (partialSample: PartialSample): Promise<void> => {
  console.info('Insert sample', partialSample.id);
  await db.transaction(async (trx) => {
    await trx(samplesTable).insert(formatPartialSample(partialSample));
    await upsertSpecificDataValues(
      partialSample.id,
      partialSample.specificData,
      trx
    );
  });
};

const update = async (partialSample: PartialSample): Promise<void> => {
  console.info('Update sample', partialSample.id);
  if (Object.keys(partialSample).length > 0) {
    await db.transaction(async (trx) => {
      await trx(samplesTable)
        .where({ id: partialSample.id })
        .update(formatPartialSample(partialSample));
      await upsertSpecificDataValues(
        partialSample.id,
        partialSample.specificData,
        trx
      );
    });
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
    'specificData'
  ]),
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
  updateStatus,
  updateDocumentIds,
  findUnique,
  findMany,
  count,
  getNextSequence,
  deleteOne,
  deleteDraftOnProgrammingPlan
};
