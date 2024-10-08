import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { isAfter } from 'date-fns';
import { default as _ } from 'lodash';
import { Regions } from 'shared/referential/Region';
import { ProgrammingPlanStatusLabels } from 'shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import dashboard from 'src/assets/illustrations/dashboard.svg';
import SampleTable from 'src/components/SampleTable/SampleTable';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useOnLine } from 'src/hooks/useOnLine';
import { useAppSelector } from 'src/hooks/useStore';
import { useFindProgrammingPlansQuery } from 'src/services/programming-plan.service';
import { useFindSamplesQuery } from 'src/services/sample.service';
import ProgrammingPlanCard from 'src/views/DashboardView/ProgrammingPlanCard';
const DashboardView = () => {
  const { hasPermission, userInfos } = useAuthentication();
  const { isOnline } = useOnLine();

  const { programmingPlanStatus } = useAppSelector((state) => state.settings);
  const { data: programmingPlans } = useFindProgrammingPlansQuery(
    { status: programmingPlanStatus },
    { skip: !programmingPlanStatus }
  );

  const { pendingSamples } = useAppSelector((state) => state.samples);
  const { data } = useFindSamplesQuery({
    page: 1,
    perPage: 5,
  });
  const samples = _.unionBy(
    Object.values(pendingSamples),
    data ?? [],
    (_) => _.id
  ).sort((s1, s2) => (isAfter(s2.sampledAt, s1.sampledAt) ? 1 : -1));

  useDocumentTitle(ProgrammingPlanStatusLabels[programmingPlanStatus]);

  if (!userInfos || !programmingPlans) {
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

      {isOnline && (
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          {programmingPlans.map((programmingPlan) => (
            <div
              className={cx('fr-col-12', 'fr-col-md-6')}
              key={programmingPlan.id}
            >
              <ProgrammingPlanCard programmingPlan={programmingPlan} />
            </div>
          ))}
        </div>
      )}

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
    </section>
  );
};

export default DashboardView;
