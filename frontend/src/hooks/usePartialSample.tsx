import {
  isCreatedPartialSample,
  type PartialSample,
  type PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { toArray } from 'maestro-shared/utils/utils';
import { useCallback, useContext, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { ApiClientContext } from '../services/apiClient';
import { useAuthentication } from './useAuthentication';

export const usePartialSample = (
  partialSample?: PartialSample | PartialSampleToCreate
) => {
  const apiClient = useContext(ApiClientContext);
  const { hasUserPermission, user } = useAuthentication();
  const { year: yearParam } = useParams<{ year: string }>();
  const [searchParams] = useSearchParams();
  const isEditing = searchParams.get('isEditing') === 'true';

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

  const programmingSubPlan = useMemo(
    () =>
      programmingPlan?.subPlans?.find(
        (sp) => sp.id === partialSample?.programmingSubPlanId
      ),
    [programmingPlan, partialSample]
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

  const canEdit = useMemo(() => {
    if (!isCreatedPartialSample(partialSample)) {
      return false;
    }
    if (!hasUserPermission('updateSample')) {
      return false;
    }
    if (partialSample.region !== user?.region) {
      return false;
    }
    const isSamplerOrAdditionalSampler =
      user?.id === partialSample.sampler.id ||
      user?.id === partialSample.additionalSampler?.id;
    return !isSamplerOrAdditionalSampler;
  }, [hasUserPermission, partialSample, user?.region, user?.id]);

  const readonly = useMemo(() => {
    if (!hasUserPermission('updateSample')) {
      return true;
    }
    if (
      isCreatedPartialSample(partialSample) &&
      partialSample.region !== user?.region
    ) {
      return true;
    }
    if (!isCreatedPartialSample(partialSample)) {
      return false;
    }
    if (isCreatedPartialSample(partialSample)) {
      const isSamplerOrAdditionalSampler =
        user?.id === partialSample.sampler.id ||
        user?.id === partialSample.additionalSampler?.id;
      if (isSamplerOrAdditionalSampler) {
        return false;
      }
    }
    return !isEditing;
  }, [hasUserPermission, partialSample, user?.region, user?.id, isEditing]);

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
    canEdit,
    readonly,
    programmingPlan,
    programmingSubPlan,
    programmingPlanPrescriptions,
    programmingPlanLocalPrescriptions,
    getSampleItemLaboratory
  };
};
