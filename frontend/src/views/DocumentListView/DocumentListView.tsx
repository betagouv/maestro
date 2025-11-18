import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Skeleton } from '@mui/material';
import clsx from 'clsx';
import { t } from 'i18next';
import { Brand } from 'maestro-shared/constants';
import { useContext } from 'react';
import ressources from 'src/assets/illustrations/ressources.svg';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import AppToast from 'src/components/_app/AppToast/AppToast';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useOnLine } from 'src/hooks/useOnLine';
import DocumentTable from 'src/views/DocumentListView/DocumentTable';
import { ApiClientContext } from '../../services/apiClient';
const DocumentListView = () => {
  const apiClient = useContext(ApiClientContext);
  useDocumentTitle('Liste des documents ressources');
  const { isOnline } = useOnLine();

  const { hasUserPermission } = useAuthentication();

  const { data: resources } = apiClient.useFindResourcesQuery();
  const [, { isSuccess: isCreateSuccess }] =
    apiClient.useCreateDocumentMutation({
      fixedCacheKey: 'createDocument'
    });

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <AppToast
        open={isCreateSuccess}
        description="Ressource déposée avec succès."
      />
      <SectionHeader
        title="Ressources"
        subtitle={`Consultez les ressources mises à disposition des utilisateurs de ${Brand}`}
        illustration={ressources}
        action={
          hasUserPermission('createResource') && (
            <Button
              linkProps={{
                to: '/documents/nouveau'
              }}
              priority="secondary"
            >
              Ajouter un document
            </Button>
          )
        }
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
          </div>
        </div>
      ) : (
        <Skeleton variant="rectangular" width="100%" height={400} />
      )}
    </section>
  );
};

export default DocumentListView;
