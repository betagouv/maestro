import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { AdminFieldConfig } from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import { useContext } from 'react';
import { assert, type Equals } from 'tsafe';
import AppServiceErrorAlert from '../../../components/_app/AppErrorAlert/AppServiceErrorAlert';
import { ApiClientContext } from '../../../services/apiClient';

interface Props {
  fieldToDelete: AdminFieldConfig | null;
  modal: ReturnType<typeof createModal>;
}

export const FieldDeleteConfirm = ({
  fieldToDelete,
  modal,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const [deleteField, deleteFieldResult] = apiClient.useDeleteFieldMutation();

  const confirm = async () => {
    if (!fieldToDelete) return;
    try {
      await deleteField(fieldToDelete.id).unwrap();
      modal.close();
    } catch (_e) {
      /* empty */
    }
  };

  return (
    <modal.Component
      title="Supprimer le champ"
      concealingBackdrop={false}
      topAnchor
      buttons={[
        {
          children: 'Annuler',
          doClosesModal: true,
          priority: 'secondary'
        },
        {
          children: 'Supprimer',
          onClick: confirm,
          doClosesModal: false,
          priority: 'primary'
        }
      ]}
    >
      {fieldToDelete && (
        <p>
          Êtes-vous sûr de vouloir supprimer le champ{' '}
          <strong>{fieldToDelete.label}</strong> ({fieldToDelete.key}) ?
        </p>
      )}
      <AppServiceErrorAlert call={deleteFieldResult} />
    </modal.Component>
  );
};
