import {
  DAOABovinInProgressSubPlanFixture,
  DAOABovinValidatedSubPlanFixture,
  DAOAInProgressProgrammingPlanFixture,
  DAOAValidatedProgrammingPlanFixture,
  DAOAVolailleInProgressSubPlanFixture,
  DAOAVolailleValidatedSubPlanFixture,
  PPVClosedProgrammingPlanFixture,
  PPVClosedSubPlanFixture,
  PPVInProgressProgrammingPlanFixture,
  PPVInProgressSubPlanFixture,
  PPVSubmittedProgrammingPlanFixture,
  PPVSubmittedSubPlanFixture,
  PPVValidatedDromProgrammingPlanFixture,
  PPVValidatedDromSubPlanFixture,
  PPVValidatedProgrammingPlanFixture,
  PPVValidatedSubPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  formatProgrammingPlan,
  ProgrammingPlans
} from '../../repositories/programmingPlanRepository';
import {
  ProgrammingSubPlanLocalStatus,
  ProgrammingSubPlans
} from '../../repositories/programmingSubPlanRepository';

export const seed = async (): Promise<void> => {
  await ProgrammingPlans().insert(
    [
      PPVClosedProgrammingPlanFixture,
      PPVValidatedProgrammingPlanFixture,
      PPVValidatedDromProgrammingPlanFixture,
      PPVInProgressProgrammingPlanFixture,
      PPVSubmittedProgrammingPlanFixture,
      DAOAValidatedProgrammingPlanFixture,
      DAOAInProgressProgrammingPlanFixture
    ].map(formatProgrammingPlan)
  );

  await Promise.all(
    [
      PPVClosedSubPlanFixture,
      PPVValidatedSubPlanFixture,
      PPVValidatedDromSubPlanFixture,
      PPVInProgressSubPlanFixture,
      PPVSubmittedSubPlanFixture,
      DAOAVolailleValidatedSubPlanFixture,
      DAOABovinValidatedSubPlanFixture,
      DAOAVolailleInProgressSubPlanFixture,
      DAOABovinInProgressSubPlanFixture
    ].flatMap((plan) =>
      plan.regionalStatus.map((regionalStatus) =>
        ProgrammingSubPlanLocalStatus().insert({
          ...regionalStatus,
          programmingPlanId: plan.id
        })
      )
    )
  );

  await ProgrammingSubPlans().insert([
    PPVClosedSubPlanFixture,
    PPVValidatedSubPlanFixture,
    PPVValidatedDromSubPlanFixture,
    PPVInProgressSubPlanFixture,
    PPVSubmittedSubPlanFixture,
    DAOAVolailleValidatedSubPlanFixture,
    DAOABovinValidatedSubPlanFixture,
    DAOAVolailleInProgressSubPlanFixture,
    DAOABovinInProgressSubPlanFixture
  ]);
};
