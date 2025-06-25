import Button from '@codegouvfr/react-dsfr/Button';
import Table from '@codegouvfr/react-dsfr/Table';
import { format } from 'date-fns';
import { Document } from 'maestro-shared/schema/Document/Document';
import { useContext } from 'react';
import AppToast from 'src/components/_app/AppToast/AppToast';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocument } from 'src/hooks/useDocument';
import RemoveDocument from 'src/views/DocumentListView/RemoveDocument';
import { ApiClientContext } from '../../services/apiClient';

interface Props {
  documents: Document[];
}

const DocumentTable = ({ documents }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { hasUserPermission } = useAuthentication();

  const [deleteDocument, { isSuccess: isDeleteSuccess }] =
    apiClient.useDeleteDocumentMutation();

  const { openDocument } = useDocument();

  return (
    <div data-testid="document-table">
      <AppToast
        open={isDeleteSuccess}
        description="Le document a bien été supprimé."
      />
      <Table
        noCaption
        headers={['', 'Nom', 'Date de création', '']}
        data={documents.map((document) => [
          <div>
            {hasUserPermission('deleteDocument') && (
              <RemoveDocument
                document={document}
                onRemoveDocument={async () => {
                  await deleteDocument(document.id);
                }}
                key={`remove-${document.id}`}
              />
            )}
          </div>,
          document.filename,
          format(document.createdAt, 'dd/MM/yy HH:mm:ss'),
          <Button
            priority="tertiary no outline"
            onClick={() => openDocument(document.id)}
            children="Consulter"
            iconId="fr-icon-arrow-right-line"
            iconPosition="right"
          />
        ])}
      />
    </div>
  );
};

export default DocumentTable;
