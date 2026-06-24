import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import type { DocumentChecked } from 'maestro-shared/schema/Document/Document';
import { DocumentKindLabels } from 'maestro-shared/schema/Document/DocumentKind';
import { formatDate } from 'maestro-shared/utils/date';
import DocumentLink from '../../components/DocumentLink/DocumentLink';
import { useAuthentication } from '../../hooks/useAuthentication';

interface Props {
  documents: DocumentChecked[];
  onViewDocumentNotes: (document: DocumentChecked) => void;
  onRemoveDocument: (document: DocumentChecked) => void;
}

const DocumentTable = ({
  documents,
  onViewDocumentNotes,
  onRemoveDocument
}: Props) => {
  const { hasUserPermission } = useAuthentication();

  if (!documents || documents.length === 0) {
    return null;
  }

  return (
    <div data-testid="document-table">
      <Table
        noCaption
        headers={['Catégorie', 'Nom', 'Document', 'Actions']}
        fixed={true}
        data={documents.map((document) => [
          DocumentKindLabels[document.kind],
          <div key={`${document.id}-name`}>
            {document.filename}
            <div className={cx('fr-hint-text')}>
              Version du {formatDate(document.createdAt)}
            </div>
          </div>,
          <div
            key={`${document.id}-createdAt`}
            className={cx('fr-text--regular')}
          >
            <DocumentLink
              documentId={document.id}
              scope={{ type: 'resource' }}
            />
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
          </div>
        ])}
      />
    </div>
  );
};

export default DocumentTable;
