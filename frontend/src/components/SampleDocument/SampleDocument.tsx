import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import clsx from 'clsx';
import { useContext } from 'react';
import { Link } from 'react-router';
import { ApiClientContext } from '../../services/apiClient';
import { cropFileName, quote } from '../../utils/stringUtils';
interface Props {
  documentId: string;
  readonly?: boolean;
  onRemove?: (documentId: string) => Promise<void>;
}

const SampleDocument = ({ documentId, readonly, onRemove }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { data: document } = apiClient.useGetDocumentQuery(documentId);

  const { data: documentUrl } =
    apiClient.useGetDocumentDownloadSignedUrlQuery(documentId);

  const [updateDocument] = apiClient.useUpdateDocumentMutation();

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
        {onRemove && !readonly && (
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
        )}
        {!readonly && (
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
        )}
        {readonly && document.legend && (
          <div>
            <b>{quote(document.legend)}</b>
          </div>
        )}
      </div>
      {onRemove && !readonly && (
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
      )}
    </div>
  );
};

export default SampleDocument;
