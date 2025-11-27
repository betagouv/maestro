import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { Brand } from 'maestro-shared/constants';
import { Document } from 'maestro-shared/schema/Document/Document';
import {
  DocumentKindLabels,
  ResourceDocumentKindList
} from 'maestro-shared/schema/Document/DocumentKind';
import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import ressources from 'src/assets/illustrations/ressources.svg';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import AppToast from 'src/components/_app/AppToast/AppToast';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import { ApiClientContext } from '../../services/apiClient';
import DocumentListTabContent from './DocumentListTabContent/DocumentListTabContent';

const noteModal = createModal({
  id: `note-modal`,
  isOpenedByDefault: false
});

const removeModal = createModal({
  id: `remove-modal`,
  isOpenedByDefault: false
});

const DocumentListView = () => {
  const apiClient = useContext(ApiClientContext);
  useDocumentTitle('Liste des documents ressources');

  const [searchParams, setSearchParams] = useSearchParams();
  const { hasUserPermission } = useAuthentication();

  const { data: resources } = apiClient.useFindResourcesQuery();

  const [, { isSuccess: isCreateSuccess }] =
    apiClient.useCreateDocumentMutation({
      fixedCacheKey: 'createDocument'
    });
  const [, { isSuccess: isUpdateSuccess }] =
    apiClient.useUpdateDocumentMutation({
      fixedCacheKey: 'updateDocument'
    });
  const [deleteDocument, { isSuccess: isDeleteSuccess }] =
    apiClient.useDeleteDocumentMutation({
      fixedCacheKey: 'deleteDocument'
    });

  const [currentDocument, setCurrentDocument] = useState<Document>();

  const onViewNotes = (document: Document) => {
    setCurrentDocument(document);
    setTimeout(() => noteModal.open(), 100);
  };
  const onRemove = (document: Document) => {
    setCurrentDocument(document);
    removeModal.open();
  };

  useIsModalOpen(noteModal, {
    onConceal: () => setCurrentDocument(undefined)
  });
  useIsModalOpen(removeModal, {
    onConceal: () => setCurrentDocument(undefined)
  });

  useEffect(() => {
    if (searchParams.get('documentId')) {
      const documentId = searchParams.get('documentId') as string;
      const document = resources?.find((doc) => doc.id === documentId);
      if (document && document.notes) {
        onViewNotes(document);
        searchParams.delete('documentId');
        setSearchParams(searchParams);
      }
    }
  }, [searchParams, resources]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <AppToast
        open={isCreateSuccess}
        description="Ressource déposée avec succès."
      />
      <AppToast
        open={isUpdateSuccess}
        description="Ressource mise à jour avec succès."
      />
      <AppToast
        open={isDeleteSuccess}
        description="Ressource supprimée avec succès."
      />
      <SectionHeader
        title="Ressources"
        subtitle={`Consultez les ressources mises à disposition des utilisateurs de ${Brand}`}
        illustration={ressources}
        action={
          hasUserPermission('createResource') && (
            <Button
              linkProps={{
                to: '/documents/nouveau'
              }}
              priority="secondary"
              data-testid="add-document"
            >
              Ajouter un document
            </Button>
          )
        }
      />

      <Tabs
        tabs={[
          {
            label: 'Toutes les ressources',
            content: (
              <DocumentListTabContent
                resources={resources ?? []}
                onViewDocumentNotes={onViewNotes}
                onRemoveDocument={onRemove}
              />
            )
          },
          ...ResourceDocumentKindList.map((kind) => ({
            label: DocumentKindLabels[kind],
            content: (
              <DocumentListTabContent
                resources={resources ?? []}
                documentKind={kind}
                onViewDocumentNotes={onViewNotes}
                onRemoveDocument={onRemove}
              />
            )
          }))
        ]}
      />
      <noteModal.Component
        title="Notes sur la ressource"
        concealingBackdrop={false}
        topAnchor
      >
        {currentDocument?.notes}
      </noteModal.Component>
      <ConfirmationModal
        modal={removeModal}
        title="Supprimer un document"
        onConfirm={async () => {
          if (currentDocument) {
            await deleteDocument(currentDocument.id);
          }
        }}
        confirmLabel="Supprimer"
        closeOnConfirm
      >
        Êtes-vous sûr de vouloir supprimer cette ressource ?
      </ConfirmationModal>
    </section>
  );
};

export default DocumentListView;
