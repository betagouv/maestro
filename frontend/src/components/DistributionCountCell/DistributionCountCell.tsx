import type { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import type { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useEffect, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import './DistributionCountCell.scss';

interface Props {
  programmingPlan: ProgrammingPlanChecked;
  prescription: Prescription;
  localPrescription: LocalPrescription;
  isEditable?: boolean;
  isPending?: boolean;
  onChange: (value: number) => void;
}

const DistributionCountCell = ({
  programmingPlan,
  prescription,
  localPrescription,
  isEditable,
  isPending,
  onChange,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();
  const [inputValue, setInputValue] = useState(
    String(localPrescription.sampleCount)
  );

  useEffect(() => {
    setInputValue(String(localPrescription.sampleCount));
  }, [localPrescription.sampleCount]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (localPrescription.sampleCount === 0) {
      setInputValue('');
      e.target.value = '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const newValue = Number(e.target.value);
    if (!Number.isNaN(newValue) && newValue !== localPrescription.sampleCount) {
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    if (inputValue === '') {
      setInputValue(String(localPrescription.sampleCount));
    }
  };

  if (!isEditable) {
    return (
      <div className="distribution-count distribution-count--readonly">
        {localPrescription.sampleCount}
      </div>
    );
  }

  return (
    <input
      className={`distribution-count-input${isPending ? ' distribution-count-input--pending' : ''}`}
      type="number"
      min={0}
      value={inputValue}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};

export default DistributionCountCell;
