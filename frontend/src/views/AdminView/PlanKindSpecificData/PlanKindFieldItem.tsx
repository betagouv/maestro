import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import type { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import type { AdminFieldConfig } from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import {
  fieldInputTypeHasOptions,
  type PlanKindFieldConfig
} from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import { useContext } from 'react';
import { assert, type Equals } from 'tsafe';
import { ApiClientContext } from '../../../services/apiClient';
import { PlanKindFieldActiveOptions } from './PlanKindFieldActiveOptions';

interface Props {
  item: PlanKindFieldConfig;
  programmingPlanId: string;
  kind: ProgrammingPlanKind;
  globalField: AdminFieldConfig | undefined;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => Promise<void>;
  onMoveDown: () => Promise<void>;
  onDelete: () => void;
}

export const PlanKindFieldItem = ({
  item,
  programmingPlanId,
  kind,
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
  const [updatePlanKindField] = apiClient.useUpdatePlanKindFieldMutation();

  const handleRequiredToggle = async (checked: boolean) => {
    await updatePlanKindField({
      programmingPlanId,
      kind,
      planKindFieldId: item.id,
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
        <PlanKindFieldActiveOptions
          item={item}
          programmingPlanId={programmingPlanId}
          kind={kind}
          globalField={globalField}
        />
      )}
    </div>
  );
};
