import {
  FoieDeBovinPrescriptionFixture,
  FoieDeBovinRegionalPrescriptionFixture,
  VolaillePrescriptionFixture,
  VolailleRegionalPrescriptionFixture
} from 'maestro-shared/test/prescriptionFixtures';
import { DAOAInProgressProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
import { Prescriptions } from '../../../repositories/prescriptionRepository';
import { ProgrammingPlans } from '../../../repositories/programmingPlanRepository';
import { RegionalPrescriptions } from '../../../repositories/regionalPrescriptionRepository';

export const seed = async function () {
  const validatedProgrammingPlan = await ProgrammingPlans()
    .where({ id: DAOAInProgressProgrammingPlanFixture.id })
    .first();

  if (!validatedProgrammingPlan) {
    return;
  }

  await Prescriptions().insert([
    FoieDeBovinPrescriptionFixture,
    VolaillePrescriptionFixture
  ]);

  await RegionalPrescriptions().insert([
    ...FoieDeBovinRegionalPrescriptionFixture,
    ...VolailleRegionalPrescriptionFixture
  ]);
};
