import {
  isCreatedPartialSample,
  type PartialSample,
  type PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { toArray } from 'maestro-shared/utils/utils';
import { useCallback, useContext, useMemo } from 'react';
import { useParams } from 'react-router';
import { ApiClientContext } from '../services/apiClient';
import { useAuthentication } from './useAuthentication';

export const usePartialSample = (
  partialSample?: PartialSample | PartialSampleToCreate
) => {
  const apiClient = useContext(ApiClientContext);
  const { hasUserPermission, user } = useAuthentication();
  const { year: yearParam } = useParams<{ year: string }>();

  const { data: sampleProgrammingPlan } = apiClient.useGetProgrammingPlanQuery(
    { programmingPlanId: partialSample?.programmingPlanId as string },
    { skip: !partialSample?.programmingPlanId }
  );
  const { data: yearProgrammingPlans } = apiClient.useFindProgrammingPlansQuery(
    {
      year: Number(yearParam)
    },
    {
      skip: !!partialSample || !yearParam
    }
  );

  const programmingPlan = useMemo(
    () => sampleProgrammingPlan || yearProgrammingPlans?.[0],
    [sampleProgrammingPlan, yearProgrammingPlans]
  );

  const { data: laboratories } = apiClient.useFindLaboratoriesQuery(
    {
      programmingPlanIds: toArray(partialSample?.programmingPlanId)
    },
    {
      skip: (partialSample?.items ?? []).length === 0
    }
  );

  const { data: programmingPlanPrescriptions } =
    apiClient.useFindPrescriptionsQuery(
      {
        programmingPlanId: programmingPlan?.id as string
      },
      {
        skip: !programmingPlan
      }
    );

  const { data: programmingPlanLocalPrescriptionsData } =
    apiClient.useFindLocalPrescriptionsQuery(
      {
        programmingPlanId: programmingPlan?.id as string
      },
      {
        skip: !programmingPlan
      }
    );

  const programmingPlanLocalPrescriptions = useMemo(
    () =>
      programmingPlanLocalPrescriptionsData
        ?.filter(
          (localPrescription) =>
            localPrescription.region ===
            (isCreatedPartialSample(partialSample)
              ? partialSample.region
              : user?.region)
        )
        .filter((localPrescription) =>
          programmingPlan?.distributionKind === 'SLAUGHTERHOUSE'
            ? localPrescription.department ===
                (isCreatedPartialSample(partialSample)
                  ? partialSample.department
                  : user?.department) &&
              (isCreatedPartialSample(partialSample)
                ? localPrescription.companySiret ===
                  partialSample?.company?.siret
                : user?.companies.some(
                    (company) =>
                      company.siret === localPrescription.companySiret
                  ))
            : true
        ),
    [
      programmingPlanLocalPrescriptionsData,
      partialSample,
      user,
      programmingPlan
    ]
  );

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
    programmingPlan,
    programmingPlanPrescriptions,
    programmingPlanLocalPrescriptions,
    getSampleItemLaboratory
  };
};
