import { skipToken } from '@reduxjs/toolkit/query';
import {
  isCreatedPartialSample,
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { useContext, useMemo } from 'react';
import { ApiClientContext } from '../services/apiClient';
import { useAuthentication } from './useAuthentication';

export const usePartialSample = (
  partialSample?: PartialSample | PartialSampleToCreate
) => {
  const { hasUserPermission, user } = useAuthentication();

  const apiClient = useContext(ApiClientContext);
  const { data: laboratory } = apiClient.useGetLaboratoryQuery(
    partialSample?.laboratoryId ?? skipToken
  );

  const readonly = useMemo(
    () =>
      !hasUserPermission('updateSample') ||
      (isCreatedPartialSample(partialSample) &&
        partialSample.region !== user?.region),
    [hasUserPermission, partialSample, user?.region]
  );

  return {
    readonly,
    laboratory
  };
};
