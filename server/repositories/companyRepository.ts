import {omitBy, isNil} from 'lodash-es';
import { Company } from 'maestro-shared/schema/Company/Company';
import {knexInstance as db} from './db';

export const companiesTable = 'companies';

export const Companies = () => db<Company>(companiesTable);

const findUnique = async (siret: string): Promise<Company | undefined> => {
  console.info('Find company', siret);
  return Companies()
    .where({
      siret,
    })
    .first()
    .then((_) => _ && Company.parse(omitBy(_, isNil)));
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
  upsert,
};
