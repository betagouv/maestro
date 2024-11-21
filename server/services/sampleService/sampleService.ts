import { Laboratory } from '../../../shared/schema/Laboratory/Laboratory';
import { Sample } from '../../../shared/schema/Sample/Sample';
import laboratoryRepository from '../../repositories/laboratoryRepository';
import regionalPrescriptionRepository from '../../repositories/regionalPrescriptionRepository';

const getSampleLaboratory = async (
  sample: Sample
): Promise<Laboratory | null> => {
  if (!sample.prescriptionId || !sample.region) {
    return null;
  }

  const regionalPrescription = await regionalPrescriptionRepository.findUnique({
    prescriptionId: sample.prescriptionId,
    region: sample.region,
  });

  if (!regionalPrescription) {
    return null;
  }

  if (!regionalPrescription.laboratoryId) {
    return null;
  }

  const laboratory = await laboratoryRepository.findUnique(
    regionalPrescription.laboratoryId
  );

  if (!laboratory) {
    return null;
  }

  return laboratory;
};

export default {
  getSampleLaboratory,
};
