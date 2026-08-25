import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import SelectionActionBar from '../../../../components/SelectionActionBar/SelectionActionBar';
import { useAuthentication } from '../../../../hooks/useAuthentication';

interface Props {
  selectedCount: number;
  onDeselectAll: () => void;
  onOpenAdminModal: () => void;
  onOpenLaunchModal: () => void;
  isLaunchDisabled: boolean;
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
  onOpenLaunchModal,
  isLaunchDisabled,
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
      {hasRole('AdministratorBGIR') && (
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
      {hasRole('AdministratorBGIR') && (
        <Button
          priority="primary"
          size="small"
          onClick={onOpenLaunchModal}
          className={cx('fr-ml-3w')}
          iconId="fr-icon-check-line"
          iconPosition="right"
          disabled={isLaunchDisabled}
          title={
            isLaunchDisabled
              ? 'La campagne est déjà lancée sur les plans sélectionnés'
              : undefined
          }
        >
          Lancer la campagne
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
