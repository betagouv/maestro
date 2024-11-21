import {
  CreatedSampleData,
  isCreatedPartialSample,
  PartialSample,
  PartialSampleToCreate,
} from 'shared/schema/Sample/Sample';
import { useGetRegionalPrescriptionLaboratoryQuery } from 'src/services/regionalPrescription.service';

export const usePartialSample = (
  partialSample: PartialSample | PartialSampleToCreate
) => {
  const { data: laboratory } = useGetRegionalPrescriptionLaboratoryQuery(
    {
      prescriptionId: partialSample.prescriptionId as string,
      region: (partialSample as CreatedSampleData).region,
    },
    {
      skip:
        !isCreatedPartialSample(partialSample) || !partialSample.prescriptionId,
    }
  );

  return {
    laboratory,
  };
};
