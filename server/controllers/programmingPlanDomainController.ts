import { canUpdateProgrammingPlanSettings } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanNationalCoordinator';
import { isProgrammingPlanDomainDeletable } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { HttpStatus } from '../constants/httpStatus';
import { programmingPlanDomainRepository } from '../repositories/programmingPlanDomainRepository';
import programmingPlanRepository from '../repositories/programmingPlanRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';
import { programmingPlanDeletionService } from '../services/programmingPlanDeletionService';

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
  },
  '/programming-plan-domains/:programmingPlanDomainId': {
    delete: async ({ user, account }, { programmingPlanDomainId }) => {
      const domain = await programmingPlanDomainRepository.findUnique(
        programmingPlanDomainId
      );

      if (!domain) {
        return { status: HttpStatus.NOT_FOUND };
      }

      const domainPlans = (
        await programmingPlanRepository.findMany({ year: domain.year })
      ).filter((plan) => plan.domainId === programmingPlanDomainId);

      if (
        !domainPlans.every((plan) =>
          canUpdateProgrammingPlanSettings(plan, user, account.roles)
        )
      ) {
        return { status: HttpStatus.FORBIDDEN };
      }

      if (!isProgrammingPlanDomainDeletable(domainPlans)) {
        throw programmingPlanDeletionService.settingsCompletedConflict();
      }

      console.info('Delete programming plan domain', programmingPlanDomainId);

      await programmingPlanDeletionService.deleteOrConflict(() =>
        programmingPlanDomainRepository.deleteOne(programmingPlanDomainId)
      );

      return { status: HttpStatus.NO_CONTENT };
    }
  }
} as const satisfies ProtectedSubRouter;
