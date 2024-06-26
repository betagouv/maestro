import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { Regions } from 'shared/referential/Region';
import { ProgrammingPlanStatusLabels } from 'shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import dashboard from 'src/assets/illustrations/dashboard.svg';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useAppSelector } from 'src/hooks/useStore';
import { useFindProgrammingPlansQuery } from 'src/services/programming-plan.service';
import ProgrammingPlanCard from 'src/views/DashboardView/ProgrammingPlanCard';
const DashboardView = () => {
  const { hasPermission, userInfos } = useAuthentication();

  const { programmingPlanStatus } = useAppSelector((state) => state.settings);
  const { data: programmingPlans } = useFindProgrammingPlansQuery(
    { status: programmingPlanStatus },
    { skip: !programmingPlanStatus }
  );

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
          {userInfos.region && <> - Région {Regions[userInfos.region].name}</>}
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

      {/*<h3>{ProgrammingPlanStatusLabels[programmingPlanStatus]}</h3>*/}
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
    </section>
  );
};

export default DashboardView;
