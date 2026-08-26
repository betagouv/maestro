import { groupBy } from 'lodash-es';
import type { Department } from 'maestro-shared/referential/Department';
import { DepartmentSort } from 'maestro-shared/referential/Department';
import {
  type Region,
  RegionList,
  Regions
} from 'maestro-shared/referential/Region';
import type { DisplayStatusResult } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDisplayStatus';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useContext, useMemo } from 'react';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { ApiClientContext } from '../../../services/apiClient';
import {
  type AggregateDisplayStatus,
  buildAggregateDisplayStatus,
  buildEchelonDisplayStatus
} from './ProgrammingPlanTrackingTable.utils';

export const sortedDepartments = (region: Region) =>
  [...Regions[region].departments].sort(DepartmentSort);

interface PlanStatusInfo {
  nationalDisplayStatus: DisplayStatusResult;
  regionalDisplayStatus: DisplayStatusResult | undefined;
  departmentalDisplayStatus: DisplayStatusResult | undefined;
  isEligible: boolean;
  regionalAggregate: AggregateDisplayStatus;
  departmentalAggregate: AggregateDisplayStatus | undefined;
  isFinalized: boolean;
}

export const useProgrammingPlanTrackingStatus = (
  programmingPlans: ProgrammingPlanChecked[],
  region?: Region,
  department?: Department
) => {
  const apiClient = useContext(ApiClientContext);
  const { hasRole } = useAuthentication();
  const viewerOwnsNationalRow = hasRole(
    'NationalCoordinator',
    'NationalObserver'
  );

  const planIds = useMemo(
    () => programmingPlans.map((plan) => plan.id),
    [programmingPlans]
  );

  const { data: prescriptions } = apiClient.useFindPrescriptionsQuery(
    { programmingPlanIds: planIds },
    { skip: planIds.length === 0 }
  );
  const hasSlaughterhousePlan = programmingPlans.some(
    (plan) => plan.distributionKind === 'SLAUGHTERHOUSE'
  );

  const { data: localPrescriptions } = apiClient.useFindLocalPrescriptionsQuery(
    {
      programmingPlanIds: planIds,
      allLevels: true,
      includeCompanies: hasSlaughterhousePlan
    },
    { skip: planIds.length === 0 }
  );

  const prescriptionsByPlan = useMemo(
    () => groupBy(prescriptions ?? [], 'programmingPlanId'),
    [prescriptions]
  );
  const localPrescriptionsByPrescription = useMemo(
    () => groupBy(localPrescriptions ?? [], 'prescriptionId'),
    [localPrescriptions]
  );

  const planStatusInfo = useMemo(() => {
    const map = new Map<string, PlanStatusInfo>();
    for (const plan of programmingPlans) {
      const planPrescriptions = prescriptionsByPlan[plan.id] ?? [];
      const planLocalPrescriptions = planPrescriptions.flatMap(
        (_) => localPrescriptionsByPrescription[_.id] ?? []
      );
      const nationalDisplayStatus = buildEchelonDisplayStatus(
        plan,
        planPrescriptions,
        planLocalPrescriptions,
        'National',
        undefined,
        undefined,
        viewerOwnsNationalRow
      );

      const regionalDisplayStatus = region
        ? buildEchelonDisplayStatus(
            plan,
            planPrescriptions,
            planLocalPrescriptions,
            'Regional',
            region
          )
        : undefined;

      const regionalAggregate = buildAggregateDisplayStatus(
        RegionList.map((regionColumn) =>
          buildEchelonDisplayStatus(
            plan,
            planPrescriptions,
            planLocalPrescriptions,
            'Regional',
            regionColumn
          )
        )
      );

      const departmentalDisplayStatus =
        department && plan.distributionKind === 'SLAUGHTERHOUSE'
          ? buildEchelonDisplayStatus(
              plan,
              planPrescriptions,
              planLocalPrescriptions,
              'Departmental',
              region,
              department
            )
          : undefined;

      const departmentalAggregate =
        !department && plan.distributionKind === 'SLAUGHTERHOUSE'
          ? buildAggregateDisplayStatus(
              (region ? [region] : RegionList).flatMap((regionColumn) =>
                sortedDepartments(regionColumn).map((departmentColumn) =>
                  buildEchelonDisplayStatus(
                    plan,
                    planPrescriptions,
                    planLocalPrescriptions,
                    'Departmental',
                    regionColumn,
                    departmentColumn
                  )
                )
              )
            )
          : undefined;

      const deepestAggregate = departmentalAggregate ?? regionalAggregate;

      const isSubmittedToAdmin =
        plan.nationalStatus.status === 'SubmittedToAdmin';
      const isEligible = department
        ? departmentalDisplayStatus?.value === 'ReadyToSend'
        : region
          ? regionalDisplayStatus?.value === 'ReadyToSend'
          : hasRole('AdministratorBGIR')
            ? isSubmittedToAdmin
            : nationalDisplayStatus.value === 'ReadyToSend';

      map.set(plan.id, {
        nationalDisplayStatus,
        regionalDisplayStatus,
        departmentalDisplayStatus,
        isEligible,
        regionalAggregate,
        departmentalAggregate,
        isFinalized: department
          ? departmentalDisplayStatus?.value === 'Submitted'
          : deepestAggregate.value === 'Submitted'
      });
    }
    return map;
  }, [
    programmingPlans,
    prescriptionsByPlan,
    localPrescriptionsByPrescription,
    hasRole,
    region,
    department,
    viewerOwnsNationalRow
  ]);

  const readyToSendPlans = useMemo(
    () =>
      programmingPlans.filter(
        (plan) => planStatusInfo.get(plan.id)?.isEligible
      ),
    [programmingPlans, planStatusInfo]
  );

  const indicators = useMemo(
    () => ({
      totalCount: programmingPlans.length,
      finalizedCount: programmingPlans.filter(
        (plan) => planStatusInfo.get(plan.id)?.isFinalized
      ).length,
      submittedCount: programmingPlans.filter(
        (plan) =>
          planStatusInfo.get(plan.id)?.nationalDisplayStatus.value ===
          'Submitted'
      ).length,
      readyToSendCount: readyToSendPlans.length
    }),
    [programmingPlans, planStatusInfo, readyToSendPlans]
  );

  return {
    planStatusInfo,
    indicators,
    readyToSendPlans,
    prescriptionsByPlan,
    localPrescriptionsByPrescription
  };
};
