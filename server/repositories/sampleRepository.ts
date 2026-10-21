import type { Knex } from 'knex';
import { groupBy, isArray, isNil, omit, omitBy } from 'lodash-es';
import type { Region } from 'maestro-shared/referential/Region';
import { residueResultExceedsLmr } from 'maestro-shared/schema/Analysis/Residue/Residue';
import { defaultPerPage } from 'maestro-shared/schema/commons/Pagination';
import { OtherMatrixKind } from 'maestro-shared/schema/Matrix/MatrixReferential';
import { PPVSubPlanNumberPrefix } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import {
  ComplianceStat,
  type FindComplianceStatsOptions
} from 'maestro-shared/schema/Sample/ComplianceStat';
import type {
  DashboardStats,
  DashboardTerritoryLevel,
  FindDashboardStatsOptions,
  SampleStatusCounts
} from 'maestro-shared/schema/Sample/DashboardStats';
import type { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import {
  PartialSample,
  type SampleBase,
  SampleChecked
} from 'maestro-shared/schema/Sample/Sample';
import {
  getItemStatus,
  isItemAchieved,
  isItemCompliant
} from 'maestro-shared/schema/Sample/SampleItem';
import { SampleStatus } from 'maestro-shared/schema/Sample/SampleStatus';
import type { SevesNotice } from 'maestro-shared/schema/Sample/Seves';
import { SpecificData } from 'maestro-shared/schema/SpecificData/SpecificData';
import z from 'zod';
import { analysisResiduesTable, analysisTable } from './analysisRepository';
import { companiesTable } from './companyRepository';
import { knexInstance as db, knexInstance } from './db';
import { kysely } from './kysely';
import type { KyselyMaestro, Samples as SamplesRow } from './kysely.type';
import { programmingSubPlansTable } from './programmingSubPlanRepository';
import sampleItemRepository, { sampleItemsTable } from './sampleItemRepository';
import { usersTable } from './userRepository';

export const samplesTable = 'samples';
export const sampleStatusView = 'sample_status';
export const sampleDocumentsTable = 'sample_documents';
const analysisDaiTable = 'analysis_dai';
const sampleSpecificDataValuesTable = 'sample_specific_data_values';
const sampleSequenceNumbers = 'sample_sequence_numbers';

const PartialSampleDbo = z.object({
  ...PartialSample.omit({
    items: true,
    company: true,
    sampler: true,
    additionalSampler: true,
    geolocation: true,
    specificData: true,
    status: true
  }).shape,
  companySiret: z.string().nullish(),
  geolocation: z.any().nullish(),
  sampledBy: z.guid(),
  additionalSampledBy: z.guid().nullish(),
  sentAt: z.string().nullish(),
  matrices: z.any().nullish()
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
        `coalesce(array_agg(distinct ${sampleDocumentsTable}.document_id) filter (where ${sampleDocumentsTable}.document_id is not null), '{}') as document_ids`
      ),
      db.raw(
        `coalesce(jsonb_object_agg(sdf_sd.key, case sdf_sd.input_type when 'checkbox' then to_jsonb(sdv_sd.value = 'true') when 'number' then to_jsonb(sdv_sd.value::numeric) else coalesce(to_jsonb(sdv_sd.value), to_jsonb(sdfo_sd.value)) end) filter (where sdv_sd.field_id is not null), '{}'::jsonb) as specific_data`
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
          'regions',
          'matrixKinds',
          'matrices',
          'sampledBy',
          'sampledDate',
          'sentDate',
          'page',
          'perPage',
          'status',
          'reference',
          'contexts',
          'departments',
          'withAtLeastOneResidue',
          'withAtLeastOneCopiedItem',
          'programmingPlanIds',
          'kinds',
          'laboratoryIds'
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
      if (findOptions.programmingSubPlanIds) {
        builder.whereIn(
          `${samplesTable}.programmingSubPlanId`,
          findOptions.programmingSubPlanIds
        );
      }
      if (findOptions.regions?.length) {
        builder.whereIn(`${samplesTable}.region`, findOptions.regions);
      }
      if (findOptions.matrixKinds?.length) {
        builder.whereRaw(
          `exists (select 1 from jsonb_array_elements(${samplesTable}.matrices) m where m->>'matrixKind' = any(?))`,
          [findOptions.matrixKinds]
        );
      }
      if (findOptions.matrices?.length) {
        builder.whereRaw(
          `exists (select 1 from jsonb_array_elements(${samplesTable}.matrices) m where m->>'matrix' = any(?))`,
          [findOptions.matrices]
        );
      }
      if (findOptions.sampledBy?.length) {
        builder.whereIn(`${samplesTable}.sampledBy`, findOptions.sampledBy);
      }
      if (findOptions.statuses?.length) {
        builder.whereIn(`${sampleStatusView}.status`, findOptions.statuses);
      }
      if (findOptions.sampledDate) {
        builder.where(`${samplesTable}.sampled_date`, findOptions.sampledDate);
      }
      if (findOptions.sentDate) {
        builder.whereRaw(
          `(${samplesTable}.sent_at AT TIME ZONE 'Europe/Paris')::date = ?`,
          [findOptions.sentDate]
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
      if (findOptions.companySirets?.length) {
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
      if (findOptions.withAtLeastOneCopiedItem === true) {
        builder.whereExists((c) =>
          c
            .select(knexInstance.raw(1))
            .from(sampleItemsTable)
            .where(
              `${sampleItemsTable}.sampleId`,
              knexInstance.raw(`${samplesTable}.id`)
            )
            .where(`${sampleItemsTable}.copyNumber`, '>', 1)
            .limit(1)
        );
      }
      if (findOptions.laboratoryIds?.length) {
        builder.whereExists((c) =>
          c
            .select(knexInstance.raw(1))
            .from(sampleItemsTable)
            .where(
              `${sampleItemsTable}.sampleId`,
              knexInstance.raw(`${samplesTable}.id`)
            )
            .whereIn(
              `${sampleItemsTable}.laboratoryId`,
              findOptions.laboratoryIds!
            )
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
        `coalesce(array_agg(distinct ${sampleDocumentsTable}.document_id) filter (where ${sampleDocumentsTable}.document_id is not null), '{}') as document_ids`
      ),
      db.raw(
        `coalesce(jsonb_object_agg(sdf_sd.key, case sdf_sd.input_type when 'checkbox' then to_jsonb(sdv_sd.value = 'true') when 'number' then to_jsonb(sdv_sd.value::numeric) else coalesce(to_jsonb(sdv_sd.value), to_jsonb(sdfo_sd.value)) end) filter (where sdv_sd.field_id is not null), '{}'::jsonb) as specific_data`
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
    .orderBy('sampled_date', 'desc')
    .orderBy('sampled_time', 'desc')
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

const update = async (
  partialSample: PartialSample | SampleBase
): Promise<void> => {
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

const updateSeves = async (
  reference: string,
  seves: SamplesRow['seves']
): Promise<number> => {
  console.info('Update sample SEVES reference', reference);
  const result = await kysely
    .updateTable('samples')
    .set({ seves })
    .where('reference', '=', reference)
    .executeTakeFirst();
  return Number(result.numUpdatedRows);
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

// Sample rattaché à un document, il faudrait peut-être créer une autre table sample_documents pour gérer tous les documents liés à un sample
// (sample_documents, sample_items, analysis_(report|dai|rai)_documents).
const findSampleIdsByDocumentId = async (
  documentId: string,
  trx: KyselyMaestro = kysely
): Promise<string[]> => {
  const [sampleDocs, supportDocs, reportDocs, daiDocs, raiDocs] =
    await Promise.all([
      trx
        .selectFrom('sampleDocuments')
        .select('sampleId')
        .where('documentId', '=', documentId)
        .execute(),
      trx
        .selectFrom('sampleItems')
        .select('sampleId')
        .where('supportDocumentId', '=', documentId)
        .execute(),
      trx
        .selectFrom('analysisReportDocuments')
        .innerJoin(
          'analysis',
          'analysis.id',
          'analysisReportDocuments.analysisId'
        )
        .select('analysis.sampleId as sampleId')
        .where('analysisReportDocuments.documentId', '=', documentId)
        .execute(),
      trx
        .selectFrom('analysisDaiDocuments')
        .innerJoin(
          'analysisDai',
          'analysisDai.id',
          'analysisDaiDocuments.analysisDaiId'
        )
        .innerJoin('analysis', 'analysis.id', 'analysisDai.analysisId')
        .select('analysis.sampleId as sampleId')
        .where('analysisDaiDocuments.documentId', '=', documentId)
        .execute(),
      trx
        .selectFrom('analysisRaiDocuments')
        .innerJoin(
          'analysisRai',
          'analysisRai.id',
          'analysisRaiDocuments.analysisRaiId'
        )
        .innerJoin('analysis', 'analysis.id', 'analysisRai.analysisId')
        .select('analysis.sampleId as sampleId')
        .where('analysisRaiDocuments.documentId', '=', documentId)
        .execute()
    ]);

  return [...sampleDocs, ...supportDocs, ...reportDocs, ...daiDocs, ...raiDocs]
    .map((row) => row.sampleId)
    .filter((sampleId): sampleId is string => !isNil(sampleId));
};

const documentBelongsToSample = async (
  documentId: string,
  sampleId: string,
  trx: KyselyMaestro = kysely
): Promise<boolean> => {
  const sampleIds = await findSampleIdsByDocumentId(documentId, trx);
  return sampleIds.includes(sampleId);
};

const linkDocument = async (
  sampleId: string,
  documentId: string,
  trx: KyselyMaestro = kysely
) => {
  await trx
    .insertInto('sampleDocuments')
    .values({ sampleId, documentId })
    .execute();
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
    .where('id', 'in', (qb) =>
      qb
        .selectFrom('sampleStatus')
        .select('sampleId')
        .where('status', '=', 'Draft')
    )
    .execute();
};

const hasDetectedResidue = async (sampleId: string): Promise<boolean> => {
  const detectedResidue = await db(analysisTable)
    .join(
      analysisResiduesTable,
      `${analysisResiduesTable}.analysisId`,
      `${analysisTable}.id`
    )
    .where(`${analysisTable}.sampleId`, sampleId)
    .whereNot(`${analysisResiduesTable}.resultKind`, 'ND')
    .limit(1)
    .first();

  return !!detectedResidue;
};

const getSevesNotice = async (
  sampleId: string
): Promise<SevesNotice | null> => {
  const detectedResidues = await db(analysisTable)
    .join(
      analysisResiduesTable,
      `${analysisResiduesTable}.analysisId`,
      `${analysisTable}.id`
    )
    .join(samplesTable, `${samplesTable}.id`, `${analysisTable}.sampleId`)
    .where(`${analysisTable}.sampleId`, sampleId)
    .whereNull(`${samplesTable}.seves`)
    .whereNotNull(`${analysisTable}.compliance`)
    .whereNot(`${analysisResiduesTable}.resultKind`, 'ND')
    .select(`${analysisResiduesTable}.result`, `${analysisResiduesTable}.lmr`);

  if (detectedResidues.length === 0) {
    return null;
  }

  const hasResidueExceedingLmr = detectedResidues.some(({ result, lmr }) =>
    residueResultExceedsLmr(result, lmr)
  );

  return hasResidueExceedingLmr ? 'lmrExceeded' : 'recommended';
};

const evaluateSampleCompliance = async (sampleId: string) => {
  console.info('Evaluate sample compliance', sampleId);

  const sample = await findUnique(sampleId);
  const sampleItems = await sampleItemRepository.findMany(sampleId);

  const sampleCheckedParse = SampleChecked.safeParse({
    ...sample,
    items: sampleItems
  });

  if (!sampleCheckedParse.success) {
    return;
  }

  const sampleChecked = sampleCheckedParse.data;

  if (
    !(await hasDetectedResidue(sampleId)) &&
    sampleChecked.items
      .filter((_) => _.copyNumber === 1)
      .every((itemFirstCopy) => {
        const itemCopies =
          sampleChecked.items.filter(
            (_) => _.itemNumber === itemFirstCopy.itemNumber
          ) || [];

        return (
          (isItemAchieved(itemCopies) && isItemCompliant(itemCopies)) ||
          getItemStatus(itemCopies) === 'NotAdmissible'
        );
      })
  ) {
    await update({
      ...sampleChecked,
      compliance: 'Compliant'
    });
  }
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
    'specificData',
    'status',
    'seves',
    'sevesNotice'
  ]),
  matrices: partialSample.matrices && JSON.stringify(partialSample.matrices),
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

const dashboardTerritoryColumns: Record<DashboardTerritoryLevel, string> = {
  Region: `${samplesTable}.region`,
  Department: `${samplesTable}.department`,
  Company: `${samplesTable}.companySiret`
};

const emptyStatusCounts = (): SampleStatusCounts =>
  Object.fromEntries(
    SampleStatus.options.map((status) => [status, 0])
  ) as SampleStatusCounts;

const toStatusCounts = (
  rows: { status: SampleStatus; count: string }[]
): SampleStatusCounts =>
  rows.reduce((counts, row) => {
    counts[row.status] = Number(row.count);
    return counts;
  }, emptyStatusCounts());

type DashboardSampleStats = Pick<
  DashboardStats,
  | 'countsByStatus'
  | 'compliantCount'
  | 'nonCompliantCount'
  | 'receivedItemCount'
  | 'notAdmissibleItemCount'
  | 'sentByMonth'
> & {
  averageSampledToDaiHours: number | null;
  byTerritory: { key: string; countsByStatus: SampleStatusCounts }[];
};

const firstDaiSentAt = () =>
  db(analysisTable)
    .join(
      analysisDaiTable,
      `${analysisDaiTable}.analysisId`,
      `${analysisTable}.id`
    )
    .whereNotNull(`${analysisDaiTable}.sentAt`)
    .groupBy(`${analysisTable}.sampleId`)
    .select(
      `${analysisTable}.sampleId as sample_id`,
      db.raw(`min(${analysisDaiTable}.sent_at) as sent_at`)
    );

const findDashboardStats = async (
  findOptions: FindDashboardStatsOptions
): Promise<DashboardSampleStats> => {
  const { territoryLevel, ...sampleOptions } = findOptions;
  console.info('Compute dashboard stats', omitBy(sampleOptions, isNil));

  const statusRows = await findRequest(sampleOptions)
    .select(`${sampleStatusView}.status`, db.raw('count(*) as count'))
    .groupBy(`${sampleStatusView}.status`);

  const complianceRows = await findRequest(sampleOptions)
    .select(`${samplesTable}.compliance`, db.raw('count(*) as count'))
    .whereNotNull(`${samplesTable}.compliance`)
    .groupBy(`${samplesTable}.compliance`);

  const [itemRow] = await findRequest(sampleOptions)
    .join(
      sampleItemsTable,
      `${sampleItemsTable}.sampleId`,
      `${samplesTable}.id`
    )
    .leftJoin(analysisTable, (join) =>
      join
        .on(`${analysisTable}.sampleId`, `${sampleItemsTable}.sampleId`)
        .andOn(`${analysisTable}.itemNumber`, `${sampleItemsTable}.itemNumber`)
        .andOn(`${analysisTable}.copyNumber`, `${sampleItemsTable}.copyNumber`)
    )
    .whereNotNull(`${sampleItemsTable}.receiptDate`)
    .select(
      db.raw('count(*) as received_count'),
      db.raw(
        `count(*) filter (where ${analysisTable}.status = 'NotAdmissible') as not_admissible_count`
      )
    );

  const monthRows = await findRequest(sampleOptions)
    .whereNotNull(`${samplesTable}.sentAt`)
    .select(
      db.raw(
        `extract(month from ${samplesTable}.sent_at at time zone 'Europe/Paris') as month`
      ),
      db.raw('count(*) as count')
    )
    .groupByRaw(
      `extract(month from ${samplesTable}.sent_at at time zone 'Europe/Paris')`
    );

  const [daiRow] = await findRequest(sampleOptions)
    .join(
      firstDaiSentAt().as('first_dai'),
      'first_dai.sample_id',
      `${samplesTable}.id`
    )
    .select(
      db.raw(
        `avg(extract(epoch from (first_dai.sent_at - (${samplesTable}.sampled_date::timestamp + ${samplesTable}.sampled_time::time))) / 3600) as average_hours`
      )
    );

  const territoryRows = territoryLevel
    ? await findRequest(sampleOptions)
        .select(
          db.raw(`${dashboardTerritoryColumns[territoryLevel]} as key`),
          `${sampleStatusView}.status`,
          db.raw('count(*) as count')
        )
        .whereNotNull(dashboardTerritoryColumns[territoryLevel])
        .whereNotExists((builder) =>
          builder
            .select(db.raw('1'))
            .from(programmingSubPlansTable)
            .whereRaw(
              `${programmingSubPlansTable}.id = ${samplesTable}.programming_sub_plan_id`
            )
            .whereLike(
              `${programmingSubPlansTable}.subPlanNumber`,
              `${PPVSubPlanNumberPrefix}%`
            )
        )
        .groupBy(
          dashboardTerritoryColumns[territoryLevel],
          `${sampleStatusView}.status`
        )
    : [];

  return {
    countsByStatus: toStatusCounts(statusRows),
    compliantCount: Number(
      complianceRows.find((row: any) => row.compliance === 'Compliant')
        ?.count ?? 0
    ),
    nonCompliantCount: complianceRows
      .filter((row: any) =>
        ['NonCompliant', 'NonCompliantAndHarmful'].includes(row.compliance)
      )
      .reduce((total: number, row: any) => total + Number(row.count), 0),
    receivedItemCount: Number(itemRow?.receivedCount ?? 0),
    notAdmissibleItemCount: Number(itemRow?.notAdmissibleCount ?? 0),
    sentByMonth: monthRows.map((row: any) => ({
      month: Number(row.month),
      count: Number(row.count)
    })),
    averageSampledToDaiHours: isNil(daiRow?.averageHours)
      ? null
      : Number(daiRow.averageHours),
    byTerritory: Object.entries(
      groupBy(territoryRows, (row: any) => row.key as string)
    ).map(([key, rows]) => ({
      key,
      countsByStatus: toStatusCounts(rows as any)
    }))
  };
};

const findComplianceStats = async (
  options: FindComplianceStatsOptions
): Promise<ComplianceStat[]> => {
  const groupByDepartment = options.byDepartment === true;

  const query = Samples()
    .select(
      `${samplesTable}.region`,
      ...(groupByDepartment
        ? [`${samplesTable}.department`]
        : [
            db.raw(`sample_matrix->>'matrixKind' as matrix_kind`),
            db.raw(`sample_matrix->>'matrix' as matrix`)
          ]),
      db.raw(`count(distinct ${samplesTable}.id) as total_count`),
      db.raw(
        `count(distinct ${samplesTable}.id) filter(where ${samplesTable}.compliance = 'Compliant') as compliant_count`
      ),
      db.raw(
        `count(distinct ${samplesTable}.id) filter(where ${samplesTable}.compliance in ('NonCompliant', 'NonCompliantAndHarmful')) as non_compliant_count`
      )
    )
    .whereIn(`${samplesTable}.programmingPlanId`, [options.programmingPlanId])
    .groupBy(`${samplesTable}.region`);

  if (groupByDepartment) {
    query.groupBy(`${samplesTable}.department`);
  } else {
    query
      .joinRaw(
        `cross join lateral jsonb_array_elements(${samplesTable}.matrices) as sample_matrix`
      )
      .whereRaw(`sample_matrix->>'matrix' is not null`)
      .groupByRaw(`sample_matrix->>'matrixKind', sample_matrix->>'matrix'`);
  }

  if (options.context) {
    query.where(`${samplesTable}.context`, options.context);
  }

  const rows = await query;
  return rows.map((r: any) =>
    ComplianceStat.parse(
      r.matrixKind === OtherMatrixKind.value
        ? omit(r, 'matrixKind', 'matrix')
        : r
    )
  );
};

export const sampleRepository = {
  insert,
  update,
  updateSeves,
  updateDocumentIds,
  findUnique,
  findSampleIdsByDocumentId,
  documentBelongsToSample,
  linkDocument,
  findMany,
  count,
  findComplianceStats,
  findDashboardStats,
  getNextSequence,
  deleteOne,
  deleteDraftOnProgrammingPlan,
  evaluateSampleCompliance,
  hasDetectedResidue,
  getSevesNotice
};
