import RegionalPrescriptionMissingError from 'maestro-shared/errors/regionalPrescriptionPlanMissingError';
import { RegionalPrescription } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { RegionalPrescriptionKey } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescriptionKey';
import regionalPrescriptionRepository from '../../repositories/regionalPrescriptionRepository';

export const getAndCheckRegionalPrescription = async ({
  prescriptionId,
  region
}: RegionalPrescriptionKey): Promise<RegionalPrescription> => {
  const regionalPrescription = await regionalPrescriptionRepository.findUnique({
    prescriptionId,
    region
  });

  if (!regionalPrescription) {
    throw new RegionalPrescriptionMissingError(prescriptionId, region);
  }

  return regionalPrescription;
};
