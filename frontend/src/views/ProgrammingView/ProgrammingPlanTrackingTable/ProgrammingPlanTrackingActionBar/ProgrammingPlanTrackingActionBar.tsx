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
  onOpenDepartmentalModal: () => void;
  regionalActionLabel: string;
  departmentalActionLabel: string;
  onHeightChange: (height: number) => void;
}

const ProgrammingPlanTrackingActionBar = ({
  selectedCount,
  onDeselectAll,
  onOpenAdminModal,
  onOpenNationalModal,
  onOpenRegionalModal,
  onOpenDepartmentalModal,
  regionalActionLabel,
  departmentalActionLabel,
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
          {regionalActionLabel}
        </Button>
      )}
      {hasRole('DepartmentalCoordinator') && (
        <Button
          priority="secondary"
          size="small"
          onClick={onOpenDepartmentalModal}
          className={cx('fr-ml-3w')}
          iconId="fr-icon-send-plane-line"
          iconPosition="right"
        >
          {departmentalActionLabel}
        </Button>
      )}
    </SelectionActionBar>
  );
};

export default ProgrammingPlanTrackingActionBar;
