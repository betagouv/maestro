import LocalPrescriptionMissingError from 'maestro-shared/errors/localPrescriptionPlanMissingError';
import { FindLocalPrescriptionOptions } from 'maestro-shared/schema/LocalPrescription/FindLocalPrescriptionOptions';
import { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
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
