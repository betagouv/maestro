import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useMemo } from 'react';
import { PartialSample } from 'shared/schema/Sample/Sample';
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

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await deleteSample(sample.id);
    removeModal.close();
  };

  return (
    <>
      <Button
        title="Supprimer"
        iconId="fr-icon-delete-line"
        priority="tertiary"
        size="small"
        onClick={removeModal.open}
      />
      <removeModal.Component
        title="Supprimer un prélèvement"
        buttons={[
          {
            children: 'Annuler',
            priority: 'secondary',
          },
          {
            children: 'Supprimer',
            onClick: submit,
            doClosesModal: false,
          },
        ]}
      >
        Êtes-vous sûr de vouloir supprimer le prélèvement {sample.reference} ?
      </removeModal.Component>
    </>
  );
};

export default RemoveSample;
