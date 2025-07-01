import { ValidatedProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
import {
  formatProgrammingPlan,
  ProgrammingPlanRegionalStatus,
  ProgrammingPlans
} from '../../repositories/programmingPlanRepository';

export const seed = async (): Promise<void> => {
  await ProgrammingPlans().insert(
    formatProgrammingPlan(ValidatedProgrammingPlanFixture)
  );

  await Promise.all(
    ValidatedProgrammingPlanFixture.regionalStatus.map((regionalStatus) =>
      ProgrammingPlanRegionalStatus().insert({
        ...regionalStatus,
        programmingPlanId: ValidatedProgrammingPlanFixture.id
      })
    )
  );
};
