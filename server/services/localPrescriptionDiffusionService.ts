import type { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import type { SubstanceKindLaboratory } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import localPrescriptionLaboratoryRepository from '../repositories/localPrescriptionSubstanceKindLaboratoryRepository';
import sampleItemRepository from '../repositories/sampleItemRepository';
import { sampleRepository } from '../repositories/sampleRepository';

const commitLaboratories = async (
  key: Omit<LocalPrescriptionKey, 'companySiret'>,
  substanceKindsLaboratories: SubstanceKindLaboratory[]
): Promise<void> => {
  await localPrescriptionLaboratoryRepository.updateMany(
    key,
    substanceKindsLaboratories
  );

  const prescriptionSamples = await sampleRepository.findMany({
    statuses: ['Draft', 'Submitted'],
    prescriptionId: key.prescriptionId,
    regions: [key.region],
    departments: key.department ? [key.department] : undefined
  });

  await Promise.all(
    prescriptionSamples.map(async (samplePrescription) => {
      const sampleItems = await sampleItemRepository.findMany(
        samplePrescription.id
      );
      await sampleItemRepository.updateMany(
        samplePrescription.id,
        sampleItems.map((sampleItem) => ({
          ...sampleItem,
          laboratoryId:
            sampleItem.recipientKind === 'Laboratory'
              ? (substanceKindsLaboratories?.find(
                  (s) => s.substanceKind === sampleItem.substanceKind
                )?.laboratoryId ?? null)
              : undefined
        }))
      );
    })
  );
};

export default {
  commitLaboratories
};
