import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { ProgrammingPlanStatusLabels } from 'shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useAppSelector } from 'src/hooks/useStore';
import { useFindProgrammingPlansQuery } from 'src/services/programming-plan.service';
import ProgrammingPlanCard from 'src/views/DashboardView/ProgrammingPlanCard';

const DashboardView = () => {
  const { programmingPlanStatus } = useAppSelector((state) => state.settings);
  const { data: programmingPlans } = useFindProgrammingPlansQuery(
    {
      status: programmingPlanStatus,
    },
    {
      skip: !programmingPlanStatus,
    }
  );

  useDocumentTitle(ProgrammingPlanStatusLabels[programmingPlanStatus]);

  if (!programmingPlans) {
    return <></>;
  }

  return (
    <>
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
