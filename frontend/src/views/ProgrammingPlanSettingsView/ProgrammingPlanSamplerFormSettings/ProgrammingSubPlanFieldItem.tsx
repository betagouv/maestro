import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import type {
  AdminFieldConfig,
  ProgrammingSubPlanFieldSetting
} from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import { fieldInputTypeHasOptions } from 'maestro-shared/schema/SpecificData/ProgrammingSubPlanFieldConfig';
import { assert, type Equals } from 'tsafe';
import { ProgrammingSubPlanFieldActiveOptions } from './ProgrammingSubPlanFieldActiveOptions';

interface Props {
  field: ProgrammingSubPlanFieldSetting;
  globalField: AdminFieldConfig | undefined;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onChange: (field: ProgrammingSubPlanFieldSetting) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

export const ProgrammingSubPlanFieldItem = ({
  field,
  globalField,
  canMoveUp,
  canMoveDown,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { managedAtPlanLevel, inheritance } = field;
  const isReadOnly = inheritance === 'Inherited';
  const isExcluded = inheritance === 'Excluded';

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
            {globalField?.label ?? field.fieldId}{' '}
            <span className={cx('fr-text--sm', 'fr-text--regular')}>
              ({globalField?.key})
            </span>
          </p>
          {globalField?.hintText && (
            <p className={cx('fr-text--sm', 'fr-mb-0', 'fr-hint-text')}>
              {globalField.hintText}
            </p>
          )}
          {managedAtPlanLevel && (
            <Badge severity="info" small className={cx('fr-mt-1v')}>
              {isReadOnly ? 'Hérité du plan' : 'Détaché du plan'}
            </Badge>
          )}
        </div>
        {managedAtPlanLevel && (
          <Checkbox
            small
            options={[
              {
                label: 'Actif',
                nativeInputProps: {
                  checked: !isExcluded,
                  onChange: (e) =>
                    onChange({
                      ...field,
                      inheritance: e.target.checked ? 'Inherited' : 'Excluded'
                    })
                }
              }
            ]}
          />
        )}
        <ToggleSwitch
          label="Obligatoire"
          labelPosition={'left'}
          checked={field.required}
          disabled={isReadOnly || isExcluded}
          onChange={(required) => onChange({ ...field, required })}
          showCheckedHint={false}
        />
        <div className={cx('fr-btns-group', 'fr-btns-group--inline')}>
          <Button
            priority="tertiary no outline"
            iconId="fr-icon-arrow-up-line"
            size="small"
            title="Monter"
            disabled={managedAtPlanLevel || !canMoveUp}
            onClick={onMoveUp}
          />
          <Button
            priority="tertiary no outline"
            iconId="fr-icon-arrow-down-line"
            size="small"
            title="Descendre"
            disabled={managedAtPlanLevel || !canMoveDown}
            onClick={onMoveDown}
          />
          <Button
            priority="tertiary no outline"
            iconId="fr-icon-delete-line"
            size="small"
            title="Retirer"
            disabled={managedAtPlanLevel}
            onClick={onDelete}
          />
        </div>
      </div>

      {globalField && fieldInputTypeHasOptions(globalField.inputType) && (
        <ProgrammingSubPlanFieldActiveOptions
          optionIds={field.optionIds}
          globalField={globalField}
          disabled={isReadOnly || isExcluded}
          onChange={(optionIds) => onChange({ ...field, optionIds })}
        />
      )}
    </div>
  );
};
