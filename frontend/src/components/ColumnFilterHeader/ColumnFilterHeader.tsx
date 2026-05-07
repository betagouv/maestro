import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import './ColumnFilterHeader.scss';

interface Props<T extends string> {
  label: string;
  options: { label: string; value: T }[];
  selectedValues: T[];
  onChange: (values: T[]) => void;
}

const ColumnFilterHeader = <T extends string>({
  label,
  options,
  selectedValues,
  onChange
}: Props<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const isActive = selectedValues.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value]
    );

  const filteredOptions = search.trim()
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase().trim())
      )
    : options;

  const handleValidate = () => {
    setIsOpen(false);
    setSearch('');
  };

  const handleReset = () => {
    onChange([]);
  };

  return (
    <div className="column-filter-header" ref={menuRef}>
      <span className="column-filter-label">{label}</span>
      <div className="column-filter-button-wrapper">
        <Button
          iconId="fr-icon-filter-line"
          priority={isActive ? 'primary' : 'tertiary no outline'}
          size="small"
          title={`Filtrer par ${label}`}
          className="column-filter-button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
        />
        {isOpen && (
          <div className={clsx(cx('fr-p-2w'), 'column-filter-menu')}>
            <Input
              label=""
              hideLabel
              nativeInputProps={{
                placeholder: 'Rechercher...',
                value: search,
                onChange: (e) => setSearch(e.target.value)
              }}
              className={cx('fr-mb-1w')}
            />
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
            <hr className={cx('fr-my-2w')} />
            <div className="column-filter-menu-actions">
              <Button
                priority="tertiary no outline"
                size="small"
                onClick={handleReset}
              >
                Réinitialiser
              </Button>
              <Button priority="primary" size="small" onClick={handleValidate}>
                Valider
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColumnFilterHeader;
