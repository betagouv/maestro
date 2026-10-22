import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import { isNil, max, uniq } from 'lodash-es';
import {
  hasNewerLaunchedCampaign,
  type ProgrammingPlanChecked,
  ProgrammingPlanSort
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useContext, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import dashboard from 'src/assets/illustrations/dashboard.svg';
import { AppPage } from 'src/components/_app/AppPage/AppPage';
import { DashboardNotice } from 'src/components/DashboardNotice/DashboardNotice';
import { YearTitle } from 'src/components/YearTitle/YearTitle';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { AuthenticatedAppRoutes } from '../../AppRoutes';
import { ApiClientContext } from '../../services/apiClient';
import DashboardGlobalFilters, {
  type DashboardFilters,
  emptyDashboardFilters
} from './GlobalView/DashboardGlobalFilters';
import DashboardKpiCards from './GlobalView/DashboardKpiCards';
import DashboardLaboratoryShipments from './GlobalView/DashboardLaboratoryShipments';
import DashboardPlansProgress from './GlobalView/DashboardPlansProgress';
import DashboardTerritoryChart from './GlobalView/DashboardTerritoryChart';
import { useDashboardStats } from './GlobalView/useDashboardStats';

const DashboardView = () => {
  const apiClient = useContext(ApiClientContext);
  const { hasUserPermission, user, hasRole } = useAuthentication();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: programmingPlans } = apiClient.useFindProgrammingPlansQuery(
    {
      status: ['Validated', 'Closed'],
      scope: 'owned'
    },
    {
      skip:
        !user?.programmingSubPlans?.length &&
        !hasRole('AdministratorMaestro', 'AdministratorBGIR')
    }
  );

  const { data: programmingPlanDomains } =
    apiClient.useFindProgrammingPlanDomainsQuery();

  const { data: notice } = apiClient.useGetNoticeQuery({ type: 'dashboard' });

  const domainLabelById = useMemo(
    () =>
      new Map(
        (programmingPlanDomains ?? []).map(({ id, label }) => [id, label])
      ),
    [programmingPlanDomains]
  );

  const years = useMemo(
    () =>
      uniq((programmingPlans ?? []).map((plan) => plan.year)).sort(
        (a, b) => b - a
      ),
    [programmingPlans]
  );

  const year = useMemo(() => {
    const yearParam = searchParams.get('year');
    if (yearParam && years.includes(Number(yearParam))) {
      return Number(yearParam);
    }
    const currentYear = new Date().getFullYear();
    return years.includes(currentYear) ? currentYear : max(years);
  }, [searchParams, years]);

  const [filters, setFilters] = useState<DashboardFilters>(
    emptyDashboardFilters
  );

  const yearProgrammingPlans = useMemo(
    () =>
      (programmingPlans ?? [])
        .filter((plan) => plan.year === year)
        .sort(ProgrammingPlanSort),
    [programmingPlans, year]
  );

  const currentProgrammingPlan: ProgrammingPlanChecked | undefined =
    yearProgrammingPlans[0];

  const filteredProgrammingPlans = useMemo(
    () =>
      yearProgrammingPlans
        .filter(
          (plan) =>
            filters.programmingPlanDomainIds.length === 0 ||
            filters.programmingPlanDomainIds.includes(plan.domainId)
        )
        .filter(
          (plan) =>
            filters.programmingPlanIds.length === 0 ||
            filters.programmingPlanIds.includes(plan.id)
        )
        .filter(
          (plan) =>
            filters.stages.length === 0 ||
            plan.subPlans.some((subPlan) =>
              (subPlan.stages ?? []).some((stage) =>
                filters.stages.includes(stage)
              )
            )
        ),
    [yearProgrammingPlans, filters]
  );

  const { stats, territoryLevel } = useDashboardStats(
    filteredProgrammingPlans,
    filters
  );

  if (!user) {
    return null;
  }

  return (
    <AppPage
      title={
        <YearTitle
          title="Tableau de bord"
          year={year}
          years={years}
          onChange={(selectedYear) =>
            setSearchParams({ year: String(selectedYear) })
          }
        />
      }
      illustration={dashboard}
      documentTitle="Tableau de bord"
      action={
        currentProgrammingPlan &&
        !hasNewerLaunchedCampaign(
          currentProgrammingPlan,
          programmingPlans ?? [],
          domainLabelById
        ) &&
        hasUserPermission('createSample') && (
          <Button
            size="large"
            linkProps={{
              to: AuthenticatedAppRoutes.NewSampleRoute.link(
                currentProgrammingPlan.year
              ),
              target: '_self'
            }}
            iconId="fr-icon-microscope-line"
          >
            Saisir un prélèvement
          </Button>
        )
      }
    >
      {notice?.description && (
        <DashboardNotice
          description={notice.description}
          className={cx('fr-col')}
          fullWidth
        />
      )}
      <Tabs
        tabs={[
          {
            label: 'Vue globale',
            content: (
              <>
                <DashboardGlobalFilters
                  programmingPlans={yearProgrammingPlans}
                  filters={filters}
                  onChange={(changes) =>
                    setFilters((previous) => ({ ...previous, ...changes }))
                  }
                />
                <DashboardKpiCards stats={stats} />
                <div
                  className={cx(
                    'fr-grid-row',
                    'fr-grid-row--gutters',
                    'fr-mb-3w'
                  )}
                >
                  {territoryLevel && (
                    <div className={cx('fr-col-12', 'fr-col-lg-6')}>
                      <DashboardTerritoryChart
                        stats={stats}
                        territoryLevel={territoryLevel}
                      />
                    </div>
                  )}
                  <div
                    className={cx(
                      'fr-col-12',
                      territoryLevel ? 'fr-col-lg-6' : 'fr-col-lg-12'
                    )}
                  >
                    <DashboardLaboratoryShipments stats={stats} />
                  </div>
                </div>
                {!isNil(year) && (
                  <DashboardPlansProgress
                    year={year}
                    programmingPlans={filteredProgrammingPlans}
                    filters={filters}
                  />
                )}
              </>
            )
          }
        ]}
      />
    </AppPage>
  );
};

export default DashboardView;
