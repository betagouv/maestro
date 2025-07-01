import {
  PrescriptionFixture,
  RegionalPrescriptionFixture
} from 'maestro-shared/test/prescriptionFixtures';
import { Prescriptions } from '../../repositories/prescriptionRepository';
import { RegionalPrescriptions } from '../../repositories/regionalPrescriptionRepository';

export const seed = async (): Promise<void> => {
  await Prescriptions().insert(PrescriptionFixture);

  await RegionalPrescriptions().insert(RegionalPrescriptionFixture);
};
