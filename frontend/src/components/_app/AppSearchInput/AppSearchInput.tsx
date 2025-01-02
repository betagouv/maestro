import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Autocomplete } from '@mui/material';
import { ReactNode } from 'react';
import AppRequiredInput from 'src/components/_app/AppRequired/AppRequiredInput';
import { AppSelectOption } from 'src/components/_app/AppSelect/AppSelectOption';

interface Props {
  options: AppSelectOption[];
  value: string;
  state?: 'success' | 'error' | 'default';
  stateRelatedMessage?: ReactNode;
  onSelect: (option?: string) => void;
  label?: string;
  required?: boolean;
  hintText?: string;
  placeholder?: string;
  whenValid?: string;
}

const AppSearchInput = ({
  options,
  value,
  state,
  stateRelatedMessage,
  onSelect,
  label,
  required,
  hintText,
  placeholder,
  whenValid
}: Props) => {
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
          value={options.find((option) => option.value === value)}
          onChange={(_, option) => onSelect(option?.value)}
          renderInput={(params) => (
            <div ref={params.InputProps.ref}>
              <input
                {...params.inputProps}
                defaultValue={value}
                className="fr-input"
                type="text"
                placeholder={placeholder ?? 'Rechercher une valeur'}
              />
            </div>
          )}
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
