import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { useContext, useMemo } from 'react';
import dashboard from 'src/assets/illustrations/dashboard.svg';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useOnLine } from 'src/hooks/useOnLine';
import ProgrammingPlanCard from 'src/views/DashboardView/ProgrammingPlanCard';
import { AuthenticatedAppRoutes } from '../../AppRoutes';
import { DashboardNotice } from '../../components/DashboardNotice/DashboardNotice';
import { ApiClientContext } from '../../services/apiClient';
import DashboardPrescriptions from './DashboardPrescriptions';
import DashboardPriorityActions from './DashboardPriorityActions';

const DashboardView = () => {
  useDocumentTitle('Tableau de bord');
  const apiClient = useContext(ApiClientContext);
  const { hasUserPermission, user, hasNationalView } = useAuthentication();
  const { isOnline } = useOnLine();

  const { data: programmingPlans } = apiClient.useFindProgrammingPlansQuery(
    {
      kinds: user?.programmingPlanKinds
    },
    {
      skip: !user?.programmingPlanKinds
    }
  );

  const sortedProgrammingPlans = useMemo(
    () =>
      programmingPlans
        ? [...programmingPlans].sort((a, b) => b.year - a.year)
        : [],
    [programmingPlans]
  );

  const currentProgrammingPlan = useMemo(
    () =>
      sortedProgrammingPlans.filter(
        (pp) => pp.year <= new Date().getFullYear()
      )[0],
    [sortedProgrammingPlans]
  );

  const previousProgrammingPlan = useMemo(
    () =>
      currentProgrammingPlan && hasUserPermission('manageProgrammingPlan')
        ? sortedProgrammingPlans.filter(
            (pp) => pp.year < currentProgrammingPlan.year
          )[0]
        : undefined,
    [currentProgrammingPlan, sortedProgrammingPlans, hasUserPermission]
  );

  const { data: notice } = apiClient.useGetDashboardNoticeQuery();

  const { data: nextProgrammingPlans } = apiClient.useFindProgrammingPlansQuery(
    {
      status: hasUserPermission('manageProgrammingPlan')
        ? ['InProgress', 'SubmittedToRegion']
        : hasUserPermission('distributePrescriptionToDepartments')
          ? ['SubmittedToRegion']
          : hasUserPermission('distributePrescriptionToSlaughterhouses')
            ? ['SubmittedToDepartments']
            : []
    },
    {
      skip:
        !hasUserPermission('manageProgrammingPlan') &&
        !hasUserPermission('distributePrescriptionToDepartments') &&
        !hasUserPermission('distributePrescriptionToSlaughterhouses')
    }
  );
  const nextProgrammingPlan = useMemo(
    () => nextProgrammingPlans?.[0],
    [nextProgrammingPlans]
  );

  if (!user) {
    return <></>;
  }

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <SectionHeader
        title="Tableau de bord"
        subtitle="Un rapide coup d’oeil sur votre activité"
        illustration={dashboard}
        action={
          currentProgrammingPlan &&
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
      />
      {isOnline && (
        <div className={clsx(cx('fr-grid-row', 'fr-grid-row--gutters'))}>
          {notice?.description && (
            <DashboardNotice
              description={notice.description}
              className={clsx(cx('fr-col-12', 'fr-col-sm-6'), 'd-flex-column')}
            />
          )}

          <DashboardPriorityActions
            className={clsx(cx('fr-col-12', 'fr-col-sm-6'))}
            currentProgrammingPlan={currentProgrammingPlan}
            previousProgrammingPlan={previousProgrammingPlan}
            nextProgrammingPlan={nextProgrammingPlan}
          />

          {hasNationalView &&
            currentProgrammingPlan?.contexts.map((context) => (
              <div
                className={cx('fr-col-12', 'fr-col-md-6')}
                key={`${currentProgrammingPlan.id}-${context}`}
              >
                <ProgrammingPlanCard
                  programmingPlan={currentProgrammingPlan}
                  context={context}
                />
              </div>
            ))}

          {currentProgrammingPlan && (
            <DashboardPrescriptions
              programmingPlan={currentProgrammingPlan}
              className={clsx(cx('fr-col-12'))}
            />
          )}
        </div>
      )}
    </section>
  );
};

export default DashboardView;
