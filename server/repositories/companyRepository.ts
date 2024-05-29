import fp from 'lodash';
import { Company } from '../../shared/schema/Company/Company';
import { FindCompanyOptions } from '../../shared/schema/Company/FindCompanyOptions';
import db from './db';

export const companiesTable = 'companies';

export const Companies = () => db<Company>(companiesTable);

const findMany = async (
  findOptions: FindCompanyOptions
): Promise<Company[]> => {
  console.info('Find companies', findOptions);
  return Companies()
    .where(fp.omitBy(findOptions, fp.isNil))
    .then((companies) =>
      companies.map((_) => Company.parse(fp.omitBy(_, fp.isNil)))
    );
};

export default {
  findMany,
};
