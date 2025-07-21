import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tile from '@codegouvfr/react-dsfr/Tile';
import clsx from 'clsx';
import { isAfter } from 'date-fns';
import { unionBy } from 'lodash-es';
import { isClosed } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useContext, useMemo } from 'react';
import dashboard from 'src/assets/illustrations/dashboard.svg';
import SampleTable from 'src/components/SampleTable/SampleTable';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useOnLine } from 'src/hooks/useOnLine';
import { useAppSelector } from 'src/hooks/useStore';
import ProgrammingPlanCard from 'src/views/DashboardView/ProgrammingPlanCard';
import { AuthenticatedAppRoutes } from '../../AppRoutes';
import useWindowSize from '../../hooks/useWindowSize';
import { ApiClientContext } from '../../services/apiClient';
import ProgrammingPlanClosing from './ProgrammingPlanClosing';

const DashboardView = () => {
  const apiClient = useContext(ApiClientContext);
  const { hasUserPermission, user } = useAuthentication();
  const { isOnline } = useOnLine();
  const { isMobile } = useWindowSize();

  const { data: programmingPlan, isLoading: isProgrammingPlanLoading } =
    apiClient.useGetProgrammingPlanByYearQuery(new Date().getFullYear());
  const { data: previousProgrammingPlan } =
    apiClient.useGetProgrammingPlanByYearQuery(new Date().getFullYear() - 1, {
      skip:
        !hasUserPermission('manageProgrammingPlan') &&
        (isProgrammingPlanLoading || programmingPlan !== undefined)
    });

  const currentProgrammingPlan = useMemo(
    () => programmingPlan ?? previousProgrammingPlan,
    [programmingPlan, previousProgrammingPlan]
  );

  const [createProgrammingPlan] = apiClient.useCreateProgrammingPlanMutation();
  const { pendingSamples } = useAppSelector((state) => state.samples);

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

  const { data } = apiClient.useFindSamplesQuery(
    {
      programmingPlanId: currentProgrammingPlan?.id as string,
      page: 1,
      perPage: 5
    },
    { skip: !currentProgrammingPlan }
  );
  const samples = unionBy(
    Object.values(pendingSamples),
    data ?? [],
    (_) => _.id
  ).sort((s1, s2) =>
    isAfter(s2.sampledAt ?? new Date(), s1.sampledAt ?? new Date()) ? 1 : -1
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
      {hasUserPermission('manageProgrammingPlan') &&
        previousProgrammingPlan &&
        previousProgrammingPlan.id !== currentProgrammingPlan?.id &&
        !isClosed(previousProgrammingPlan) && (
          <ProgrammingPlanClosing programmingPlan={previousProgrammingPlan} />
        )}

      {isOnline && (
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
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

      {!isMobile &&
        currentProgrammingPlan.regionalStatus.some(
          (_) => _.status === 'Validated'
        ) && (
          <div className={clsx('white-container', cx('fr-px-5w', 'fr-py-3w'))}>
            <div className={clsx(cx('fr-my-2w'), 'table-header')}>
              <h4 className={cx('fr-mb-0')}>Vos derniers prélèvements</h4>
            </div>
            <SampleTable
              samples={samples ?? []}
              tableFooter={
                isOnline && (
                  <Button
                    priority="secondary"
                    iconId={'fr-icon-arrow-right-line'}
                    iconPosition="right"
                    linkProps={{
                      to: AuthenticatedAppRoutes.SamplesByYearRoute.link(
                        currentProgrammingPlan.year
                      )
                    }}
                  >
                    Tous les prélèvements
                  </Button>
                )
              }
            />
          </div>
        )}
    </section>
  );
};

export default DashboardView;
