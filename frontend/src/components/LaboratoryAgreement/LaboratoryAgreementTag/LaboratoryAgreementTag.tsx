import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import type { LaboratoryShortName } from 'maestro-shared/referential/Laboratory';
import LaboratoryAgreementButton, {
  type AgreementField
} from '../LaboratoryAgreementButton/LaboratoryAgreementButton';
import './LaboratoryAgreementTag.scss';

interface Props {
  shortName: LaboratoryShortName;
  referenceLaboratory: boolean;
  detectionAnalysis: boolean;
  confirmationAnalysis: boolean;
  onToggle: (field: AgreementField) => void;
}

const LaboratoryAgreementTag = ({
  shortName,
  referenceLaboratory,
  detectionAnalysis,
  confirmationAnalysis,
  onToggle
}: Props) => (
  <div
    className={clsx(
      cx('fr-px-1w', 'fr-py-2v'),
      'laboratory-agreement-tag',
      'border',
      'bg-white'
    )}
  >
    <span className={clsx(cx('fr-text--xs', 'fr-text--bold', 'fr-mb-0'))}>
      {shortName}
    </span>
    <LaboratoryAgreementButton
      field="referenceLaboratory"
      active={referenceLaboratory}
      size="sm"
      onToggle={() => onToggle('referenceLaboratory')}
    />
    <LaboratoryAgreementButton
      field="detectionAnalysis"
      active={detectionAnalysis}
      size="sm"
      onToggle={() => onToggle('detectionAnalysis')}
    />
    <LaboratoryAgreementButton
      field="confirmationAnalysis"
      active={confirmationAnalysis}
      size="sm"
      onToggle={() => onToggle('confirmationAnalysis')}
    />
  </div>
);

export default LaboratoryAgreementTag;
