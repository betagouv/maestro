import { HttpStatus } from '../constants/httpStatus';
import companyRepository from '../repositories/companyRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';

export const companiesRouter = {
  '/companies': {
    get: async ({ query: findOptions }) => {
      console.info('Find companies', findOptions);

      const companies = await companyRepository.findMany(findOptions);

      return { status: HttpStatus.OK, response: companies };
    }
  }
} as const satisfies ProtectedSubRouter;
