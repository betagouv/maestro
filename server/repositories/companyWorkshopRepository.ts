import { CompanyWorkshop } from 'maestro-shared/schema/Company/CompanyWorkshop';
import { knexInstance as db } from './db';

export const companyWorkshopsTable = 'company_workshops';

export const CompanyWorkshops = () =>
  db<CompanyWorkshop>(companyWorkshopsTable);

const findMany = async (siret: string): Promise<CompanyWorkshop[]> => {
  console.info('Find company workshops', siret);
  return CompanyWorkshops()
    .where({ siret })
    .orderBy('ate_lb')
    .then((workshops) => workshops.map((_) => CompanyWorkshop.parse(_)));
};

export default {
  findMany
};
