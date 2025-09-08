import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { ReactNode, useEffect, useRef, useState } from 'react';
import './Header.scss';

interface Props {
  value?: string;
  menuItems?: ReactNode[];
}

const HeaderMenu = ({ value, menuItems }: Props) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className="header-menu" ref={menuRef}>
      <div className={cx('fr-nav__item')}>
        <Button
          iconId={
            isMenuOpen ? 'fr-icon-arrow-up-s-line' : 'fr-icon-arrow-down-s-line'
          }
          iconPosition="right"
          priority="tertiary"
          id="menu-button"
          aria-expanded={isMenuOpen}
          aria-controls="menu"
          onClick={() =>
            setTimeout(() => setIsMenuOpen(!isMenuOpen), isMenuOpen ? 200 : 0)
          }
          className={clsx(cx('fr-m-0'), 'header-menu-button')}
        >
          {value}
        </Button>
        {isMenuOpen && (
          <div className={cx('fr-menu', 'fr-collapse')} id="menu">
            <ul className="fr-menu__list">
              {menuItems?.map(
                (item, index) =>
                  item && <li key={`header-menu-item-${index}`}>{item}</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderMenu;
