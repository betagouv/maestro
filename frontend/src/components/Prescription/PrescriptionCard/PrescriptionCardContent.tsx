import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { ReactNode } from 'react';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import PrescriptionStages from 'src/components/Prescription/PrescriptionStages/PrescriptionStages';
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
        <PrescriptionStages
          programmingPlan={programmingPlan}
          prescription={prescription}
          label="Stades de prélèvements"
        />
      </div>
    </div>
  );
};

export default PrescriptionCardContent;
