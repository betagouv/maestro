import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import type { DocumentKind } from 'maestro-shared/schema/Document/DocumentKind';
import DocumentLink from 'src/components/DocumentLink/DocumentLink';

export const documentsModal = createModal({
  id: 'documents-modal',
  isOpenedByDefault: false
});

type Document = { id: string; filename: string; kind: DocumentKind };

interface Props {
  title?: string;
  documents: Document[];
  sampleId: string;
}

export const DocumentsModal = ({
  title = 'Documents liés',
  documents,
  sampleId
}: Props) => {
  return (
    <documentsModal.Component
      title={title}
      concealingBackdrop={false}
      topAnchor
      buttons={[
        {
          children: 'Fermer',
          doClosesModal: true,
          priority: 'secondary'
        }
      ]}
    >
      {documents.length > 0 ? (
        <ul className={cx('fr-raw-list')}>
          {documents.map((doc) => (
            <li key={doc.id}>
              <DocumentLink
                documentId={doc.id}
                scope={{ type: 'sample', sampleId }}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucun document.</p>
      )}
    </documentsModal.Component>
  );
};
