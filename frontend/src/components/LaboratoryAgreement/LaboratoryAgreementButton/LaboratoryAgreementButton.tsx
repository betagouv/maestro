import Button from '@codegouvfr/react-dsfr/Button';
import clsx from 'clsx';
import type { LaboratoryAgreementField } from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import { agreementLabels } from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import './LaboratoryAgreementButton.scss';

export type AgreementField =
  | 'referenceLaboratory'
  | 'detectionAnalysis'
  | 'confirmationAnalysis';

const fieldConfig: Record<
  AgreementField,
  { label: string; activeClassname: string }
> = {
  referenceLaboratory: {
    label: 'R',
    activeClassname: 'lab-agreement-btn--reference'
  },
  detectionAnalysis: {
    label: 'D',
    activeClassname: 'lab-agreement-btn--detection'
  },
  confirmationAnalysis: {
    label: 'C',
    activeClassname: 'lab-agreement-btn--confirmation'
  }
};

interface Props {
  field: LaboratoryAgreementField;
  active: boolean;
  size?: 'md' | 'sm';
  onToggle?: () => void;
}

const LaboratoryAgreementButton = ({
  field,
  active,
  size = 'md',
  onToggle
}: Props) => {
  const { label, title, activeClassname } = fieldConfig[field];
  const { label, activeClassname } = fieldConfig[field];
  const className = clsx('lab-agreement-btn', {
    'lab-agreement-btn--sm': size === 'sm',
    [activeClassname]: active
  });

  if (!onToggle) {
    if (!active) {
      return null;
    }
    return (
      <span className={className} title={title}>
        {label}
      </span>
    );
  }

  return (
    <Button
      priority="tertiary no outline"
      size="small"
      title={title}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        onToggle();
      }}
    >
      {label}
    </Button>
  );
};

export default LaboratoryAgreementButton;
