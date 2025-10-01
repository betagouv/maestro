import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { uniq } from 'lodash-es';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlanKindLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
}

const PrescriptionBreadcrumb = ({ programmingPlan, prescription }: Props) => {
  return (
    <div className={cx('fr-breadcrumb', 'fr-mt-0', 'fr-mb-1w')}>
      <ol className={cx('fr-breadcrumb__list')}>
        {uniq([
          programmingPlan.title,
          ProgrammingPlanKindLabels[prescription.programmingPlanKind]
        ]).map((part, idx) => (
          <li key={idx}>
            <span
              className={cx('fr-text--xs', 'fr-text--regular')}
              style={{
                verticalAlign: '3px'
              }}
            >
              {part}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default PrescriptionBreadcrumb;
