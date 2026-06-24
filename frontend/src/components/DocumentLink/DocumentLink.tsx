import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { useContext } from 'react';
import { Link } from 'react-router';
import { ApiClientContext } from '../../services/apiClient';
import {
  type DocumentScope,
  getDocumentDownloadURL
} from '../../services/document.service';

interface Props {
  documentId?: string;
  scope: DocumentScope;
}

const DocumentLink = ({ documentId, scope }: Props) => {
  const apiClient = useContext(ApiClientContext);

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
      to={getDocumentDownloadURL(document.id, scope)}
      target="_blank"
      rel="noreferrer"
      className={cx('fr-link')}
    >
      {document.filename}
    </Link>
  );
};

export default DocumentLink;
