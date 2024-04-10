import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import Table from '@codegouvfr/react-dsfr/Table';
import { format } from 'date-fns';
import { Document } from 'shared/schema/Document/Document';
import AutoClose from 'src/components/AutoClose/AutoClose';
import { useAuthentication } from 'src/hooks/useAuthentication';
import {
  useDeleteDocumentMutation,
  useLazyGetDocumentDownloadSignedUrlQuery,
} from 'src/services/document.service';
import RemoveDocument from 'src/views/DocumentListView/RemoveDocument';

interface Props {
  documents: Document[];
}

const DocumentTable = ({ documents }: Props) => {
  const { hasPermission } = useAuthentication();

  const [getDocumentUrl] = useLazyGetDocumentDownloadSignedUrlQuery();
  const [deleteDocument, { isSuccess: isDeleteSuccess }] =
    useDeleteDocumentMutation();

  const openFile = async (documentId: string) => {
    const url = await getDocumentUrl(documentId).unwrap();
    window.open(url);
  };

  return (
    <>
      {isDeleteSuccess && (
        <AutoClose>
          <div className="toast">
            <Alert
              severity="success"
              small={true}
              description="Le document a bien été supprimé."
              closable
            />
          </div>
        </AutoClose>
      )}
      <Table
        noCaption
        headers={['', 'Nom', 'Date de création', '']}
        data={documents.map((document) => [
          <div>
            {hasPermission('deleteDocument') && (
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
            onClick={() => openFile(document.id)}
            children="Consulter"
            iconId="fr-icon-arrow-right-line"
            iconPosition="right"
          />,
        ])}
      />
    </>
  );
};

export default DocumentTable;
