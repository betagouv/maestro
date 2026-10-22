import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { isPPVSubPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type { DashboardTerritoryLevel } from 'maestro-shared/schema/Sample/DashboardStats';
import { useContext, useMemo } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { ApiClientContext } from 'src/services/apiClient';
import type { DashboardFilters } from './DashboardGlobalFilters';

export const useDashboardStats = (
  programmingPlans: ProgrammingPlanChecked[],
  filters: DashboardFilters
) => {
  const apiClient = useContext(ApiClientContext);
  const { user, hasNationalView, hasRegionalView, hasRole } =
    useAuthentication();

  const hasSlaughterhousePlan = useMemo(
    () =>
      programmingPlans.some(
        (plan) => plan.distributionKind === 'SLAUGHTERHOUSE'
      ),
    [programmingPlans]
  );

  const hasNonPPVPlan = useMemo(
    () => programmingPlans.some((plan) => !plan.subPlans.some(isPPVSubPlan)),
    [programmingPlans]
  );

  const territoryLevel = useMemo<DashboardTerritoryLevel | undefined>(() => {
    if (hasNationalView) {
      return 'Region';
    }
    if (!hasNonPPVPlan) {
      return undefined;
    }
    if (hasRegionalView) {
      return filters.departments.length > 0 ? 'Company' : 'Department';
    }
    if (hasRole('DepartmentalCoordinator', 'DepartmentalObserver')) {
      return hasSlaughterhousePlan ? 'Company' : undefined;
    }
    return hasRole('Sampler') && (user?.companies?.length ?? 0) > 1
      ? 'Company'
      : undefined;
  }, [
    hasNationalView,
    hasRegionalView,
    hasRole,
    hasNonPPVPlan,
    hasSlaughterhousePlan,
    filters.departments,
    user?.companies
  ]);

  const programmingSubPlanIds = useMemo(
    () =>
      filters.stages.length === 0
        ? undefined
        : programmingPlans
            .flatMap((plan) => plan.subPlans)
            .filter((subPlan) =>
              (subPlan.stages ?? []).some((stage) =>
                filters.stages.includes(stage)
              )
            )
            .map((subPlan) => subPlan.id),
    [programmingPlans, filters.stages]
  );

  const programmingPlanIds = useMemo(
    () => programmingPlans.map((plan) => plan.id),
    [programmingPlans]
  );

  const { data: stats } = apiClient.useGetDashboardStatsQuery(
    {
      programmingPlanIds,
      programmingSubPlanIds,
      regions: filters.regions.length > 0 ? filters.regions : undefined,
      departments:
        filters.departments.length > 0 ? filters.departments : undefined,
      companySirets:
        filters.companySirets.length > 0 ? filters.companySirets : undefined,
      matrixKinds:
        filters.matrixKinds.length > 0 ? filters.matrixKinds : undefined,
      territoryLevel
    },
    { skip: programmingPlanIds.length === 0 }
  );

  return { stats, territoryLevel };
};
