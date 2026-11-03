import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { useId, useMemo } from 'react';
import { assert, type Equals } from 'tsafe';
import { pluralize } from '../../../utils/stringUtils';
import AppRequiredInput from '../AppRequired/AppRequiredInput';
import './AppMultiChoice.scss';
import { AppMultiChoiceModal } from './AppMultiChoiceModal';
import {
  type AppMultiChoiceOption,
  orderedValues
} from './AppMultiChoiceOption';

const MAX_CHECKBOXES_OPTIONS = 10;
const MAX_VISIBLE_TAGS = 10;

type Props<T extends string> = {
  label: string;
  hideLabel?: boolean;
  required?: boolean;
  hintText?: string;
  options: AppMultiChoiceOption<T>[];
  values: T[];
  onChange: (values: T[]) => void;
  disabled?: boolean;
  format: 'auto' | 'checkboxes' | 'modal';
};

export const AppMultiChoice = <T extends string>({
  label,
  hideLabel,
  required,
  hintText,
  options,
  values,
  onChange,
  disabled,
  format,
  ..._rest
}: Props<T>) => {
  assert<Equals<keyof typeof _rest, never>>();

  const id = useId();
  const modal = useMemo(
    () =>
      createModal({
        id: `app-multi-choice-modal-${id}`,
        isOpenedByDefault: false
      }),
    [id]
  );

  const isCheckboxes =
    format === 'checkboxes' ||
    (format === 'auto' && options.length <= MAX_CHECKBOXES_OPTIONS);

  const labelBlock = !hideLabel && (
    <span className={cx('fr-label', 'fr-mb-1w')}>
      {label}
      {required && <AppRequiredInput />}
      {hintText && <span className={cx('fr-hint-text')}>{hintText}</span>}
    </span>
  );

  const noOptionsMessage = (
    <p className={cx('fr-text--sm')}>Aucune option disponible.</p>
  );

  if (isCheckboxes) {
    return options.length === 0 ? (
      <div>
        {labelBlock}
        {noOptionsMessage}
      </div>
    ) : (
      <Checkbox
        className="app-multi-choice__checkboxes"
        legend={
          <>
            {label}
            {required && <AppRequiredInput />}
          </>
        }
        classes={hideLabel ? { legend: 'fr-sr-only' } : undefined}
        hintText={hintText}
        disabled={disabled}
        options={options.map((option) => ({
          label: option.label,
          nativeInputProps: {
            value: option.value,
            checked: values.includes(option.value),
            onChange: (e) =>
              onChange(
                e.target.checked
                  ? orderedValues(options, [...values, option.value])
                  : values.filter((value) => value !== option.value)
              )
          }
        }))}
      />
    );
  }

  const selectedOptions = options.filter((option) =>
    values.includes(option.value)
  );
  const hiddenCount = selectedOptions.length - MAX_VISIBLE_TAGS;
  const allSelected =
    options.length > 0 && selectedOptions.length === options.length;

  return (
    <div>
      {labelBlock}
      <div className="app-multi-choice__tags">
        {allSelected && <i className="text-grey">Toutes les options</i>}
        {!allSelected &&
          selectedOptions.slice(0, MAX_VISIBLE_TAGS).map((option) =>
            disabled ? (
              <Tag key={option.value} small>
                {option.label}
              </Tag>
            ) : (
              <Tag
                key={option.value}
                small
                dismissible
                nativeButtonProps={{
                  onClick: () =>
                    onChange(values.filter((value) => value !== option.value))
                }}
              >
                {option.label}
              </Tag>
            )
          )}
        {!allSelected && hiddenCount > 0 && (
          <span className={cx('fr-text--sm', 'fr-mb-0')}>
            + {pluralize(hiddenCount, { preserveCount: true })('autre')}
          </span>
        )}
        {!disabled && (
          <Button
            iconId="fr-icon-edit-line"
            priority="secondary"
            size="small"
            title={
              selectedOptions.length > 0
                ? `Modifier — ${label}`
                : `Ajouter des options — ${label}`
            }
            onClick={() => modal.open()}
          />
        )}
      </div>
      {!disabled && (
        <AppMultiChoiceModal
          modal={modal}
          title={label}
          options={options}
          values={values}
          onSave={onChange}
        />
      )}
    </div>
  );
};
