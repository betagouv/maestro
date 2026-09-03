import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import type { AdminFieldConfig } from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import type { SpecificDataFieldOptionId } from 'maestro-shared/schema/SpecificData/ProgrammingSubPlanFieldConfig';
import { assert, type Equals } from 'tsafe';
import './ProgrammingSubPlanFieldActiveOptions.scss';

interface Props {
  optionIds: SpecificDataFieldOptionId[];
  globalField: AdminFieldConfig;
  disabled: boolean;
  onChange: (optionIds: SpecificDataFieldOptionId[]) => void;
}

export const ProgrammingSubPlanFieldActiveOptions = ({
  optionIds,
  globalField,
  disabled,
  onChange,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const sortedOptions = [...globalField.options].sort(
    (a, b) => a.order - b.order
  );

  const toggle = (optionId: SpecificDataFieldOptionId, checked: boolean) =>
    onChange(
      sortedOptions
        .filter(({ id }) =>
          id === optionId ? checked : optionIds.includes(id)
        )
        .map(({ id }) => id)
    );

  if (sortedOptions.length === 0) {
    return <p className={cx('fr-text--sm')}>Aucune option disponible.</p>;
  }

  return (
    <div className={clsx('programming-sub-plan-field-active-options')}>
      <Checkbox
        disabled={disabled}
        options={sortedOptions.map((option) => ({
          label: option.label,
          nativeInputProps: {
            value: option.value,
            checked: optionIds.includes(option.id),
            onChange: (e) => toggle(option.id, e.target.checked)
          }
        }))}
      />
    </div>
  );
};
