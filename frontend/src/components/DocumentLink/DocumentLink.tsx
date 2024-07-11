import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { skipToken } from '@reduxjs/toolkit/query';
import { Link } from 'react-router-dom';
import { useDocument } from 'src/hooks/useDocument';
import { useGetDocumentQuery } from 'src/services/document.service';

interface Props {
  documentId?: string;
}

const DocumentLink = ({ documentId }: Props) => {
  const { openDocument } = useDocument();

  const { data: document } = useGetDocumentQuery(documentId ?? skipToken);

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
      <span className={cx('fr-icon-download-line', 'fr-ml-1w')}></span>
    </Link>
  );
};

export default DocumentLink;
