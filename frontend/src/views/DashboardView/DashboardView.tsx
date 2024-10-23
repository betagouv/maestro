import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { isAfter } from 'date-fns';
import { default as _ } from 'lodash';
import { Regions } from 'shared/referential/Region';
import { ContextList } from 'shared/schema/ProgrammingPlan/Context';
import { programmingPlanLabel } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import dashboard from 'src/assets/illustrations/dashboard.svg';
import SampleTable from 'src/components/SampleTable/SampleTable';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useOnLine } from 'src/hooks/useOnLine';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import {
  useCreateProgrammingPlanMutation,
  useGetProgrammingPlanByYearQuery,
  useUpdateProgrammingPlanMutation,
} from 'src/services/programming-plan.service';
import { useFindSamplesQuery } from 'src/services/sample.service';
import settingsSlice from 'src/store/reducers/settingsSlice';
import ProgrammingPlanCard from 'src/views/DashboardView/ProgrammingPlanCard';
const DashboardView = () => {
  const dispatch = useAppDispatch();
  const { hasPermission, userInfos } = useAuthentication();
  const { isOnline } = useOnLine();

  const { programmingPlan } = useAppSelector((state) => state.settings);
  const { pendingSamples } = useAppSelector((state) => state.samples);

  useDocumentTitle(programmingPlan && programmingPlanLabel(programmingPlan));

  const { data: nextProgrammingPlan } = useGetProgrammingPlanByYearQuery(
    new Date().getFullYear() + 1
  );
  const [createProgrammingPlan] = useCreateProgrammingPlanMutation();
  const [updateProgrammingPlan] = useUpdateProgrammingPlanMutation();

  const { data } = useFindSamplesQuery(
    {
      programmingPlanId: programmingPlan?.id as string,
      page: 1,
      perPage: 5,
    },
    { skip: !programmingPlan }
  );
  const samples = _.unionBy(
    Object.values(pendingSamples),
    data ?? [],
    (_) => _.id
  ).sort((s1, s2) => (isAfter(s2.sampledAt, s1.sampledAt) ? 1 : -1));

  if (!userInfos || !programmingPlan) {
    return <></>;
  }

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <div>
        <div
          className={cx(
            'fr-text--sm',
            'fr-text--bold',
            'fr-hint-text',
            'fr-px-2w'
          )}
        >
          Espace de {userInfos.firstName} {userInfos.lastName}
          {userInfos.region && <> - Région {Regions[userInfos.region].name}</>}
        </div>
        <SectionHeader
          title="Tableau de bord"
          subtitle="Un rapide coup d’oeil sur votre activité"
          illustration={dashboard}
          action={
            <>
              {hasPermission('createSample') && (
                <Button
                  size="large"
                  linkProps={{
                    to: '/prelevements/nouveau',
                    target: '_self',
                  }}
                  iconId="fr-icon-microscope-line"
                >
                  Saisir un prélèvement
                </Button>
              )}
            </>
          }
        />
      </div>

      {hasPermission('manageProgrammingPlan') && (
        <>
          {!nextProgrammingPlan && (
            <Alert
              severity="info"
              title={`Programmation ${new Date().getFullYear() + 1}`}
              className="white-container"
              description={
                <>
                  <p>
                    Le plan de programmation pour l'année{' '}
                    {new Date().getFullYear() + 1} n'a pas encore été créé.
                  </p>
                  <Button
                    priority="secondary"
                    iconId={'fr-icon-arrow-right-line'}
                    iconPosition="right"
                    onClick={async () => {
                      await createProgrammingPlan(new Date().getFullYear() + 1)
                        .unwrap()
                        .then((newProgrammingPlan) => {
                          dispatch(
                            settingsSlice.actions.changeProgrammingPlan(
                              newProgrammingPlan
                            )
                          );
                        });
                    }}
                  >
                    Créer la programmation
                  </Button>
                </>
              }
            ></Alert>
          )}
          {nextProgrammingPlan &&
            nextProgrammingPlan.status === 'InProgress' && (
              <Alert
                severity="success"
                title={`Programmation ${new Date().getFullYear() + 1}`}
                className="white-container"
                description={
                  <>
                    <p>
                      Le plan de programmation pour l'année{' '}
                      {new Date().getFullYear() + 1} est en cours de saisie et
                      non consultable par les régions.
                      <br />
                      Vous pouvez continuer la programmation en cours ci-dessous
                      avant de la soumettre aux régions.
                    </p>
                    <Button
                      priority="secondary"
                      iconId={'fr-icon-arrow-right-line'}
                      iconPosition="right"
                      onClick={async () => {
                        await updateProgrammingPlan({
                          programmingPlanId: nextProgrammingPlan.id,
                          programmingPlanUpdate: {
                            status: 'Submitted',
                          },
                        })
                          .unwrap()
                          .then((newProgrammingPlan) => {
                            dispatch(
                              settingsSlice.actions.changeProgrammingPlan(
                                newProgrammingPlan
                              )
                            );
                          });
                      }}
                    >
                      Soumettre la programmation aux régions
                    </Button>
                  </>
                }
              ></Alert>
            )}
          {nextProgrammingPlan &&
            nextProgrammingPlan.status === 'Submitted' && (
              <Alert
                severity="success"
                title={`Programmation ${new Date().getFullYear() + 1}`}
                className="white-container"
                description={
                  <>
                    <p>
                      Le plan de programmation pour l'année{' '}
                      {new Date().getFullYear() + 1} a été soumis aux régions.
                      <br />
                      Vous pouvez le modifier en accord avec leurs retours avant
                      de le figer pour lancer la campagne de prélevements. avant
                      de la soumettre aux régions.
                    </p>
                    <Button
                      priority="secondary"
                      iconId={'fr-icon-arrow-right-line'}
                      iconPosition="right"
                      onClick={async () => {
                        await updateProgrammingPlan({
                          programmingPlanId: nextProgrammingPlan.id,
                          programmingPlanUpdate: {
                            status: 'Validated',
                          },
                        })
                          .unwrap()
                          .then((newProgrammingPlan) => {
                            dispatch(
                              settingsSlice.actions.changeProgrammingPlan(
                                newProgrammingPlan
                              )
                            );
                          });
                      }}
                    >
                      Lancer la campagne de prélèvements
                    </Button>
                  </>
                }
              ></Alert>
            )}
        </>
      )}

      {isOnline && (
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          {ContextList.map((context) => (
            <div
              className={cx('fr-col-12', 'fr-col-md-6')}
              key={`${programmingPlan.id}-${context}`}
            >
              <ProgrammingPlanCard
                programmingPlan={programmingPlan}
                context={context}
              />
            </div>
          ))}
        </div>
      )}

      {programmingPlan.status === 'Validated' && (
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
                    to: '/prelevements',
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
