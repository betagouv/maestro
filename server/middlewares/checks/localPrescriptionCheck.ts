import LocalPrescriptionMissingError from 'maestro-shared/errors/localPrescriptionPlanMissingError';
import type { FindLocalPrescriptionOptions } from 'maestro-shared/schema/LocalPrescription/FindLocalPrescriptionOptions';
import type { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import type { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import localPrescriptionRepository from '../../repositories/localPrescriptionRepository';

export const getAndCheckLocalPrescription = async ({
  prescriptionId,
  region,
  department,
  companySiret,
  includes
}: LocalPrescriptionKey &
  Pick<
    FindLocalPrescriptionOptions,
    'includes'
  >): Promise<LocalPrescription> => {
  const localPrescription = await localPrescriptionRepository.findUnique({
    prescriptionId,
    region,
    department,
    companySiret,
    includes
  });

  if (!localPrescription) {
    throw new LocalPrescriptionMissingError(prescriptionId, region);
  }

  return localPrescription;
};
