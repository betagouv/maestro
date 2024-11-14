import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { ReactNode } from 'react';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { StageLabels } from 'shared/referential/Stage';
import { PrescriptionByMatrix } from 'shared/schema/Prescription/PrescriptionsByMatrix';
import './PrescriptionCard.scss';

interface Props {
  prescriptionByMatrix: PrescriptionByMatrix;
  subtitle?: ReactNode;
}

const PrescriptionCardContent = ({ prescriptionByMatrix, subtitle }: Props) => {
  return (
    <div>
      <h3 className={cx('fr-card__title')}>
        {MatrixLabels[prescriptionByMatrix.matrix]}
      </h3>
      {subtitle}
      <div className={cx('fr-card__desc')}>
        <div className={cx('fr-text--md', 'fr-mb-0')}>
          Stades de prélèvement
        </div>
        {prescriptionByMatrix.stages.map((stage) => (
          <Tag
            key={`prescription_${prescriptionByMatrix.matrix}_stage_${stage}`}
            dismissible
            nativeButtonProps={{
              onClick: function noRefCheck() {},
            }}
          >
            {StageLabels[stage]}
          </Tag>
        ))}
      </div>
    </div>
  );
};

export default PrescriptionCardContent;
