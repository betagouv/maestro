import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { skipToken } from '@reduxjs/toolkit/query';
import { Link } from 'react-router-dom';
import { ApiClient } from '../../services/apiClient';
import { useDocument } from '../../hooks/useDocument';

interface Props {
  documentId?: string;
  apiClient: Pick<ApiClient, 'useGetDocumentQuery' | 'useLazyGetDocumentDownloadSignedUrlQuery'>
}

const DocumentLink = ({ documentId, apiClient }: Props) => {
  const { openDocument } = useDocument(apiClient);

  const { data: document } = apiClient.useGetDocumentQuery(documentId ?? skipToken);

  if (!document) {
    return <></>;
  }

  return (
    <Link
      onClick={async (e) => {
        e.preventDefault();
        await openDocument(document.id);
      }}
      to="#"
    >
      {document.filename}
      <span
        className={cx('fr-icon-download-line', 'fr-ml-1w', 'fr-icon--sm')}
      ></span>
    </Link>
  );
};

export default DocumentLink;
