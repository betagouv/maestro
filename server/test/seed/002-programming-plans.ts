import { PrescriptionFixture } from 'maestro-shared/test/prescriptionFixtures';
import { ValidatedProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
import { Prescriptions } from '../../repositories/prescriptionRepository';
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

  await Prescriptions().insert(PrescriptionFixture);
};
