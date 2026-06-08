import {
  type LaboratoryAgreementField,
  LaboratoryAgreementFields
} from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import LaboratoryAgreementButton from '../LaboratoryAgreementButton/LaboratoryAgreementButton';
import './LaboratoryAgreementButtons.scss';

interface Props {
  values: Record<LaboratoryAgreementField, boolean>;
  onToggle?: (field: LaboratoryAgreementField) => void;
  size?: 'md' | 'sm';
}

const LaboratoryAgreementButtons = ({ values, onToggle, size }: Props) => (
  <div className="lab-agreement-buttons">
    {LaboratoryAgreementFields.map((field) => (
      <LaboratoryAgreementButton
        key={field}
        field={field}
        active={values[field]}
        size={size}
        onToggle={onToggle ? () => onToggle(field) : undefined}
      />
    ))}
  </div>
);

export default LaboratoryAgreementButtons;
