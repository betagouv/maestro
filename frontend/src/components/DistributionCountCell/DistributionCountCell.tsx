import { isNil } from 'lodash-es';
import type { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import type { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useState } from 'react';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(false);
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
        value={localPrescription.sampleCount}
        onChange={handleChange}
      />
    </>
  );
};

export default DistributionCountCell;
