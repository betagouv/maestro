import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type { AdminFieldConfig } from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import { useContext } from 'react';
import { assert, type Equals } from 'tsafe';
import {
  fieldInputTypeHasOptions,
  type ProgrammingSubPlanFieldConfig
} from '../../../../../shared/schema/SpecificData/ProgrammingSubPlanFieldConfig';
import { ApiClientContext } from '../../../services/apiClient';
import { ProgrammingSubPlanFieldActiveOptions } from './ProgrammingSubPlanFieldActiveOptions';

interface Props {
  item: ProgrammingSubPlanFieldConfig;
  programmingPlanId: string;
  programmingSubPlanId: ProgrammingSubPlanId;
  globalField: AdminFieldConfig | undefined;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => Promise<void>;
  onMoveDown: () => Promise<void>;
  onDelete: () => void;
}

export const ProgrammingSubPlanFieldItem = ({
  item,
  programmingPlanId,
  programmingSubPlanId,
  globalField,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const [updateProgrammingSubPlanField] =
    apiClient.useUpdateProgrammingSubPlanFieldMutation();

  const handleRequiredToggle = async (checked: boolean) => {
    await updateProgrammingSubPlanField({
      programmingPlanId,
      programmingSubPlanId,
      programmingSubPlanFieldId: item.id,
      required: checked,
      order: item.order
    });
  };

  return (
    <div className={clsx('white-container', 'border', cx('fr-p-2w'))}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div style={{ flex: 1 }}>
          <p className={cx('fr-text--bold', 'fr-mb-0')}>
            {item.field.label}{' '}
            <span className={cx('fr-text--sm', 'fr-text--regular')}>
              ({item.field.key})
            </span>
          </p>
          {item.field.hintText && (
            <p className={cx('fr-text--sm', 'fr-mb-0', 'fr-hint-text')}>
              {item.field.hintText}
            </p>
          )}
        </div>
        <ToggleSwitch
          label="Obligatoire"
          labelPosition={'left'}
          checked={item.required}
          onChange={handleRequiredToggle}
          showCheckedHint={false}
        />
        <div className={cx('fr-btns-group', 'fr-btns-group--inline')}>
          <Button
            priority="tertiary no outline"
            iconId="fr-icon-arrow-up-line"
            size="small"
            title="Monter"
            disabled={isFirst}
            onClick={onMoveUp}
          />
          <Button
            priority="tertiary no outline"
            iconId="fr-icon-arrow-down-line"
            size="small"
            title="Descendre"
            disabled={isLast}
            onClick={onMoveDown}
          />
          <Button
            priority="tertiary no outline"
            iconId="fr-icon-delete-line"
            size="small"
            title="Retirer"
            onClick={onDelete}
          />
        </div>
      </div>

      {globalField && fieldInputTypeHasOptions(item.field.inputType) && (
        <ProgrammingSubPlanFieldActiveOptions
          item={item}
          programmingPlanId={programmingPlanId}
          programmingSubPlanId={programmingSubPlanId}
          globalField={globalField}
        />
      )}
    </div>
  );
};
