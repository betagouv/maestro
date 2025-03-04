import { skipToken } from '@reduxjs/toolkit/query';
import {
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { ApiClient } from '../services/apiClient';

export const usePartialSample = (
  partialSample: PartialSample | PartialSampleToCreate, apiClient: Pick<ApiClient, 'useGetLaboratoryQuery'>
) => {
  const { data: laboratory } = apiClient.useGetLaboratoryQuery(
    partialSample.laboratoryId ?? skipToken
  );

  return {
    laboratory
  };
};
