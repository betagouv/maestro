import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import clsx from 'clsx';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import './ColumnFilterHeader.scss';

interface Props<T extends string> {
  label?: string;
  options: { label: string; value: T; disabled?: boolean }[];
  selectedValues: T[];
  onChange: (values: T[]) => void;
  onReset?: () => void;
  extraContent?: React.ReactNode;
  extraActive?: boolean;
  menuAlign?: 'left' | 'right';
}

const ColumnFilterHeader = <T extends string>({
  label,
  options,
  selectedValues,
  onChange,
  onReset,
  extraContent,
  extraActive = false,
  menuAlign = 'left'
}: Props<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const isActive = selectedValues.length > 0 || extraActive;

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

  const highlightLabel = (label: string) => {
    const trimmed = search.trim();
    if (!trimmed) {
      return label;
    }
    const index = label.toLowerCase().indexOf(trimmed.toLowerCase());
    if (index === -1) {
      return label;
    }
    return (
      <>
        {label.slice(0, index)}
        <strong>{label.slice(index, index + trimmed.length)}</strong>
        {label.slice(index + trimmed.length)}
      </>
    );
  };

  const handleValidate = () => {
    setIsOpen(false);
    setSearch('');
  };

  const handleReset = () => {
    onChange([]);
    onReset?.();
  };

  return (
    <div className="column-filter-header" ref={menuRef}>
      <span className="column-filter-label">{label}</span>
      <div className="column-filter-button-wrapper">
        <Button
          iconId="fr-icon-filter-line"
          priority={isActive ? 'primary' : 'tertiary'}
          size="small"
          title={`Filtrer ${label ? `par ${label}` : ''}`}
          className="column-filter-button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
        />
        {isOpen && (
          <div
            className={clsx(cx('fr-p-2w'), 'column-filter-menu', {
              'column-filter-menu--right': menuAlign === 'right'
            })}
          >
            <div className="search-input-wrapper">
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
              {search && (
                <Button
                  iconId="fr-icon-close-line"
                  priority="tertiary no outline"
                  size="small"
                  title="Effacer la recherche"
                  className="search-input-clear"
                  onClick={() => setSearch('')}
                />
              )}
            </div>
            <div className="column-filter-options">
              {filteredOptions.map((option) => (
                <Checkbox
                  key={option.value}
                  className={clsx(cx('fr-my-2w', 'fr-text--regular'), {
                    'column-filter-option--disabled': option.disabled
                  })}
                  options={[
                    {
                      label: <span>{highlightLabel(option.label)}</span>,
                      nativeInputProps: {
                        checked: selectedValues.includes(option.value),
                        onChange: () =>
                          !option.disabled && toggle(option.value),
                        disabled: option.disabled
                      }
                    }
                  ]}
                  small
                />
              ))}
            </div>
            {extraContent && (
              <>
                <hr className={cx('fr-my-2w')} />
                {extraContent}
              </>
            )}
            <hr className={cx('fr-my-2w')} />
            <div className="column-filter-menu-actions">
              <Button
                priority="tertiary no outline"
                size="small"
                onClick={handleReset}
                className={cx('fr-pl-0')}
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
