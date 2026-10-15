import { HttpStatus } from '../constants/httpStatus';
import companyRepository from '../repositories/companyRepository';
import companyWorkshopRepository from '../repositories/companyWorkshopRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';

export const companiesRouter = {
  '/companies': {
    get: async ({ query: findOptions }) => {
      console.info('Find companies', findOptions);

      const companies = await companyRepository.findMany(findOptions);

      return { status: HttpStatus.OK, response: companies };
    }
  },
  '/companies/:siret/workshops': {
    get: async (_request, { siret }) => {
      const workshops = await companyWorkshopRepository.findMany(siret);

      return { status: HttpStatus.OK, response: workshops };
    }
  }
} as const satisfies ProtectedSubRouter;
