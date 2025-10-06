import {
  FoieDeBovinLocalPrescriptionFixture,
  FoieDeBovinPrescriptionFixture,
  VolailleLocalPrescriptionFixture,
  VolaillePrescriptionFixture
} from 'maestro-shared/test/prescriptionFixtures';
import { DAOAInProgressProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
import { LocalPrescriptions } from '../../../repositories/localPrescriptionRepository';
import { Prescriptions } from '../../../repositories/prescriptionRepository';
import { ProgrammingPlans } from '../../../repositories/programmingPlanRepository';

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

  await LocalPrescriptions().insert([
    ...FoieDeBovinLocalPrescriptionFixture,
    ...VolailleLocalPrescriptionFixture
  ]);
};
