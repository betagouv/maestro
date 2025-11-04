import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import {
  forwardRef,
  ReactNode,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import './Header.scss';

interface Props {
  value?: string;
  menuItems?: ReactNode[];
}

const HeaderMenu = forwardRef<{ closeMenu: () => void }, Props>(
  ({ value, menuItems }, ref) => {
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuId = useId();

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

    useImperativeHandle(ref, () => ({
      closeMenu: () => setIsMenuOpen(false)
    }));

    return (
      <div className="header-menu" ref={menuRef}>
        <div className={cx('fr-nav__item')}>
          <Button
            iconId={
              isMenuOpen
                ? 'fr-icon-arrow-up-s-line'
                : 'fr-icon-arrow-down-s-line'
            }
            iconPosition="right"
            priority="tertiary"
            id={`menu-button-${menuId}`}
            aria-expanded={isMenuOpen}
            aria-controls={`menu-${menuId}`}
            onClick={() =>
              setTimeout(() => setIsMenuOpen(!isMenuOpen), isMenuOpen ? 200 : 0)
            }
            className={clsx(cx('fr-m-0'), 'header-menu-button')}
          >
            {value}
          </Button>
          {isMenuOpen && (
            <div className={cx('fr-menu', 'fr-collapse')} id={`menu-${menuId}`}>
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
  }
);

export default HeaderMenu;
