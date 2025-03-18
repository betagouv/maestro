import { skipToken } from '@reduxjs/toolkit/query';
import {
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { useContext } from 'react';
import { ApiClientContext } from '../services/apiClient';

export const usePartialSample = (
  partialSample: PartialSample | PartialSampleToCreate
) => {

  const apiClient = useContext(ApiClientContext)
  const { data: laboratory } = apiClient.useGetLaboratoryQuery(
    partialSample.laboratoryId ?? skipToken
  );

  return {
    laboratory
  };
};
