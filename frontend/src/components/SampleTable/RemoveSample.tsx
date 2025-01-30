import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useMemo } from 'react';
import {
  isCreatedPartialSample,
  PartialSample,
  PartialSampleToCreate,
} from 'maestro-shared/schema/Sample/Sample';
import ConfirmationModal from 'src/components/ConfirmationModal/ConfirmationModal';
import { useDeleteSampleMutation } from 'src/services/sample.service';
interface RemoveSampleProps {
  sample: PartialSample | PartialSampleToCreate;
}

const RemoveSample = ({ sample }: RemoveSampleProps) => {
  const removeModal = useMemo(
    () =>
      createModal({
        id: `remove-modal-${sample.id}`,
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
        closeOnConfirm
      >
        Êtes-vous sûr de vouloir supprimer le prélèvement{' '}
        {isCreatedPartialSample(sample) ? sample.reference : ''} ?
      </ConfirmationModal>
    </>
  );
};

export default RemoveSample;
