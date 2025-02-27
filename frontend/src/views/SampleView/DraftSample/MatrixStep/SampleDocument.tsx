import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import clsx from 'clsx';
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
    <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
      <div className={cx('fr-col-12', 'fr-col-sm-3')}>
        <img
          src={documentUrl}
          alt={document.filename}
          width="100%"
          style={{ maxWidth: '200px' }}
        />
      </div>
      <div
        className={cx('fr-col-12', 'fr-col-sm-6', 'fr-col-md-6', 'fr-col-lg-4')}
      >
        <Link
          onClick={async (e) => {
            e.preventDefault();
            window.open(documentUrl);
          }}
          to="#"
          className={cx('fr-link', 'fr-mt-1w')}
        >
          {cropFileName(document.filename, 25)}
          <span
            className={cx('fr-icon-eye-line', 'fr-ml-1w', 'fr-icon--sm')}
          ></span>
        </Link>
        <Button
          title="Supprimer"
          onClick={async (e) => {
            e.preventDefault();
            await onRemove(documentId);
          }}
          iconId="fr-icon-delete-line"
          priority="tertiary"
          className={clsx(cx('fr-hidden-sm', 'fr-mb-3w'), 'float-right')}
        />
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
      <div
        className={clsx(
          cx('fr-col-sm-3', 'fr-col-md-3', 'fr-col-lg-5', 'fr-mt-5w'),
          'd-sm-none'
        )}
      >
        <Button
          title="Supprimer"
          onClick={async (e) => {
            e.preventDefault();
            await onRemove(documentId);
          }}
          iconId="fr-icon-delete-line"
          priority="tertiary"
          className="float-right"
        />
      </div>
    </div>
  );
};

export default SampleDocument;
