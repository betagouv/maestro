import {
  DAOAInProgressProgrammingPlanFixture,
  PPVValidatedProgrammingPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  formatProgrammingPlan,
  ProgrammingPlanLocalStatus,
  ProgrammingPlans
} from '../../repositories/programmingPlanRepository';

export const seed = async (): Promise<void> => {
  await ProgrammingPlans().insert(
    [
      PPVValidatedProgrammingPlanFixture,
      DAOAInProgressProgrammingPlanFixture
    ].map(formatProgrammingPlan)
  );

  await Promise.all(
    PPVValidatedProgrammingPlanFixture.regionalStatus.map((regionalStatus) =>
      ProgrammingPlanLocalStatus().insert({
        ...regionalStatus,
        programmingPlanId: PPVValidatedProgrammingPlanFixture.id
      })
    )
  );

  await Promise.all(
    DAOAInProgressProgrammingPlanFixture.regionalStatus.map((regionalStatus) =>
      ProgrammingPlanLocalStatus().insert({
        ...regionalStatus,
        programmingPlanId: DAOAInProgressProgrammingPlanFixture.id
      })
    )
  );
};
