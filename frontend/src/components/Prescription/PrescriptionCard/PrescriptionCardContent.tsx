import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { ReactNode } from 'react';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import PrescriptionStages from 'src/components/Prescription/PrescriptionStages/PrescriptionStages';
import PrescriptionSubstancesSummary from 'src/components/Prescription/PrescriptionSubstances/PrescriptionSubstancesSummary';
import './PrescriptionCard.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
  subtitle?: ReactNode;
}

const PrescriptionCardContent = ({
  programmingPlan,
  prescription,
  subtitle,
}: Props) => {
  return (
    <div>
      <h3 className={cx('fr-card__title')}>
        {MatrixLabels[prescription.matrix]}
      </h3>
      {subtitle}
      <div className={cx('fr-card__desc')}>
        <PrescriptionSubstancesSummary
          programmingPlan={programmingPlan}
          prescription={prescription}
        />
        <hr className={cx('fr-my-1w')} />
        <PrescriptionStages
          programmingPlan={programmingPlan}
          prescription={prescription}
          label="Stades de prélèvement"
        />
      </div>
    </div>
  );
};

export default PrescriptionCardContent;
