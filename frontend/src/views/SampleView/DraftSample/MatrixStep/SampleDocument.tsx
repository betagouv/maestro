import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import { Link } from 'react-router-dom';
import {
  useGetDocumentDownloadSignedUrlQuery,
  useGetDocumentQuery,
  useUpdateDocumentMutation
} from '../../../../services/document.service';
import { cropFileName } from '../../../../utils/stringUtils';

interface Props {
  documentId: string;
  onRemove: (documentId: string) => Promise<void>;
}

const SampleDocument = ({ documentId, onRemove }: Props) => {
  const { data: document } = useGetDocumentQuery(documentId);

  const { data: documentUrl } =
    useGetDocumentDownloadSignedUrlQuery(documentId);

  const [updateDocument] = useUpdateDocumentMutation();

  if (!document) {
    return <></>;
  }

  return (
    <div className="d-flex-align-center">
      <div className="d-flex-align-start flex-grow-1">
        <img src={documentUrl} alt={document.filename} width={200} />
        <div className={cx('fr-ml-3w')}>
          <Link
            onClick={async (e) => {
              e.preventDefault();
              window.open(documentUrl);
            }}
            to="#"
            className={cx('fr-link')}
          >
            {cropFileName(document.filename, 25)}
            <span
              className={cx('fr-icon-eye-line', 'fr-ml-1w', 'fr-icon--sm')}
            ></span>
          </Link>
          <Input
            label=""
            textArea
            nativeTextAreaProps={{
              placeholder: 'Légende',
              defaultValue: document.legend || '',
              onChange: (e) => {
                e.preventDefault();
                updateDocument({ documentId, legend: e.target.value });
              },
              rows: 1
            }}
            className={cx('fr-mt-2w')}
          />
        </div>
      </div>
      <Button
        title="Supprimer"
        onClick={async (e) => {
          e.preventDefault();
          await onRemove(documentId);
        }}
        iconId="fr-icon-delete-line"
        priority="tertiary"
      />
    </div>
  );
};

export default SampleDocument;
