import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { useEffect, useId, useRef, useState } from 'react';
import './YearSelector.scss';

interface Props {
  year: number;
  years: number[];
  onChange: (year: number) => void;
}

const YearSelector = ({ year, years, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div className="year-selector" ref={ref}>
      <Button
        iconId={
          isOpen ? 'fr-icon-arrow-up-s-line' : 'fr-icon-arrow-down-s-line'
        }
        iconPosition="right"
        priority="tertiary no outline"
        id={`menu-button-${menuId}`}
        aria-expanded={isOpen}
        aria-controls={`menu-${menuId}`}
        className={clsx(cx('fr-m-0'), 'year-selector-button', 'link-underline')}
        onClick={() =>
          setTimeout(() => setIsOpen((prev) => !prev), isOpen ? 200 : 0)
        }
      >
        {year}
      </Button>
      {isOpen && (
        <div className={cx('fr-menu', 'fr-collapse')} id={`menu-${menuId}`}>
          <ul className="fr-menu__list">
            {years.map((y) => (
              <li key={y}>
                <Button
                  priority="tertiary no outline"
                  className={clsx(cx('fr-m-0'), 'no-wrap', {
                    'fr-text--bold': y === year
                  })}
                  onClick={() => {
                    onChange(y);
                    setIsOpen(false);
                  }}
                >
                  {y}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default YearSelector;
