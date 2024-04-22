import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import { format } from 'date-fns';
import { t } from 'i18next';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useFindProgrammingPlansQuery } from 'src/services/programming-plan.service';

const ProgrammingPlanListView = () => {
  useDocumentTitle('Liste des plans programmés');

  const { data: programmingPlans } = useFindProgrammingPlansQuery();

  return (
    <section className={cx('fr-py-6w')}>
      <h1>Liste des plans programmés</h1>
      <div className={cx('fr-mb-4w')}>
        {t('programmingPlan', { count: programmingPlans?.length || 0 })}
      </div>
      {programmingPlans && programmingPlans.length > 0 && (
        <Table
          noCaption
          headers={['Plan', 'Date de création', '']}
          data={programmingPlans.map((programmingPlan) => [
            programmingPlan.title,
            format(programmingPlan.createdAt, 'dd/MM/yyyy'),
            <Button
              priority="tertiary no outline"
              linkProps={{ to: `/plans/${programmingPlan.id}/prescription` }}
              children="Prescription"
              iconId="fr-icon-arrow-right-line"
              iconPosition="right"
            />,
          ])}
        />
      )}
    </section>
  );
};

export default ProgrammingPlanListView;
