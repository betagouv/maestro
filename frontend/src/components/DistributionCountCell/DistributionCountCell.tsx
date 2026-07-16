import { isNil } from 'lodash-es';
import type { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import type { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useEffect, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import AppToast from '../_app/AppToast/AppToast';
import './DistributionCountCell.scss';

interface Props {
  programmingPlan: ProgrammingPlanChecked;
  prescription: Prescription;
  localPrescription: LocalPrescription;
  isEditable?: boolean;
  isPending?: boolean;
  onChange: (value: number) => void;
  max?: number;
}

const DistributionCountCell = ({
  programmingPlan,
  prescription,
  localPrescription,
  isEditable,
  isPending,
  onChange,
  max,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();
  const [error, setError] = useState(false);
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
    setError(false);
    setInputValue(e.target.value);
    const newValue = Number(e.target.value);
    if (!isNil(max) && newValue > max) {
      e.preventDefault();
      setError(true);
      return;
    }
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
    <>
      <AppToast
        open={error}
        severity="error"
        description="Nombre maximum de prélèvements atteint"
        onClose={() => setError(false)}
      />
      <input
        className={`distribution-count-input${isPending ? ' distribution-count-input--pending' : ''}`}
        type="number"
        min={0}
        value={inputValue}
        onFocus={handleFocus}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </>
  );
};

export default DistributionCountCell;
