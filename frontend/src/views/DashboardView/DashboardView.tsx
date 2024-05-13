import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { ProgrammingPlanStatusLabels } from 'shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useAppSelector } from 'src/hooks/useStore';
import { useFindProgrammingPlansQuery } from 'src/services/programming-plan.service';
import ProgrammingPlanCard from 'src/views/DashboardView/ProgrammingPlanCard';

const DashboardView = () => {
  const { hasPermission } = useAuthentication();

  const { programmingPlanStatus } = useAppSelector((state) => state.settings);
  const { data: programmingPlans } = useFindProgrammingPlansQuery(
    { status: programmingPlanStatus },
    { skip: !programmingPlanStatus }
  );

  useDocumentTitle(ProgrammingPlanStatusLabels[programmingPlanStatus]);

  if (!programmingPlans) {
    return <></>;
  }

  return (
    <>
      {hasPermission('createSample') && (
        <div className={cx('fr-pt-6w')} style={{ textAlign: 'center' }}>
          <Button
            size="large"
            linkProps={{
              to: '/prelevements/nouveau',
              target: '_self',
            }}
          >
            Ajouter un prélèvement
          </Button>
        </div>
      )}
      <section className={cx('fr-py-6w')}>
        <h1>{ProgrammingPlanStatusLabels[programmingPlanStatus]}</h1>
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
    </>
  );
};

export default DashboardView;
