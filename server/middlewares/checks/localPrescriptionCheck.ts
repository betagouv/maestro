import LocalPrescriptionMissingError from 'maestro-shared/errors/localPrescriptionPlanMissingError';
import { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import localPrescriptionRepository from '../../repositories/localPrescriptionRepository';

export const getAndCheckLocalPrescription = async ({
  prescriptionId,
  region,
  department
}: LocalPrescriptionKey): Promise<LocalPrescription> => {
  const localPrescription = await localPrescriptionRepository.findUnique({
    prescriptionId,
    region,
    department
  });

  if (!localPrescription) {
    throw new LocalPrescriptionMissingError(prescriptionId, region);
  }

  return localPrescription;
};
