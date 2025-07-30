import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tile from '@codegouvfr/react-dsfr/Tile';
import clsx from 'clsx';
import { isClosed } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useContext, useMemo } from 'react';
import dashboard from 'src/assets/illustrations/dashboard.svg';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useOnLine } from 'src/hooks/useOnLine';
import ProgrammingPlanCard from 'src/views/DashboardView/ProgrammingPlanCard';
import { AuthenticatedAppRoutes } from '../../AppRoutes';
import { ApiClientContext } from '../../services/apiClient';
import { DashboardNotice } from './DashboardNotice';
import { DashboardPriorityAction } from './DashboardPriorityAction';
import ProgrammingPlanClosing from './ProgrammingPlanClosing';

const DashboardView = () => {
  const apiClient = useContext(ApiClientContext);
  const { hasUserPermission, user } = useAuthentication();
  const { isOnline } = useOnLine();

  const { data: programmingPlan, isLoading: isProgrammingPlanLoading } =
    apiClient.useGetProgrammingPlanByYearQuery(new Date().getFullYear());
  const { data: previousProgrammingPlan } =
    apiClient.useGetProgrammingPlanByYearQuery(new Date().getFullYear() - 1, {
      skip:
        !hasUserPermission('manageProgrammingPlan') &&
        (isProgrammingPlanLoading || programmingPlan !== undefined)
    });
  const { data: notice } = apiClient.useGetDashboardNoticeQuery();

  const currentProgrammingPlan = useMemo(
    () => programmingPlan ?? previousProgrammingPlan,
    [programmingPlan, previousProgrammingPlan]
  );

  const [createProgrammingPlan] = apiClient.useCreateProgrammingPlanMutation();

  useDocumentTitle('Tableau de bord');

  const { data: nextProgrammingPlans } = apiClient.useFindProgrammingPlansQuery(
    {
      status: ['InProgress', 'Submitted']
    },
    {
      skip: !hasUserPermission('manageProgrammingPlan')
    }
  );
  const nextProgrammingPlan = useMemo(
    () => nextProgrammingPlans?.[0],
    [nextProgrammingPlans]
  );

  if (!user || !currentProgrammingPlan) {
    return <></>;
  }

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <SectionHeader
        title="Tableau de bord"
        subtitle="Un rapide coup d’oeil sur votre activité"
        illustration={dashboard}
        action={
          <>
            {hasUserPermission('createSample') && (
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
            )}
            {hasUserPermission('manageProgrammingPlan') &&
              nextProgrammingPlan && (
                <div>
                  <Tile
                    detail="À compléter"
                    small
                    orientation="horizontal"
                    linkProps={{
                      to: AuthenticatedAppRoutes.ProgrammationByYearRoute.link(
                        nextProgrammingPlan.year
                      )
                    }}
                    start={
                      <Badge
                        noIcon
                        className={cx('fr-badge--yellow-tournesol')}
                      >
                        Programmation {nextProgrammingPlan.year}
                      </Badge>
                    }
                    title="Editer la programmation"
                    titleAs="h3"
                  />
                </div>
              )}
            {hasUserPermission('manageProgrammingPlan') &&
              !nextProgrammingPlan && (
                <div>
                  <Button
                    onClick={async () => {
                      await createProgrammingPlan(
                        new Date().getFullYear() + 1
                      ).unwrap();
                    }}
                  >
                    Créer la programmation {new Date().getFullYear() + 1}
                  </Button>
                </div>
              )}
          </>
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

          {/*FIXME on affiche ça pour qui ?*/}
          <DashboardPriorityAction
            className={clsx(cx('fr-col-12', 'fr-col-sm-6'))}
            programmingPlan={currentProgrammingPlan}
          />

          {hasUserPermission('manageProgrammingPlan') &&
            previousProgrammingPlan &&
            previousProgrammingPlan.id !== currentProgrammingPlan?.id &&
            !isClosed(previousProgrammingPlan) && (
              <ProgrammingPlanClosing
                programmingPlan={previousProgrammingPlan}
              />
            )}

          {currentProgrammingPlan.contexts.map((context) => (
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
        </div>
      )}
    </section>
  );
};

export default DashboardView;
