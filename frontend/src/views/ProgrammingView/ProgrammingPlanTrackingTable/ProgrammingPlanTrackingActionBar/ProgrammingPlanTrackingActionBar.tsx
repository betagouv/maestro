import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { useAuthentication } from '../../../../hooks/useAuthentication';
import { pluralize } from '../../../../utils/stringUtils';
import './ProgrammingPlanTrackingActionBar.scss';

interface Props {
  selectedCount: number;
  onDeselectAll: () => void;
  onOpenAdminModal: () => void;
  onOpenNationalModal: () => void;
  onOpenRegionalModal: () => void;
  onHeightChange: (height: number) => void;
}

const ProgrammingPlanTrackingActionBar = ({
  selectedCount,
  onDeselectAll,
  onOpenAdminModal,
  onOpenNationalModal,
  onOpenRegionalModal,
  onHeightChange
}: Props) => {
  const { hasRole } = useAuthentication();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      onHeightChange(0);
      return;
    }
    const updateHeight = () => onHeightChange(el.offsetHeight);
    const ro = new ResizeObserver(updateHeight);
    ro.observe(el);
    updateHeight();
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className="programming-plan-tracking-notice-container">
      {selectedCount > 0 && (
        <div
          className={clsx(
            cx('fr-px-3w', 'fr-py-2w'),
            'programming-plan-tracking-notice'
          )}
        >
          <div className="d-flex-justify-between d-flex-align-center">
            <span className={clsx(cx('fr-text--bold'), 'no-wrap')}>
              {pluralize(selectedCount, { preserveCount: true })(
                'plan sélectionné'
              )}
            </span>
            <span className="d-flex-align-center no-wrap">
              <Button
                priority="tertiary no outline"
                size="small"
                onClick={onDeselectAll}
                className="link-underline"
              >
                Désélectionner tout
              </Button>
              {hasRole('Administrator') && (
                <Button
                  priority="secondary"
                  size="small"
                  onClick={onOpenAdminModal}
                  className={cx('fr-ml-3w')}
                  iconId="fr-icon-send-plane-line"
                  iconPosition="right"
                >
                  Soumettre les plans aux régions
                </Button>
              )}
              {hasRole('NationalCoordinator') && (
                <Button
                  priority="secondary"
                  size="small"
                  onClick={onOpenNationalModal}
                  className={cx('fr-ml-3w')}
                >
                  Soumettre les plans à l'admin et/ou aux régions
                </Button>
              )}
              {hasRole('RegionalCoordinator') && (
                <Button
                  priority="secondary"
                  size="small"
                  onClick={onOpenRegionalModal}
                  className={cx('fr-ml-3w')}
                  iconId="fr-icon-send-plane-line"
                  iconPosition="right"
                >
                  Soumettre les plans aux départements
                </Button>
              )}
              {/* TODO Feature B: bouton "Lancer la campagne" ici, rôle/permission à définir */}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgrammingPlanTrackingActionBar;
