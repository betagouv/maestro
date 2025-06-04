import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { skipToken } from '@reduxjs/toolkit/query';
import { useContext } from 'react';
import { Link } from 'react-router';
import { useDocument } from '../../hooks/useDocument';
import { ApiClientContext } from '../../services/apiClient';

interface Props {
  documentId?: string;
}

const DocumentLink = ({ documentId }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { openDocument } = useDocument();

  const { data: document } = apiClient.useGetDocumentQuery(
    documentId ?? skipToken
  );

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
      className={cx('fr-link--download', 'fr-link')}
    >
      {document.filename}
    </Link>
  );
};

export default DocumentLink;
