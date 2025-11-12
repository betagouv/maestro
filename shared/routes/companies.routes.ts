import z from 'zod';
import { Company } from '../schema/Company/Company';
import { FindCompanyOptions } from '../schema/Company/FindCompanyOptions';
import { SubRoutes } from './routes';

export const companiesRoutes = {
  '/companies': {
    get: {
      permissions: ['readCompanies'],
      query: FindCompanyOptions,
      response: z.array(Company)
    }
  }
} as const satisfies SubRoutes<'/companies'>;
