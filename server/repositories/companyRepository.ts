import fp from 'lodash';
import { Company } from '../../shared/schema/Company/Company';
import db from './db';

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

const insert = async (company: Company): Promise<Company> => {
  console.info('Insert company', company.siret);
  return Companies()
    .insert(company)
    .then(() => company);
};

export default {
  findUnique,
  insert,
};
