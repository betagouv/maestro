import { skipToken } from '@reduxjs/toolkit/query';
import {
  isCreatedPartialSample,
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { useContext, useEffect, useMemo } from 'react';
import { ApiClientContext } from '../services/apiClient';
import { useGetProgrammingPlanQuery } from '../services/programming-plan.service';
import programmingPlanSlice from '../store/reducers/programmingPlanSlice';
import { useAuthentication } from './useAuthentication';
import { useAppDispatch } from './useStore';

export const usePartialSample = (
  partialSample?: PartialSample | PartialSampleToCreate
) => {
  const dispatch = useAppDispatch();
  const { hasUserPermission, user } = useAuthentication();

  const { data: programmingPlan } = useGetProgrammingPlanQuery(
    partialSample?.programmingPlanId ?? skipToken
  );

  const apiClient = useContext(ApiClientContext);
  const { data: laboratory } = apiClient.useGetLaboratoryQuery(
    partialSample?.laboratoryId ?? skipToken
  );

  useEffect(() => {
    if (programmingPlan) {
      dispatch(
        programmingPlanSlice.actions.setProgrammingPlan(programmingPlan)
      );
    }
  }, [programmingPlan]);

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
