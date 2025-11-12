import { constants } from 'http2';
import companyRepository from '../repositories/companyRepository';
import { ProtectedSubRouter } from '../routers/routes.type';

export const companiesRouter = {
  '/companies': {
    get: async ({ query: findOptions }) => {
      console.info('Find companies', findOptions);

      const companies = await companyRepository.findMany(findOptions);

      return { status: constants.HTTP_STATUS_OK, response: companies };
    }
  }
} as const satisfies ProtectedSubRouter;
