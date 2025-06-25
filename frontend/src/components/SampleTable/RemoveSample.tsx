import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import {
  isCreatedPartialSample,
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { useContext, useMemo } from 'react';
import ConfirmationModal from 'src/components/ConfirmationModal/ConfirmationModal';
import { ApiClientContext } from '../../services/apiClient';
interface RemoveSampleProps {
  sample: PartialSample | PartialSampleToCreate;
}

const RemoveSample = ({ sample }: RemoveSampleProps) => {
  const apiClient = useContext(ApiClientContext);
  const removeModal = useMemo(
    () =>
      createModal({
        id: `remove-modal-${sample.id}`,
        isOpenedByDefault: false
      }),
    [sample]
  );

  const [deleteSample] = apiClient.useDeleteSampleMutation();

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
