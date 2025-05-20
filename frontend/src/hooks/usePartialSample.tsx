import { skipToken } from '@reduxjs/toolkit/query';
import {
  isCreatedPartialSample,
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { useContext, useEffect, useMemo } from 'react';
import { ApiClientContext } from '../services/apiClient';
import programmingPlanSlice from '../store/reducers/programmingPlanSlice';
import { useAuthentication } from './useAuthentication';
import { useAppDispatch, useAppSelector } from './useStore';

export const usePartialSample = (
  partialSample?: PartialSample | PartialSampleToCreate
) => {
  const apiClient = useContext(ApiClientContext);
  const dispatch = useAppDispatch();
  const { hasUserPermission, user } = useAuthentication();
  const { programmingPlan: stateProgrammingPlan } = useAppSelector(
    (state) => state.programmingPlan
  );

  const { data: programmingPlan } = apiClient.useGetProgrammingPlanQuery(
    partialSample?.programmingPlanId as string,
    {
      skip:
        !partialSample?.programmingPlanId ||
        (stateProgrammingPlan &&
          stateProgrammingPlan.id === partialSample?.programmingPlanId)
    }
  );

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
