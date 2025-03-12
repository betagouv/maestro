import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { skipToken } from '@reduxjs/toolkit/query';
import { Link } from 'react-router-dom';
import { ApiClientContext } from '../../services/apiClient';
import { useDocument } from '../../hooks/useDocument';
import { useContext } from 'react';

interface Props {
  documentId?: string;
}

const DocumentLink = ({ documentId }: Props) => {
  const apiClient = useContext(ApiClientContext)
  const { openDocument } = useDocument();

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
