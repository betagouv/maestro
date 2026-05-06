import Button from '@codegouvfr/react-dsfr/Button';
import clsx from 'clsx';
import './LaboratoryAgreementButton.scss';

export type AgreementField =
  | 'referenceLaboratory'
  | 'detectionAnalysis'
  | 'confirmationAnalysis';

const fieldConfig: Record<
  AgreementField,
  { label: string; title: string; activeClassname: string }
> = {
  referenceLaboratory: {
    label: 'R',
    title: 'Laboratoire référent',
    activeClassname: 'lab-agreement-btn--reference'
  },
  detectionAnalysis: {
    label: 'D',
    title: 'Analyses de détection',
    activeClassname: 'lab-agreement-btn--detection'
  },
  confirmationAnalysis: {
    label: 'C',
    title: 'Analyses de confirmation',
    activeClassname: 'lab-agreement-btn--confirmation'
  }
};

interface Props {
  field: AgreementField;
  active: boolean;
  size?: 'md' | 'sm';
  onToggle: () => void;
}

const LaboratoryAgreementButton = ({
  field,
  active,
  size = 'md',
  onToggle
}: Props) => {
  const { label, title, activeClassname } = fieldConfig[field];
  return (
    <Button
      priority="tertiary no outline"
      size="small"
      title={title}
      className={clsx('lab-agreement-btn', {
        'lab-agreement-btn--sm': size === 'sm',
        [activeClassname]: active
      })}
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
