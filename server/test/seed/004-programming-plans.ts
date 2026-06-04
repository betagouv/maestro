import {
  DAOAInProgressProgrammingPlanFixture,
  DAOAValidatedProgrammingPlanFixture,
  PPVInProgressProgrammingPlanFixture,
  PPVValidatedProgrammingPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  formatProgrammingPlan,
  ProgrammingPlanLocalStatus,
  ProgrammingPlans
} from '../../repositories/programmingPlanRepository';
import { ProgrammingSubPlans } from '../../repositories/programmingSubPlanRepository';

export const seed = async (): Promise<void> => {
  await ProgrammingPlans().insert(
    [
      PPVValidatedProgrammingPlanFixture,
      PPVInProgressProgrammingPlanFixture,
      DAOAValidatedProgrammingPlanFixture,
      DAOAInProgressProgrammingPlanFixture
    ].map(formatProgrammingPlan)
  );

  await Promise.all(
    [
      PPVValidatedProgrammingPlanFixture,
      PPVInProgressProgrammingPlanFixture,
      DAOAValidatedProgrammingPlanFixture,
      DAOAInProgressProgrammingPlanFixture
    ].flatMap((plan) =>
      plan.regionalStatus.map((regionalStatus) =>
        ProgrammingPlanLocalStatus().insert({
          ...regionalStatus,
          programmingPlanId: plan.id
        })
      )
    )
  );

  await ProgrammingSubPlans().insert(
    [
      PPVValidatedProgrammingPlanFixture,
      PPVInProgressProgrammingPlanFixture,
      DAOAValidatedProgrammingPlanFixture,
      DAOAInProgressProgrammingPlanFixture
    ].flatMap((plan) =>
      plan.subPlans.map((subPlan) => ({
        id: subPlan.id,
        programmingPlanId: plan.id,
        codeNat: subPlan.codeNat,
        stages: subPlan.stages,
        label: subPlan.label,
        analysisPermissionRole: subPlan.analysisPermissionRole,
        contactListId: subPlan.contactListId,
        withSacha: subPlan.withSacha
      }))
    )
  );
};
