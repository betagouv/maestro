import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { ProgrammingPlanSort } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
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

  const { data: validatedProgrammingPlans } =
    apiClient.useFindProgrammingPlansQuery(
      {
        kinds: user?.programmingPlanKinds,
        status: ['Validated']
      },
      {
        skip: !user?.programmingPlanKinds.length
      }
    );

  const currentValidatedProgrammingPlan = useMemo(
    () =>
      [...(validatedProgrammingPlans ?? [])]
        .sort(ProgrammingPlanSort)
        .filter((pp) => pp.year <= new Date().getFullYear())[0],
    [validatedProgrammingPlans]
  );

  const { data: notice } = apiClient.useGetDashboardNoticeQuery();

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
          currentValidatedProgrammingPlan &&
          hasUserPermission('createSample') && (
            <Button
              size="large"
              linkProps={{
                to: AuthenticatedAppRoutes.NewSampleRoute.link(
                  currentValidatedProgrammingPlan.year
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
              className={clsx(cx('fr-col'), 'd-flex-column')}
            />
          )}

          <DashboardPriorityActions
            currentValidatedProgrammingPlan={currentValidatedProgrammingPlan}
          />

          {hasNationalView &&
            currentValidatedProgrammingPlan?.contexts.map((context) => (
              <div
                className={cx('fr-col-12', 'fr-col-md-6')}
                key={`${currentValidatedProgrammingPlan.id}-${context}`}
              >
                <ProgrammingPlanCard
                  programmingPlan={currentValidatedProgrammingPlan}
                  context={context}
                />
              </div>
            ))}

          {currentValidatedProgrammingPlan && (
            <DashboardPrescriptions
              programmingPlan={currentValidatedProgrammingPlan}
              className={clsx(cx('fr-col-12'))}
            />
          )}
        </div>
      )}
    </section>
  );
};

export default DashboardView;
