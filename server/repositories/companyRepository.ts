import fp from 'lodash';
import { Company } from '../../shared/schema/Company/Company';
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
    .then((_) => _ && Company.parse(fp.omitBy(_, fp.isNil)));
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
