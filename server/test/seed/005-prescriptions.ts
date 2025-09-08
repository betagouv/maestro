import {
  PrescriptionFixture,
  RegionalPrescriptionFixture
} from 'maestro-shared/test/prescriptionFixtures';
import { Prescriptions } from '../../repositories/prescriptionRepository';
import {
  formatRegionalPrescription,
  RegionalPrescriptions
} from '../../repositories/regionalPrescriptionRepository';

export const seed = async (): Promise<void> => {
  await Prescriptions().insert(PrescriptionFixture);

  await RegionalPrescriptions().insert(
    formatRegionalPrescription(RegionalPrescriptionFixture)
  );
};
