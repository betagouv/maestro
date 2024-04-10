import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useMemo } from 'react';
import { Document } from 'shared/schema/Document/Document';
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
  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await onRemoveDocument(document);
    removeModal.close();
  };

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
      <removeModal.Component
        title="Supprimer un document"
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
        Êtes-vous sûr de vouloir supprimer ce document ?
        <ul>
          <li>{document.filename}</li>
        </ul>
      </removeModal.Component>
    </>
  );
};

export default RemoveDocument;
