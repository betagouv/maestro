import { canInitiateNextCampaign } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { canUpdateProgrammingPlanSettings } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanNationalCoordinator';
import { HttpStatus } from '../constants/httpStatus';
import { programmingPlanDomainRepository } from '../repositories/programmingPlanDomainRepository';
import programmingPlanRepository from '../repositories/programmingPlanRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';
import { programmingPlanDeletionService } from '../services/programmingPlanDeletionService';
import { programmingPlanDuplicationService } from '../services/programmingPlanDuplicationService';

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
  '/programming-plan-domains/campaigns': {
    post: async ({ user }) => {
      const today = new Date();
      const year = today.getFullYear();
      const years = [
        ...(await programmingPlanDomainRepository.findMany()),
        ...(await programmingPlanRepository.findMany({ year: year + 1 }))
      ].map((_) => _.year);

      if (!canInitiateNextCampaign(years, year, today)) {
        return { status: HttpStatus.CONFLICT };
      }

      console.info('Initiate programming plan campaign', year + 1);

      await programmingPlanDuplicationService.duplicateCampaign(year, user.id);

      return { status: HttpStatus.CREATED };
    }
  },
  '/programming-plan-domains/:programmingPlanDomainId/duplicate': {
    post: async ({ user, account }, { programmingPlanDomainId }) => {
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

      console.info(
        'Duplicate programming plan domain',
        programmingPlanDomainId
      );

      const duplicatedDomainId =
        await programmingPlanDuplicationService.duplicateDomain(
          programmingPlanDomainId,
          user.id
        );

      const duplicatedDomain =
        await programmingPlanDomainRepository.findUnique(duplicatedDomainId);

      if (!duplicatedDomain) {
        return { status: HttpStatus.NOT_FOUND };
      }

      return { response: duplicatedDomain, status: HttpStatus.CREATED };
    }
  },
  '/programming-plan-domains/:programmingPlanDomainId': {
    put: async ({ user, account, body }, { programmingPlanDomainId }) => {
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

      console.info('Rename programming plan domain', programmingPlanDomainId);

      const updatedDomain = await programmingPlanDomainRepository.update(
        programmingPlanDomainId,
        body
      );

      return { response: updatedDomain, status: HttpStatus.OK };
    },
    delete: async (_, { programmingPlanDomainId }) => {
      const domain = await programmingPlanDomainRepository.findUnique(
        programmingPlanDomainId
      );

      if (!domain) {
        return { status: HttpStatus.NOT_FOUND };
      }

      console.info('Delete programming plan domain', programmingPlanDomainId);

      await programmingPlanDeletionService.deleteOrConflict(() =>
        programmingPlanDomainRepository.deleteOne(programmingPlanDomainId)
      );

      return { status: HttpStatus.NO_CONTENT };
    }
  }
} as const satisfies ProtectedSubRouter;
