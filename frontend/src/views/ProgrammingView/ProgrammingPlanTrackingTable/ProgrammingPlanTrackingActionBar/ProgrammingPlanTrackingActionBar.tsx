import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import SelectionActionBar from '../../../../components/SelectionActionBar/SelectionActionBar';
import { useAuthentication } from '../../../../hooks/useAuthentication';

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

  return (
    <SelectionActionBar
      selectedCount={selectedCount}
      itemLabel="plan sélectionné"
      onDeselectAll={onDeselectAll}
      onHeightChange={onHeightChange}
    >
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
          iconId="fr-icon-send-plane-line"
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
    </SelectionActionBar>
  );
};

export default ProgrammingPlanTrackingActionBar;
