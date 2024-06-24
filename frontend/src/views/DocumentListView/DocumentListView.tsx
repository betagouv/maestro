import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { t } from 'i18next';
import ressources from 'src/assets/illustrations/ressources.svg';
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
  useDocumentTitle('Liste des documents ressources');

  const { hasPermission } = useAuthentication();

  const { data: documents } = useFindDocumentsQuery();
  const [, { isSuccess: isCreateSuccess }] = useCreateDocumentMutation({
    fixedCacheKey: 'createDocument',
  });

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
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
      <div className="section-header">
        <img src={ressources} height="100%" aria-hidden alt="" />
        <div>
          <h1>Ressources</h1>
          <div
            className={cx(
              'fr-text--lg',
              'fr-text--regular',
              'fr-hint-text',
              'fr-mb-0'
            )}
          >
            Consultez les ressources mises à disposition des utilisateurs de
            maestro
          </div>
        </div>
      </div>

      <div className={clsx('white-container', cx('fr-px-5w', 'fr-py-3w'))}>
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
      </div>
    </section>
  );
};

export default DocumentListView;
