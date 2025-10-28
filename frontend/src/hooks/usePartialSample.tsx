import {
  isCreatedPartialSample,
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { useCallback, useContext, useEffect, useMemo } from 'react';
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

  const { data: laboratories } = apiClient.useFindLaboratoriesQuery(undefined, {
    skip: (partialSample?.items ?? []).length === 0
  });

  useEffect(() => {
    if (programmingPlan) {
      dispatch(
        programmingPlanSlice.actions.setProgrammingPlan(programmingPlan)
      );
    }
  }, [programmingPlan]); // eslint-disable-line react-hooks/exhaustive-deps

  const readonly = useMemo(
    () =>
      !hasUserPermission('updateSample') ||
      (isCreatedPartialSample(partialSample) &&
        partialSample.region !== user?.region),
    [hasUserPermission, partialSample, user?.region]
  );

  const getSampleItemLaboratory = useCallback(
    (itemNumber: number) => {
      const item = partialSample?.items?.find(
        (item) => item.itemNumber === itemNumber && item.copyNumber === 1
      );
      return item?.laboratoryId
        ? (laboratories ?? []).find(
            (laboratory) => laboratory.id === item.laboratoryId
          )
        : undefined;
    },
    [partialSample, laboratories]
  );

  return {
    readonly,
    getSampleItemLaboratory
  };
};
