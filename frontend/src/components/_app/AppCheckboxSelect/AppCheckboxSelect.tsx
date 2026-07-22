import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import clsx from 'clsx';
import { useEffect, useId, useRef, useState } from 'react';
import { pluralize } from '../../../utils/stringUtils';
import './AppCheckboxSelect.scss';

interface Props<T extends string> {
  label: string;
  options: { label: string; value: T }[];
  selectedValues: T[];
  onChange: (values: T[]) => void;
  emptyLabel?: string;
  summaryLabel?: string;
  searchable?: boolean;
  disabled?: boolean;
}

const AppCheckboxSelect = <T extends string>({
  label,
  options,
  selectedValues,
  onChange,
  emptyLabel = 'Tous',
  summaryLabel,
  searchable = false,
  disabled = false
}: Props<T>) => {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = (value: T) =>
    onChange(
      selectedValues.includes(value)
        ? selectedValues.filter((_) => _ !== value)
        : [...selectedValues, value]
    );

  const filteredOptions = search.trim()
    ? options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase().trim())
      )
    : options;

  const summary = (() => {
    if (selectedValues.length === 0) {
      return emptyLabel;
    }
    if (selectedValues.length === 1) {
      return (
        options.find((option) => option.value === selectedValues[0])?.label ??
        emptyLabel
      );
    }
    return summaryLabel
      ? pluralize(selectedValues.length, { preserveCount: true })(summaryLabel)
      : `${selectedValues.length} sélectionnés`;
  })();

  return (
    <div className="app-checkbox-select" ref={containerRef}>
      <label className={cx('fr-label')} htmlFor={id}>
        {label}
      </label>
      <button
        id={id}
        type="button"
        className={clsx(cx('fr-select'), 'app-checkbox-select__trigger', {
          'app-checkbox-select__trigger--filled': selectedValues.length > 0
        })}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        disabled={disabled}
      >
        {summary}
      </button>
      {isOpen && (
        <div className={clsx(cx('fr-p-2w'), 'app-checkbox-select__menu')}>
          {searchable && (
            <Input
              label=""
              hideLabel
              iconId="fr-icon-search-line"
              nativeInputProps={{
                placeholder: 'Rechercher...',
                value: search,
                onChange: (e) => setSearch(e.target.value)
              }}
              className={cx('fr-mb-1w')}
            />
          )}
          <div className="app-checkbox-select__options">
            {filteredOptions.length === 0 && (
              <div className={cx('fr-text--sm', 'fr-mb-0')}>Aucun résultat</div>
            )}
            {filteredOptions.map((option) => (
              <Checkbox
                key={option.value}
                className={cx('fr-my-2w', 'fr-text--regular')}
                options={[
                  {
                    label: option.label,
                    nativeInputProps: {
                      checked: selectedValues.includes(option.value),
                      onChange: () => toggle(option.value)
                    }
                  }
                ]}
                small
              />
            ))}
          </div>
          <hr className={cx('fr-my-2w')} />
          <div className="app-checkbox-select__actions">
            <Button
              priority="tertiary no outline"
              size="small"
              onClick={() => onChange([])}
              className={cx('fr-pl-0')}
            >
              Réinitialiser
            </Button>
            <Button
              priority="primary"
              size="small"
              onClick={() => {
                setIsOpen(false);
                setSearch('');
              }}
            >
              Valider
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppCheckboxSelect;
