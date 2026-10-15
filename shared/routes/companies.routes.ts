import z from 'zod';
import { Company } from '../schema/Company/Company';
import { CompanyWorkshop } from '../schema/Company/CompanyWorkshop';
import { FindCompanyOptions } from '../schema/Company/FindCompanyOptions';
import type { SubRoutes } from './routes';

export const companiesRoutes = {
  '/companies': {
    get: {
      permissions: ['readCompanies'],
      query: FindCompanyOptions,
      response: z.array(Company)
    }
  },
  '/companies/:siret/workshops': {
    params: {
      siret: z.string()
    },
    get: {
      permissions: ['readCompanies'],
      response: z.array(CompanyWorkshop)
    }
  }
} as const satisfies SubRoutes<'/companies'>;
