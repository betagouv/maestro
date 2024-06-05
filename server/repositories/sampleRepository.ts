import fp from 'lodash';
import z from 'zod';
import { Region, Regions } from '../../shared/referential/Region';
import { defaultPerPage } from '../../shared/schema/commons/Pagination';
import { FindSampleOptions } from '../../shared/schema/Sample/FindSampleOptions';
import {
  CreatedSample,
  PartialSample,
} from '../../shared/schema/Sample/Sample';
import { companiesTable } from './companyRepository';
import db from './db';

const samplesTable = 'samples';
const sampleSequenceNumbers = 'sample_sequence_numbers';

const PartialSampleDbo = PartialSample.omit({
  items: true,
  company: true,
}).merge(
  z.object({
    companyId: z.string().uuid().optional().nullable(),
    geolocation: z.any(),
  })
);

const PartialSampleJoinedDbo = PartialSampleDbo.merge(
  z.object({
    companySiret: z.string(),
    companyName: z.string(),
    companyTradeName: z.string().optional().nullable(),
    companyAddress: z.string().optional().nullable(),
    companyPostalCode: z.string().optional().nullable(),
    companyCity: z.string().optional().nullable(),
    companyNafCode: z.string().optional().nullable(),
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
      `${companiesTable}.id as company_id`,
      `${companiesTable}.siret as company_siret`,
      `${companiesTable}.name as company_name`,
      `${companiesTable}.trade_name as company_trade_name`,
      `${companiesTable}.address as company_address`,
      `${companiesTable}.postal_code as company_postal_code`,
      `${companiesTable}.city as company_city`,
      `${companiesTable}.naf_code as company_naf_code`
    )
    .where(`${samplesTable}.id`, id)
    .leftJoin(
      companiesTable,
      `${samplesTable}.companyId`,
      `${companiesTable}.id`
    )
    .first()
    .then(parsePartialSample);
};

const findRequest = (findOptions: FindSampleOptions) =>
  Samples()
    .where(
      fp.omitBy(
        fp.omit(findOptions, 'region', 'page', 'perPage', 'statusList'),
        (_) => fp.isNil(_) || fp.isArray(_)
      )
    )
    .modify((builder) => {
      if (findOptions.region) {
        builder.whereIn('department', Regions[findOptions.region].departments);
      }
      if (fp.isArray(findOptions.status)) {
        builder.whereIn('status', findOptions.status);
      }
    });

const findMany = async (
  findOptions: FindSampleOptions
): Promise<PartialSample[]> => {
  console.info('Find samples', fp.omitBy(findOptions, fp.isNil));
  return findRequest(findOptions)
    .select(
      `${samplesTable}.*`,
      `${companiesTable}.id as company_id`,
      `${companiesTable}.siret as company_siret`,
      `${companiesTable}.name as company_name`,
      `${companiesTable}.trade_name as company_trade_name`,
      `${companiesTable}.address as company_address`,
      `${companiesTable}.postal_code as company_postal_code`,
      `${companiesTable}.city as company_city`,
      `${companiesTable}.naf_code as company_naf_code`
    )
    .leftJoin(
      companiesTable,
      `${samplesTable}.companyId`,
      `${companiesTable}.id`
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
    .then((samples) => samples.map(parsePartialSample));
};

const count = async (findOptions: FindSampleOptions): Promise<number> => {
  console.info('Count samples', fp.omitBy(findOptions, fp.isNil));
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
      next_sequence: 1,
    });
    return 1;
  }

  await db(sampleSequenceNumbers)
    .where({ region, programmingPlanYear })
    .increment('next_sequence', 1);

  return result.nextSequence;
};

const insert = async (createdSample: CreatedSample): Promise<void> => {
  console.info('Insert sample', createdSample.id);
  await Samples().insert(formatPartialSample(createdSample));
};

const update = async (partialSample: PartialSample): Promise<void> => {
  console.info('Update sample', partialSample.id);
  if (Object.keys(partialSample).length > 0) {
    await Samples()
      .where({ id: partialSample.id })
      .update(formatPartialSample(partialSample));
  }
};

const deleteOne = async (id: string): Promise<void> => {
  console.info('Delete sample', id);
  await Samples().where({ id }).delete();
};

export const formatPartialSample = (
  partialSample: PartialSample
): PartialSampleDbo => ({
  ...fp.omit(partialSample, ['items', 'company']),
  geolocation: db.raw('Point(?, ?)', [
    partialSample.geolocation.x,
    partialSample.geolocation.y,
  ]),
  companyId: partialSample.company?.id,
});

export const parsePartialSample = (
  sample: PartialSampleJoinedDbo
): PartialSample =>
  sample &&
  PartialSample.parse({
    ...fp.omit(fp.omitBy(sample, fp.isNil), ['companyId']),
    geolocation: {
      x: sample.geolocation.x,
      y: sample.geolocation.y,
    },
    company: sample.companyId
      ? {
          id: sample.companyId,
          siret: sample.companySiret,
          name: sample.companyName,
          tradeName: sample.companyTradeName ?? undefined,
          address: sample.companyAddress ?? undefined,
          postalCode: sample.companyPostalCode ?? undefined,
          city: sample.companyCity ?? undefined,
          nafCode: sample.companyNafCode ?? undefined,
        }
      : undefined,
  });

export default {
  insert,
  update,
  findUnique,
  findMany,
  count,
  getNextSequence,
  deleteOne,
};
