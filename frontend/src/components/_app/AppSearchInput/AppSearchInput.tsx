import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Autocomplete } from '@mui/material';
import * as React from 'react';
import { ReactNode, useEffect } from 'react';
import AppRequiredInput from 'src/components/_app/AppRequired/AppRequiredInput';
import { AppSelectOption } from 'src/components/_app/AppSelect/AppSelectOption';

interface Props {
  options: AppSelectOption[];
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement> & { key: string },
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
  inputProps
}: Props) => {
  useEffect(() => {
    if (options.length === 1) {
      onSelect(options[0].value);
    }
  }, [options, onSelect]);

  return (
    <div
      className={cx(
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
      )}
    >
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
          onChange={(_, option) => onSelect(option?.value)}
          isOptionEqualToValue={(option, value) =>
            option.value === value?.value
          }
          renderInput={(params) => (
            <div ref={params.InputProps.ref}>
              <input
                {...params.inputProps}
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
        />
      </div>
      {state !== 'default' && (
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
