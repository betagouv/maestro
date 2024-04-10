import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { t } from 'i18next';
import AutoClose from 'src/components/AutoClose/AutoClose';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import {
  useCreateDocumentMutation,
  useFindDocumentsQuery,
} from 'src/services/document.service';
import AddDocument from 'src/views/DocumentListView/AddDocument';
import DocumentTable from 'src/views/DocumentListView/DocumentTable';

const DocumentListView = () => {
  useDocumentTitle('Liste des documents');

  const { hasPermission } = useAuthentication();

  const { data: documents } = useFindDocumentsQuery();
  const [, { isSuccess: isCreateSuccess }] = useCreateDocumentMutation({
    fixedCacheKey: 'createDocument',
  });

  return (
    <section className={cx('fr-py-6w')}>
      {isCreateSuccess && (
        <AutoClose>
          <div className="toast">
            <Alert
              severity="success"
              small={true}
              description="Document déposé avec succès."
              closable
            />
          </div>
        </AutoClose>
      )}
      <h1>Liste des documents</h1>
      <div className={cx('fr-mb-4w')}>
        {t('document', { count: documents?.length || 0 })}
      </div>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-7', 'fr-col-offset-1--right')}>
          {documents && documents.length > 0 && (
            <DocumentTable documents={documents} />
          )}
        </div>
        {hasPermission('createDocument') && (
          <div className={cx('fr-col-4')}>
            <AddDocument key={`add-document-${isCreateSuccess}`} />
          </div>
        )}
      </div>
    </section>
  );
};

export default DocumentListView;
