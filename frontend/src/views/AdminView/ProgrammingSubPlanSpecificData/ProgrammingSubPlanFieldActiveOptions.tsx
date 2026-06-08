import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type { AdminFieldConfig } from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import type { ProgrammingSubPlanFieldConfig } from 'maestro-shared/schema/SpecificData/ProgrammingSubPlanFieldConfig';
import { useContext } from 'react';
import { assert, type Equals } from 'tsafe';
import AppServiceErrorAlert from '../../../components/_app/AppErrorAlert/AppServiceErrorAlert';
import { ApiClientContext } from '../../../services/apiClient';

interface Props {
  item: ProgrammingSubPlanFieldConfig;
  programmingPlanId: string;
  programmingSubPlanId: ProgrammingSubPlanId;
  globalField: AdminFieldConfig;
}

export const ProgrammingSubPlanFieldActiveOptions = ({
  item,
  programmingPlanId,
  programmingSubPlanId,
  globalField,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const [
    updateProgrammingSubPlanFieldOptions,
    updateProgrammingSubPlanFieldOptionsResult
  ] = apiClient.useUpdateProgrammingSubPlanFieldOptionsMutation();

  const activeOptionValues = new Set(item.field.options.map((o) => o.value));
  const sortedOptions = [...globalField.options].sort(
    (a, b) => a.order - b.order
  );

  const handleToggle = async (optionValue: string, checked: boolean) => {
    const currentValues = Array.from(activeOptionValues);
    const newActiveValues = new Set(
      checked
        ? [...currentValues, optionValue]
        : currentValues.filter((v) => v !== optionValue)
    );

    const newOptionIds = sortedOptions
      .filter((o) => newActiveValues.has(o.value))
      .map((o) => o.id);

    await updateProgrammingSubPlanFieldOptions({
      programmingPlanId,
      programmingSubPlanId,
      programmingSubPlanFieldId: item.id,
      optionIds: newOptionIds
    });
  };

  if (sortedOptions.length === 0) {
    return <p className={cx('fr-text--sm')}>Aucune option disponible.</p>;
  }

  return (
    <div className={cx('fr-mt-1w')}>
      <Checkbox
        legend="Options actives"
        small
        options={sortedOptions.map((option) => ({
          label: option.label,
          nativeInputProps: {
            value: option.value,
            checked: activeOptionValues.has(option.value),
            onChange: (e) => handleToggle(option.value, e.target.checked)
          }
        }))}
      />
      <AppServiceErrorAlert call={updateProgrammingSubPlanFieldOptionsResult} />
    </div>
  );
};
