import { PPVValidatedProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
import {
  formatProgrammingPlan,
  ProgrammingPlanRegionalStatus,
  ProgrammingPlans
} from '../../repositories/programmingPlanRepository';

export const seed = async (): Promise<void> => {
  await ProgrammingPlans().insert(
    formatProgrammingPlan(PPVValidatedProgrammingPlanFixture)
  );

  await Promise.all(
    PPVValidatedProgrammingPlanFixture.regionalStatus.map((regionalStatus) =>
      ProgrammingPlanRegionalStatus().insert({
        ...regionalStatus,
        programmingPlanId: PPVValidatedProgrammingPlanFixture.id
      })
    )
  );
};
