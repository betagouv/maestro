import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import type {
  AdminFieldConfig,
  ProgrammingPlanFieldSetting,
  ProgrammingSubPlanFieldSetting
} from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import { FieldInheritanceLabels } from 'maestro-shared/schema/SpecificData/FieldInheritance';
import { fieldInputTypeHasOptions } from 'maestro-shared/schema/SpecificData/ProgrammingSubPlanFieldConfig';
import { AppMultiChoice } from 'src/components/_app/AppMultiChoice/AppMultiChoice';
import { assert, type Equals } from 'tsafe';
import { SettingInheritanceLockButton } from '../SettingInheritanceLockButton/SettingInheritanceLockButton';
import './ProgrammingSubPlanFieldItem.scss';

interface Props {
  field: ProgrammingSubPlanFieldSetting;
  globalField: AdminFieldConfig | undefined;
  planField: ProgrammingPlanFieldSetting | undefined;
  locked: boolean;
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
  planField,
  locked,
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

  return (
    <div
      className={clsx(
        'programming-sub-plan-field-item',
        'white-container',
        'border',
        cx('fr-p-2w')
      )}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div
          className={clsx(
            'd-flex-row',
            'd-flex-align-center',
            isReadOnly && 'field-label--read-only'
          )}
          style={{ flex: 1, gap: '0.5rem' }}
        >
          {managedAtPlanLevel && (
            <SettingInheritanceLockButton
              isInherited={isReadOnly}
              title={FieldInheritanceLabels[inheritance]}
              disabled={locked}
              onClick={() =>
                onChange(
                  isReadOnly
                    ? { ...field, inheritance: 'Own' }
                    : {
                        ...field,
                        inheritance: 'Inherited',
                        required: planField?.required ?? field.required,
                        optionIds: planField?.optionIds ?? field.optionIds
                      }
                )
              }
            />
          )}
          <div>
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
          </div>
        </div>
        <ToggleSwitch
          label="Obligatoire"
          labelPosition={'left'}
          checked={field.required}
          disabled={isReadOnly || locked}
          onChange={(required) => onChange({ ...field, required })}
          showCheckedHint={false}
        />
        <div className={cx('fr-btns-group', 'fr-btns-group--inline')}>
          {!managedAtPlanLevel && (
            <>
              <Button
                priority="tertiary no outline"
                iconId="fr-icon-arrow-up-line"
                size="small"
                title="Monter"
                disabled={!canMoveUp}
                onClick={onMoveUp}
              />
              <Button
                priority="tertiary no outline"
                iconId="fr-icon-arrow-down-line"
                size="small"
                title="Descendre"
                disabled={!canMoveDown}
                onClick={onMoveDown}
              />
            </>
          )}
          <Button
            priority="tertiary"
            iconId="fr-icon-delete-line"
            size="small"
            title="Retirer"
            disabled={locked}
            onClick={onDelete}
          />
        </div>
      </div>

      {globalField && fieldInputTypeHasOptions(globalField.inputType) && (
        <div className={cx('fr-mt-1w')}>
          <AppMultiChoice
            label={globalField.label}
            hideLabel
            format="auto"
            options={[...globalField.options]
              .sort((a, b) => a.order - b.order)
              .map((option) => ({ value: option.id, label: option.label }))}
            values={field.optionIds}
            disabled={isReadOnly || locked}
            onChange={(optionIds) => onChange({ ...field, optionIds })}
          />
        </div>
      )}
    </div>
  );
};
