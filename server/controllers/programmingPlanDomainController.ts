import { HttpStatus } from '../constants/httpStatus';
import { programmingPlanDomainRepository } from '../repositories/programmingPlanDomainRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';

export const programmingPlanDomainRouter = {
  '/programming-plan-domains': {
    get: async () => {
      const domains = await programmingPlanDomainRepository.findMany();
      return { response: domains, status: HttpStatus.OK };
    },
    post: async ({ body }) => {
      console.info('Create programming plan domain', body.label);

      const domain = await programmingPlanDomainRepository.insert(body);

      return { response: domain, status: HttpStatus.CREATED };
    }
  }
} as const satisfies ProtectedSubRouter;
