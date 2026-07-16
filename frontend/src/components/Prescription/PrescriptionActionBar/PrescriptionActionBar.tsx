import ButtonGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import './PrescriptionActionBar.scss';

interface Props {
  onReset: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

const PrescriptionActionBar = ({ onReset, onSave, isSaving }: Props) => (
  <div className="prescription-action-bar">
    <div className="fr-container">
      <ButtonGroup
        alignment="right"
        inlineLayoutWhen="always"
        buttons={[
          {
            children: 'Réinitialiser les modifications',
            priority: 'tertiary no outline',
            iconId: 'fr-icon-arrow-go-back-fill',
            onClick: onReset
          },
          {
            children: 'Enregistrer les modifications',
            onClick: onSave,
            disabled: isSaving
          }
        ]}
      />
    </div>
  </div>
);

export default PrescriptionActionBar;
