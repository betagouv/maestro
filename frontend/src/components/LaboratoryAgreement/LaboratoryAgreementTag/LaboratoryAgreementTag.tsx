import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import type { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import type { LaboratoryAgreement } from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import { useContext } from 'react';
import LaboratoryAgreementButtons from '../LaboratoryAgreementButtons/LaboratoryAgreementButtons';
import { LaboratoryAgreementDetailContext } from '../LaboratoryAgreementDetailModal/LaboratoryAgreementDetailContext';
import './LaboratoryAgreementTag.scss';

interface Props {
  laboratoryAgreement: LaboratoryAgreement;
  laboratory: Laboratory;
  afterClose?: () => void;
}

const LaboratoryAgreementTag = ({
  laboratoryAgreement,
  laboratory,
  afterClose
}: Props) => {
  const openLaboratoryAgreementDetail = useContext(
    LaboratoryAgreementDetailContext
  );

  const handleOpen = () =>
    openLaboratoryAgreementDetail?.(
      laboratoryAgreement,
      laboratory,
      afterClose
    );

  return (
    <div
      className={clsx(
        cx('fr-px-1w', 'fr-py-2v'),
        'laboratory-agreement-tag',
        'border',
        'bg-white',
        'laboratory-agreement-tag--clickable'
      )}
      onClick={handleOpen}
    >
      <span className={clsx(cx('fr-text--xs', 'fr-text--bold', 'fr-mb-0'))}>
        {laboratory.shortName}
      </span>
      <LaboratoryAgreementButtons values={laboratoryAgreement} size="sm" />
    </div>
  );
};

export default LaboratoryAgreementTag;
