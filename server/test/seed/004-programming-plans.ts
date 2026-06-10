import {
  DAOAInProgressProgrammingPlanFixture,
  DAOAValidatedProgrammingPlanFixture,
  PPVClosedProgrammingPlanFixture,
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
      PPVClosedProgrammingPlanFixture,
      PPVValidatedProgrammingPlanFixture,
      PPVInProgressProgrammingPlanFixture,
      DAOAValidatedProgrammingPlanFixture,
      DAOAInProgressProgrammingPlanFixture
    ].map(formatProgrammingPlan)
  );

  await Promise.all(
    [
      PPVClosedProgrammingPlanFixture,
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
      PPVClosedProgrammingPlanFixture,
      PPVValidatedProgrammingPlanFixture,
      PPVInProgressProgrammingPlanFixture,
      DAOAValidatedProgrammingPlanFixture,
      DAOAInProgressProgrammingPlanFixture
    ].flatMap((plan) =>
      plan.subPlans.map((subPlan) => ({
        ...subPlan,
        programmingPlanId: plan.id
      }))
    )
  );
};
