import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import clsx from 'clsx';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { pluralize } from '../../../utils/stringUtils';
import './AppCheckboxSelect.scss';

const MENU_MAX_HEIGHT = 400;
const MENU_MARGIN = 8;

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
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  const updateMenuPosition = useCallback(() => {
    const trigger = containerRef.current;
    if (!trigger) {
      return;
    }
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - MENU_MARGIN;
    const spaceAbove = rect.top - MENU_MARGIN;
    const openUpwards = spaceBelow < MENU_MAX_HEIGHT && spaceAbove > spaceBelow;
    const maxHeight = Math.min(
      MENU_MAX_HEIGHT,
      openUpwards ? spaceAbove : spaceBelow
    );
    setMenuPosition({
      top: openUpwards ? rect.top - maxHeight : rect.bottom,
      left: rect.left,
      width: rect.width,
      maxHeight
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    updateMenuPosition();
    window.addEventListener('scroll', updateMenuPosition, true);
    window.addEventListener('resize', updateMenuPosition);
    return () => {
      window.removeEventListener('scroll', updateMenuPosition, true);
      window.removeEventListener('resize', updateMenuPosition);
    };
  }, [isOpen, updateMenuPosition]);

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
      {isOpen &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            className={clsx(cx('fr-p-2w'), 'app-checkbox-select__menu')}
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              minWidth: menuPosition.width,
              maxHeight: menuPosition.maxHeight
            }}
          >
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
                <div className={cx('fr-text--sm', 'fr-mb-0')}>
                  Aucun résultat
                </div>
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
          </div>,
          document.body
        )}
    </div>
  );
};

export default AppCheckboxSelect;
