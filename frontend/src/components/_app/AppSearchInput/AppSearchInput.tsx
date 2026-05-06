import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Autocomplete } from '@mui/material';
import clsx from 'clsx';
import type * as React from 'react';
import { type ReactNode, useEffect, useState } from 'react';
import AppRequiredInput from 'src/components/_app/AppRequired/AppRequiredInput';
import type { AppSelectOption } from 'src/components/_app/AppSelect/AppSelectOption';

interface Props {
  options: AppSelectOption[];
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement> & {
      key: string | number | bigint;
    },
    option: AppSelectOption
  ) => ReactNode;
  value: string;
  state?: 'success' | 'error' | 'default';
  stateRelatedMessage?: ReactNode;
  onSelect: (option?: string) => void;
  label?: string;
  required?: boolean;
  hintText?: string;
  placeholder?: string;
  whenValid?: string;
  inputProps?: any;
  disabled?: boolean;
  className?: string;
  disableAutoSelectSingleOption?: true;
  resetOnSelect?: true;
}

const AppSearchInput = ({
  options,
  renderOption,
  value,
  state,
  stateRelatedMessage,
  onSelect,
  label,
  required,
  hintText,
  placeholder,
  whenValid,
  inputProps,
  disabled,
  className,
  disableAutoSelectSingleOption,
  resetOnSelect
}: Props) => {
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? '';
  const [inputValue, setInputValue] = useState(selectedLabel);

  useEffect(() => {
    if (!resetOnSelect) {
      setInputValue(selectedLabel);
    }
  }, [selectedLabel, resetOnSelect]);

  useEffect(() => {
    if (
      !disableAutoSelectSingleOption &&
      options.length === 1 &&
      options[0].value !== value
    ) {
      onSelect(options[0].value);
    }
  }, [options, onSelect, value, disableAutoSelectSingleOption]);

  return (
    <div
      className={clsx(
        className,
        cx(
          'fr-input-group',
          (() => {
            switch (state) {
              case 'error':
                return 'fr-input-group--error';
              case 'success':
                return 'fr-input-group--valid';
              case 'default':
                return undefined;
            }
          })()
        )
      )}
    >
      {/** biome-ignore lint/a11y/noLabelWithoutControl: TODO */}
      <label className={cx('fr-label')}>
        {label && (
          <>
            {label}
            {required && <AppRequiredInput />}
          </>
        )}
        {hintText && <span className="fr-hint-text">{hintText}</span>}
      </label>
      <div className="fr-input-wrap fr-icon-search-line">
        <Autocomplete
          autoComplete
          includeInputInList
          value={options.find((option) => option.value === value) ?? null}
          inputValue={inputValue}
          onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
          onChange={(_, option) => {
            onSelect(option?.value);
            if (resetOnSelect) {
              setInputValue('');
            }
          }}
          isOptionEqualToValue={(option, value) =>
            option.value === value?.value
          }
          renderInput={({ slotProps }) => (
            <div ref={slotProps.input.ref}>
              <input
                {...slotProps.htmlInput}
                {...inputProps}
                className="fr-input"
                type="text"
                placeholder={placeholder ?? 'Rechercher une valeur'}
              />
            </div>
          )}
          renderOption={renderOption}
          options={options}
          noOptionsText={'Aucun résultat'}
          disabled={disabled}
        />
      </div>
      {state && state !== 'default' && (
        <p
          className={cx(
            (() => {
              switch (state) {
                case 'error':
                  return 'fr-error-text';
                case 'success':
                  return 'fr-valid-text';
              }
            })()
          )}
        >
          {state === 'success' && whenValid ? whenValid : stateRelatedMessage}
        </p>
      )}
    </div>
  );
};

export default AppSearchInput;
