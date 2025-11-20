import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Document } from 'maestro-shared/schema/Document/Document';
import { DocumentKindLabels } from 'maestro-shared/schema/Document/DocumentKind';
import { useDocument } from 'src/hooks/useDocument';
import DocumentLink from '../../components/DocumentLink/DocumentLink';
import { useAuthentication } from '../../hooks/useAuthentication';

interface Props {
  documents: Document[];
  onViewDocumentNotes: (document: Document) => void;
  onRemoveDocument: (document: Document) => void;
}

const DocumentTable = ({
  documents,
  onViewDocumentNotes,
  onRemoveDocument
}: Props) => {
  const { hasUserPermission } = useAuthentication();
  const { downloadDocument } = useDocument();

  if (!documents || documents.length === 0) {
    return <></>;
  }

  return (
    <div data-testid="document-table">
      <Table
        noCaption
        headers={['Catégorie', 'Nom', 'Document', 'Actions']}
        data={documents.map((document) => [
          DocumentKindLabels[document.kind],
          <div key={`${document.id}-name`}>
            {document.filename}
            <div className={cx('fr-hint-text')}>
              Version du{' '}
              {format(document.createdAt, 'dd MMMM yyyy', {
                locale: fr
              })}
            </div>
          </div>,
          <div
            key={`${document.id}-createdAt`}
            className={cx('fr-text--regular')}
          >
            <DocumentLink documentId={document.id} iconId="fr-icon-eye-line" />
          </div>,
          <div key={`${document.id}-actions`}>
            {hasUserPermission('createResource') && (
              <Button
                iconId="fr-icon-edit-line"
                title="Modifier le document"
                linkProps={{
                  to: `/documents/${document.id}`
                }}
                priority="tertiary"
                size="small"
              />
            )}
            {hasUserPermission('deleteDocument') && (
              <Button
                iconId="fr-icon-delete-line"
                title="Supprimer le document"
                priority="tertiary"
                size="small"
                onClick={() => onRemoveDocument(document)}
                className={'fr-ml-1w'}
              />
            )}
            <Button
              title="Voir les notes"
              iconId="fr-icon-chat-3-line"
              priority="tertiary"
              size="small"
              className={cx('fr-ml-1w')}
              onClick={() => onViewDocumentNotes(document)}
              disabled={!document.notes}
            />
            <Button
              title="Télécharger"
              iconId="fr-icon-download-line"
              priority="tertiary"
              size="small"
              className={cx('fr-ml-1w')}
              onClick={async () => {
                await downloadDocument(document.id, document.filename);
              }}
            />
          </div>
        ])}
      />
    </div>
  );
};

export default DocumentTable;
