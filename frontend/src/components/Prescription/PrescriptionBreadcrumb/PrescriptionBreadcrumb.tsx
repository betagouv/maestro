import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { uniq } from 'lodash-es';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlanDomainLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { ProgrammingPlanKindLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
}

const PrescriptionBreadcrumb = ({ programmingPlan, prescription }: Props) => {
  return (
    <div>
      <ol className={cx('fr-breadcrumb__list')}>
        {uniq([
          ProgrammingPlanDomainLabels[programmingPlan.domain],
          programmingPlan.title,
          ProgrammingPlanKindLabels[prescription.programmingPlanKind],
          MatrixKindLabels[prescription.matrixKind]
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
