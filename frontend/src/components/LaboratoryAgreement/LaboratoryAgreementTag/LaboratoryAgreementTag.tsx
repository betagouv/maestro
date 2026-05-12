import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import type { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import type { LaboratoryAgreement } from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import { useContext } from 'react';
import { LaboratoryAgreementDetailContext } from '../LaboratoryAgreementDetailModal/LaboratoryAgreementDetailContext';
import './LaboratoryAgreementTag.scss';
import LaboratoryAgreementButton from '../LaboratoryAgreementButton/LaboratoryAgreementButton';

interface Props {
  laboratoryAgreement: LaboratoryAgreement;
  laboratory: Laboratory;
}

const LaboratoryAgreementTag = ({ laboratoryAgreement, laboratory }: Props) => {
  const openLaboratoryAgreementDetail = useContext(
    LaboratoryAgreementDetailContext
  );

  const handleOpen = () =>
    openLaboratoryAgreementDetail?.(laboratoryAgreement, laboratory);

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
      <LaboratoryAgreementButton
        field="referenceLaboratory"
        active={laboratoryAgreement.referenceLaboratory}
        size="sm"
      />
      <LaboratoryAgreementButton
        field="detectionAnalysis"
        active={laboratoryAgreement.detectionAnalysis}
        size="sm"
      />
      <LaboratoryAgreementButton
        field="confirmationAnalysis"
        active={laboratoryAgreement.confirmationAnalysis}
        size="sm"
      />
    </div>
  );
};

export default LaboratoryAgreementTag;
