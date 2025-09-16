import { isNil, omit, omitBy } from 'lodash-es';
import { Regions } from 'maestro-shared/referential/Region';
import { Company } from 'maestro-shared/schema/Company/Company';
import { FindCompanyOptions } from 'maestro-shared/schema/Company/FindCompanyOptions';
import z from 'zod';
import { knexInstance as db } from './db';

export const companiesTable = 'companies';

const CompanyDbo = z.object({
  ...Company.omit({
    geolocation: true
  }).shape,
  geolocation: z.any().nullish()
});

type CompanyDbo = z.infer<typeof CompanyDbo>;

export const Companies = () => db<CompanyDbo>(companiesTable);

const findUnique = async (siret: string): Promise<Company | undefined> => {
  console.info('Find company', siret);
  return Companies()
    .where({
      siret
    })
    .first()
    .then((_) => _ && Company.parse(omitBy(_, isNil)));
};

const findMany = async (
  findOptions: FindCompanyOptions
): Promise<Company[]> => {
  console.info('Find companies', omitBy(findOptions, isNil));
  return Companies()
    .where(omitBy(omit(findOptions, 'region', 'department'), isNil))
    .modify((builder) => {
      if (findOptions.region) {
        builder.whereIn(
          builder.client.raw('left(postal_code, 2)'),
          Regions[findOptions.region].departments.map(String)
        );
      }
      if (findOptions.department) {
        builder.whereILike('postal_code', `${findOptions.department}%`);
      }
    })
    .then((companies) =>
      companies.map((_: any) => Company.parse(omitBy(_, isNil)))
    );
};

const upsert = async (company: Company): Promise<Company> => {
  console.info('Upsert company', company.siret);
  return Companies()
    .insert({
      ...company,
      geolocation: company.geolocation
        ? db.raw('Point(?, ?)', [company.geolocation.x, company.geolocation.y])
        : null
    })
    .onConflict('siret')
    .merge()
    .then(() => company);
};

export default {
  findUnique,
  findMany,
  upsert
};
