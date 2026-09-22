import type { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import type { SubstanceKindLaboratory } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import { ProgrammingPlanContext } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { withSubstanceKindLaboratories } from 'maestro-shared/schema/Sample/SampleItem';
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
    contexts: ProgrammingPlanContext.options,
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
        withSubstanceKindLaboratories(sampleItems, substanceKindsLaboratories)
      );
    })
  );
};

export default {
  commitLaboratories
};
