import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useMemo } from 'react';
import { Document } from 'shared/schema/Document/Document';
import ConfirmationModal from 'src/components/ConfirmationModal/ConfirmationModal';
interface RemoveDocumentProps {
  document: Document;
  onRemoveDocument: (document: Document) => Promise<void>;
}

const RemoveDocument = ({
  document,
  onRemoveDocument,
}: RemoveDocumentProps) => {
  const removeModal = useMemo(
    () =>
      createModal({
        id: `remove-modal-${document.id}`,
        isOpenedByDefault: false,
      }),
    [document]
  );

  return (
    <>
      <Button
        title="Supprimer"
        iconId="fr-icon-delete-line"
        priority="tertiary no outline"
        size="small"
        className={cx('fr-pl-1w', 'fr-pr-0')}
        onClick={removeModal.open}
      />
      <ConfirmationModal
        modal={removeModal}
        title="Supprimer un document"
        onConfirm={async () => {
          await onRemoveDocument(document);
        }}
        confirmLabel="Supprimer"
      >
        Êtes-vous sûr de vouloir supprimer ce document ?
      </ConfirmationModal>
    </>
  );
};

export default RemoveDocument;
