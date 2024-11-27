import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Skeleton } from '@mui/material';
import clsx from 'clsx';
import { t } from 'i18next';
import ressources from 'src/assets/illustrations/ressources.svg';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import AppToast from 'src/components/_app/AppToast/AppToast';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useOnLine } from 'src/hooks/useOnLine';
import {
  useCreateDocumentMutation,
  useFindResourcesQuery,
} from 'src/services/document.service';
import AddDocument from 'src/views/DocumentListView/AddDocument';
import DocumentTable from 'src/views/DocumentListView/DocumentTable';
const DocumentListView = () => {
  useDocumentTitle('Liste des resources ressources');
  const { isOnline } = useOnLine();

  const { hasPermission } = useAuthentication();

  const { data: resources } = useFindResourcesQuery();
  const [, { isSuccess: isCreateSuccess }] = useCreateDocumentMutation({
    fixedCacheKey: 'createDocument',
  });

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <AppToast
        open={isCreateSuccess}
        description="Ressources déposée avec succès."
      />
      <SectionHeader
        title="Ressources"
        subtitle="Consultez les ressources mises à disposition des utilisateurs de maestro"
        illustration={ressources}
      />

      {isOnline ? (
        <div className={clsx('white-container', cx('fr-px-5w', 'fr-py-3w'))}>
          <div className={cx('fr-mb-4w')}>
            {t('document', { count: resources?.length || 0 })}
          </div>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-7', 'fr-col-offset-1--right')}>
              {resources && resources.length > 0 && (
                <DocumentTable documents={resources} />
              )}
            </div>
            {hasPermission('createResource') && (
              <div className={cx('fr-col-4')}>
                <AddDocument key={`add-document-${isCreateSuccess}`} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <Skeleton variant="rectangular" width="100%" height={400} />
      )}
    </section>
  );
};

export default DocumentListView;
