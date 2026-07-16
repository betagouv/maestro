import { createModal } from '@codegouvfr/react-dsfr/Modal';

const unsavedChangesModal = createModal({
  id: 'unsaved-changes-modal',
  isOpenedByDefault: false
});

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

const UnsavedChangesModal = ({ onConfirm, onCancel }: Props) => (
  <unsavedChangesModal.Component
    title="Vous n'avez pas enregistré vos modifications."
    buttons={[
      {
        children: 'Revenir à la page',
        priority: 'secondary',
        onClick: onCancel
      },
      {
        children: 'Continuer quand même',
        onClick: onConfirm
      }
    ]}
  >
    Si vous continuez, elles seront perdues.
  </unsavedChangesModal.Component>
);

export const openUnsavedChangesModal = unsavedChangesModal.open;
export default UnsavedChangesModal;
