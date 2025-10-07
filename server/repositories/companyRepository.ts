import { isNil, omit, omitBy } from 'lodash-es';
import { Regions } from 'maestro-shared/referential/Region';
import { Company } from 'maestro-shared/schema/Company/Company';
import { FindCompanyOptions } from 'maestro-shared/schema/Company/FindCompanyOptions';
import { knexInstance as db } from './db';

export const companiesTable = 'companies';

export const Companies = () => db<Company>(companiesTable);

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
    .where(omitBy(omit(findOptions, 'region'), isNil))
    .modify((builder) => {
      if (findOptions.region) {
        builder.whereIn(
          builder.client.raw('left(postal_code, 2)'),
          Regions[findOptions.region].departments.map(String)
        );
      }
    })
    .then((companies) =>
      companies.map((_: any) => Company.parse(omitBy(_, isNil)))
    );
};

const upsert = async (company: Company): Promise<Company> => {
  console.info('Upsert company', company.siret);
  return Companies()
    .insert(company)
    .onConflict('siret')
    .merge()
    .then(() => company);
};

export default {
  findUnique,
  findMany,
  upsert
};
