import type { FrIconClassName } from '@codegouvfr/react-dsfr';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { useContext } from 'react';
import { Link } from 'react-router';
import { type DocumentScope, useDocument } from '../../hooks/useDocument';
import { ApiClientContext } from '../../services/apiClient';

interface Props {
  documentId?: string;
  scope: DocumentScope;
  iconId?: FrIconClassName;
}

const DocumentLink = ({ documentId, scope, iconId }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { openDocument } = useDocument();

  const { data: resourceDocument } = apiClient.useGetResourceDocumentQuery(
    { documentId: documentId ?? '' },
    { skip: !documentId || scope.type !== 'resource' }
  );
  const { data: sampleDocument } = apiClient.useGetSampleDocumentQuery(
    {
      sampleId: scope.type === 'sample' ? scope.sampleId : '',
      documentId: documentId ?? ''
    },
    { skip: !documentId || scope.type !== 'sample' }
  );
  const document = scope.type === 'sample' ? sampleDocument : resourceDocument;

  if (!document) {
    return null;
  }

  return (
    <Link
      onClick={async (e) => {
        e.preventDefault();
        await openDocument(document.id, scope);
      }}
      to="#"
      className={cx('fr-link')}
    >
      {document.filename}
      <span
        className={cx(iconId ?? 'fr-link--download', 'fr-ml-1w', 'fr-icon--sm')}
      ></span>
    </Link>
  );
};

export default DocumentLink;
