import { skipToken } from '@reduxjs/toolkit/query';
import {
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { useGetLaboratoryQuery } from 'src/services/laboratory.service';

export const usePartialSample = (
  partialSample: PartialSample | PartialSampleToCreate
) => {
  const { data: laboratory } = useGetLaboratoryQuery(
    partialSample.laboratoryId ?? skipToken
  );

  return {
    laboratory
  };
};
