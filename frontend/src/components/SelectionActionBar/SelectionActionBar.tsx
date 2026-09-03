import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Notice from '@codegouvfr/react-dsfr/Notice';
import clsx from 'clsx';
import { type ReactNode, useEffect, useRef } from 'react';
import { pluralize } from '../../utils/stringUtils';
import './SelectionActionBar.scss';

interface Props {
  selectedCount: number;
  itemLabel: string;
  onDeselectAll: () => void;
  onHeightChange?: (height: number) => void;
  notice?: { description: string };
  children?: ReactNode;
}

const SelectionActionBar = ({
  selectedCount,
  itemLabel,
  onDeselectAll,
  onHeightChange,
  notice,
  children
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      onHeightChange?.(0);
      return;
    }
    const updateHeight = () => onHeightChange?.(el.offsetHeight);
    const ro = new ResizeObserver(updateHeight);
    ro.observe(el);
    updateHeight();
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className="selection-action-bar-container">
      {selectedCount > 0 && (
        <div
          className={clsx(cx('fr-px-3w', 'fr-py-2w'), 'selection-action-bar')}
        >
          <div className="d-flex-justify-between d-flex-align-center">
            <span className={clsx(cx('fr-text--bold'), 'no-wrap')}>
              {pluralize(selectedCount, { preserveCount: true })(itemLabel)}
            </span>
            {notice && (
              <Notice
                className={cx('fr-m-0', 'fr-p-0')}
                title=""
                description={notice.description}
                severity="info"
                isClosable={false}
              />
            )}
            <span className="d-flex-align-center no-wrap">
              <Button
                priority="tertiary no outline"
                size="small"
                onClick={onDeselectAll}
                className="link-underline"
              >
                Désélectionner tout
              </Button>
              {children}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectionActionBar;
