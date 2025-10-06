import {
  LocalPrescriptionFixture,
  PrescriptionFixture
} from 'maestro-shared/test/prescriptionFixtures';
import {
  formatLocalPrescription,
  LocalPrescriptions
} from '../../repositories/localPrescriptionRepository';
import { Prescriptions } from '../../repositories/prescriptionRepository';

export const seed = async (): Promise<void> => {
  await Prescriptions().insert(PrescriptionFixture);

  await LocalPrescriptions().insert(
    formatLocalPrescription(LocalPrescriptionFixture)
  );
};
