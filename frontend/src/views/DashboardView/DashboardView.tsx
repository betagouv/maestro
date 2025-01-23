import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tile from '@codegouvfr/react-dsfr/Tile';
import clsx from 'clsx';
import { isAfter } from 'date-fns';
import { default as _ } from 'lodash';
import { useMemo } from 'react';
import { Regions } from 'shared/referential/Region';
import { ContextList } from 'shared/schema/ProgrammingPlan/Context';
import dashboard from 'src/assets/illustrations/dashboard.svg';
import SampleTable from 'src/components/SampleTable/SampleTable';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useOnLine } from 'src/hooks/useOnLine';
import { useAppSelector } from 'src/hooks/useStore';
import {
  useCreateProgrammingPlanMutation,
  useFindProgrammingPlansQuery,
  useGetProgrammingPlanByYearQuery
} from 'src/services/programming-plan.service';
import { useFindSamplesQuery } from 'src/services/sample.service';
import ProgrammingPlanCard from 'src/views/DashboardView/ProgrammingPlanCard';
const DashboardView = () => {
  const { hasUserPermission, user } = useAuthentication();
  const { isOnline } = useOnLine();

  const { data: programmingPlan, isLoading: isProgrammingPlanLoading } =
    useGetProgrammingPlanByYearQuery(new Date().getFullYear());
  const { data: previousProgrammingPlan } = useGetProgrammingPlanByYearQuery(
    new Date().getFullYear() - 1,
    { skip: isProgrammingPlanLoading || programmingPlan !== undefined }
  );

  const currentProgrammingPlan = useMemo(
    () => programmingPlan ?? previousProgrammingPlan,
    [programmingPlan, previousProgrammingPlan]
  );

  const [createProgrammingPlan] = useCreateProgrammingPlanMutation();
  const { pendingSamples } = useAppSelector((state) => state.samples);

  useDocumentTitle('Tableau de bord');

  const { data: nextProgrammingPlans } = useFindProgrammingPlansQuery(
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

  const { data } = useFindSamplesQuery(
    {
      programmingPlanId: (currentProgrammingPlan?.id ??
        previousProgrammingPlan?.id) as string,
      page: 1,
      perPage: 5
    },
    { skip: !currentProgrammingPlan }
  );
  const samples = _.unionBy(
    Object.values(pendingSamples),
    data ?? [],
    (_) => _.id
  ).sort((s1, s2) => (isAfter(s2.sampledAt, s1.sampledAt) ? 1 : -1));

  if (!user || !currentProgrammingPlan) {
    return <></>;
  }

  return (
    <section
      className={clsx(cx('fr-container'), 'main-section')}
      style={{ height: '100%', flexGrow: 1 }}
    >
      <div>
        <div
          className={cx(
            'fr-text--sm',
            'fr-text--bold',
            'fr-hint-text',
            'fr-px-2w'
          )}
        >
          Espace de {user.firstName} {user.lastName}
          {user.region && <> - Région {Regions[user.region].name}</>}
        </div>
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
                    to: `/prelevements/${currentProgrammingPlan.year}/nouveau`,
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
                        to: `/prescriptions/${nextProgrammingPlan.year}`
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
      </div>

      {isOnline && (
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          {ContextList.map((context) => (
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

      {currentProgrammingPlan.status === 'Validated' && (
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
                    to: `/prelevements/${currentProgrammingPlan.year}`
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
