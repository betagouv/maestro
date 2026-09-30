import { HttpStatus } from '../constants/httpStatus';
import { getAndCheckProgrammingPlan } from '../middlewares/checks/programmingPlanCheck';
import { programmingPlanDomainRepository } from '../repositories/programmingPlanDomainRepository';
import programmingPlanRepository from '../repositories/programmingPlanRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';

export const programmingPlanDomainMoveRouter = {
  '/programming-plans/:programmingPlanId/domain': {
    put: async ({ body, user }, { programmingPlanId }) => {
      const programmingPlan =
        await getAndCheckProgrammingPlan(programmingPlanId);

      const domain = await programmingPlanDomainRepository.findUnique(
        body.domainId
      );

      if (!domain) {
        return { status: HttpStatus.NOT_FOUND };
      }

      if (domain.year !== programmingPlan.year) {
        return { status: HttpStatus.BAD_REQUEST };
      }

      console.info(
        'Move programming plan to another domain',
        programmingPlanId,
        { from: programmingPlan.domainId, to: domain.id, by: user.id }
      );

      await programmingPlanRepository.updateDomain(
        programmingPlanId,
        domain.id
      );

      const movedPlan =
        await programmingPlanRepository.findUnique(programmingPlanId);

      if (!movedPlan) {
        throw new Error(`Programming plan ${programmingPlanId} not found`);
      }

      return { response: movedPlan, status: HttpStatus.OK };
    }
  }
} as const satisfies ProtectedSubRouter;
