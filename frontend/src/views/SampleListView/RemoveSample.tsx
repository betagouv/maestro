import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useMemo } from 'react';
import { PartialSample } from 'shared/schema/Sample/Sample';
import ConfirmationModal from 'src/components/ConfirmationModal/ConfirmationModal';
import { useDeleteSampleMutation } from 'src/services/sample.service';
interface RemoveSampleProps {
  sample: PartialSample;
}

const RemoveSample = ({ sample }: RemoveSampleProps) => {
  const removeModal = useMemo(
    () =>
      createModal({
        id: `remove-modal-${sample.reference}`,
        isOpenedByDefault: false,
      }),
    [sample]
  );

  const [deleteSample] = useDeleteSampleMutation();

  return (
    <>
      <Button
        title="Supprimer"
        iconId="fr-icon-delete-line"
        priority="tertiary"
        size="small"
        onClick={removeModal.open}
      />
      <ConfirmationModal
        modal={removeModal}
        title="Supprimer un prélèvement"
        onConfirm={async () => {
          await deleteSample(sample.id);
        }}
        confirmLabel="Supprimer"
      >
        Êtes-vous sûr de vouloir supprimer le prélèvement {sample.reference} ?
      </ConfirmationModal>
    </>
  );
};

export default RemoveSample;
