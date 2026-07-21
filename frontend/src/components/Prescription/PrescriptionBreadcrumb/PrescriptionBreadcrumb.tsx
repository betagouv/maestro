import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { uniq } from 'lodash-es';
import type { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type { ProgrammingSubPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';

interface Props {
  programmingPlan: ProgrammingPlanChecked;
  programmingSubPlans: ProgrammingSubPlan[];
  prescription: Prescription;
}

const PrescriptionBreadcrumb = ({
  programmingPlan,
  programmingSubPlans,
  prescription
}: Props) => {
  const subPlan = programmingSubPlans.find(
    (sp) => sp.id === prescription.programmingSubPlanId
  );

  return (
    <div className={cx('fr-breadcrumb', 'fr-mt-0', 'fr-mb-1w')}>
      <ol className={cx('fr-breadcrumb__list')}>
        {uniq([programmingPlan.title, subPlan?.label]).map((part, idx) => (
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
