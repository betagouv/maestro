import { HttpStatus } from '../constants/httpStatus';
import { programmingPlanDomainRepository } from '../repositories/programmingPlanDomainRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';

export const programmingPlanDomainRouter = {
  '/programming-plan-domains': {
    get: async () => {
      const domains = await programmingPlanDomainRepository.findMany();
      return { response: domains, status: HttpStatus.OK };
    }
  }
} as const satisfies ProtectedSubRouter;
