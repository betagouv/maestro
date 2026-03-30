import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import Select from '@codegouvfr/react-dsfr/Select';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { intersection, uniq } from 'lodash-es';
import { Brand } from 'maestro-shared/constants';
import type { DocumentChecked } from 'maestro-shared/schema/Document/Document';
import {
  DocumentKindLabels,
  ResourceDocumentKindList
} from 'maestro-shared/schema/Document/DocumentKind';
import { useContext, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import ressources from 'src/assets/illustrations/ressources.svg';
import { AppPage } from 'src/components/_app/AppPage/AppPage';
import AppToast from 'src/components/_app/AppToast/AppToast';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { AuthenticatedAppRoutes } from '../../AppRoutes';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import { ApiClientContext } from '../../services/apiClient';
import DocumentListTabContent from './DocumentListTabContent/DocumentListTabContent';

const noteModal = createModal({
  id: `note-modal`,
  isOpenedByDefault: false
});

const removeModal = createModal({
  id: `remove-modal`,
  isOpenedByDefault: false
});

const DocumentListView = () => {
  const apiClient = useContext(ApiClientContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasUserPermission } = useAuthentication();

  const selectedYear = searchParams.get('year')
    ? Number(searchParams.get('year'))
    : undefined;
  const selectedPlanIds = searchParams.get('programmingPlanIds')
    ? (searchParams.get('programmingPlanIds')! as string).split(',')
    : undefined;

  const { data: programmingPlans } = apiClient.useFindProgrammingPlansQuery({});

  const yearOptions = useMemo(
    () =>
      uniq((programmingPlans ?? []).map((p) => p.year)).sort((a, b) => b - a),
    [programmingPlans]
  );

  const plansForSelectedYear = useMemo(
    () =>
      selectedYear
        ? (programmingPlans ?? []).filter((p) => p.year === selectedYear)
        : (programmingPlans ?? []),
    [programmingPlans, selectedYear]
  );

  const changeFilter = (year?: number, planIds?: string[]) => {
    const params = new URLSearchParams();
    if (year) {
      params.set('year', String(year));
    }
    if (planIds?.length) {
      params.set('programmingPlanIds', planIds.join(','));
    }
    setSearchParams(params, { replace: true });
  };

  const changeYear = (year?: number) => {
    const plansForYear = year
      ? (programmingPlans ?? []).filter((p) => p.year === year)
      : (programmingPlans ?? []);
    const filteredPlanIds = intersection(
      selectedPlanIds,
      plansForYear.map((p) => p.id)
    );
    changeFilter(year, filteredPlanIds.length ? filteredPlanIds : undefined);
  };

  const { data: resources } = apiClient.useFindResourcesQuery({
    year: selectedYear,
    programmingPlanIds: selectedPlanIds
  });

  const [, { isSuccess: isCreateSuccess }] =
    apiClient.useCreateDocumentMutation({
      fixedCacheKey: 'createDocument'
    });
  const [, { isSuccess: isUpdateSuccess }] =
    apiClient.useUpdateDocumentMutation({
      fixedCacheKey: 'updateDocument'
    });
  const [deleteDocument, { isSuccess: isDeleteSuccess }] =
    apiClient.useDeleteDocumentMutation({
      fixedCacheKey: 'deleteDocument'
    });

  const [currentDocument, setCurrentDocument] = useState<DocumentChecked>();

  const onViewNotes = (document: DocumentChecked) => {
    setCurrentDocument(document);
    setTimeout(() => noteModal.open(), 100);
  };
  const onRemove = (document: DocumentChecked) => {
    setCurrentDocument(document);
    removeModal.open();
  };

  useIsModalOpen(noteModal, {
    onConceal: () => setCurrentDocument(undefined)
  });
  useIsModalOpen(removeModal, {
    onConceal: () => setCurrentDocument(undefined)
  });

  const hasFilters =
    selectedYear !== undefined || (selectedPlanIds?.length ?? 0) > 0;

  const planLabel = (planId: string) => {
    const plan = programmingPlans?.find((p) => p.id === planId);
    if (!plan) {
      return planId;
    }
    return `${plan.title} ${plan.year}`;
  };

  return (
    <>
      <AppToast
        open={isCreateSuccess}
        description="Ressource déposée avec succès."
      />
      <AppToast
        open={isUpdateSuccess}
        description="Ressource mise à jour avec succès."
      />
      <AppToast
        open={isDeleteSuccess}
        description="Ressource supprimée avec succès."
      />
      <AppPage
        title="Ressources"
        subtitle={`Consultez les ressources mises à disposition des utilisateurs de ${Brand}`}
        illustration={ressources}
        documentTitle="Liste des documents ressources"
        action={
          hasUserPermission('createResource') && (
            <Button
              linkProps={{ to: AuthenticatedAppRoutes.NewDocumentRoute.link }}
              priority="secondary"
              data-testid="add-document"
            >
              Ajouter un document
            </Button>
          )
        }
      >
        <div className={clsx('white-container', cx('fr-px-5w', 'fr-py-3w'))}>
          <div className="d-flex-align-start">
            <div>
              <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
                <div className={cx('fr-col-12', 'fr-col-md-6')}>
                  <Select
                    label="Année"
                    nativeSelectProps={{
                      value: selectedYear ?? '',
                      onChange: (e) =>
                        changeYear(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                    }}
                  >
                    <option value="">Toutes les années</option>
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className={cx('fr-col-12', 'fr-col-md-6')}>
                  <Select
                    label="Plan de programmation"
                    nativeSelectProps={{
                      value: '',
                      onChange: (e) => {
                        const id = e.target.value;
                        if (id && !selectedPlanIds?.includes(id)) {
                          changeFilter(selectedYear, [
                            ...(selectedPlanIds ?? []),
                            id
                          ]);
                        }
                      }
                    }}
                  >
                    <option value="">
                      {selectedPlanIds?.length
                        ? `${selectedPlanIds.length} sélectionné(s)`
                        : 'Tous les plans'}
                    </option>
                    {plansForSelectedYear
                      .filter((p) => !selectedPlanIds?.includes(p.id))
                      .map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.title} {plan.year}
                        </option>
                      ))}
                  </Select>
                </div>
              </div>
              {hasFilters && (
                <div
                  className={clsx('d-flex-align-start', cx('fr-mt-3w'))}
                  style={{ flexDirection: 'column' }}
                >
                  <span
                    className={cx('fr-text--light', 'fr-text--sm', 'fr-mb-0')}
                  >
                    Filtres actifs
                  </span>
                  <div className={cx('fr-mt-3v')}>
                    {selectedYear && (
                      <Tag
                        nativeButtonProps={{
                          onClick: () =>
                            changeFilter(undefined, selectedPlanIds)
                        }}
                        dismissible
                        small
                        className={clsx(cx('fr-mb-1v'), 'align-left')}
                      >
                        {selectedYear}
                      </Tag>
                    )}
                    {(selectedPlanIds ?? []).map((id) => (
                      <Tag
                        key={id}
                        nativeButtonProps={{
                          onClick: () =>
                            changeFilter(
                              selectedYear,
                              selectedPlanIds?.filter((p) => p !== id)
                            )
                        }}
                        dismissible
                        small
                        className={clsx(cx('fr-mb-1v'), 'align-left')}
                      >
                        {planLabel(id)}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          className={clsx(
            'white-container',
            cx('fr-px-5w', 'fr-py-3w', 'fr-mt-2w')
          )}
        >
          <Tabs
            tabs={[
              {
                label: 'Toutes les ressources',
                content: (
                  <DocumentListTabContent
                    resources={resources ?? []}
                    onViewDocumentNotes={onViewNotes}
                    onRemoveDocument={onRemove}
                    newDocumentId={searchParams.get('documentId')}
                  />
                )
              },
              ...ResourceDocumentKindList.map((kind) => ({
                label: DocumentKindLabels[kind],
                content: (
                  <DocumentListTabContent
                    resources={resources ?? []}
                    documentKind={kind}
                    onViewDocumentNotes={onViewNotes}
                    onRemoveDocument={onRemove}
                    newDocumentId={searchParams.get('documentId')}
                  />
                )
              }))
            ]}
          />
        </div>
        <noteModal.Component
          title="Notes sur la ressource"
          concealingBackdrop={false}
          topAnchor
        >
          {currentDocument?.notes}
        </noteModal.Component>
        <ConfirmationModal
          modal={removeModal}
          title="Supprimer un document"
          onConfirm={async () => {
            if (currentDocument) {
              await deleteDocument(currentDocument.id);
            }
          }}
          confirmLabel="Supprimer"
          closeOnConfirm
        >
          Êtes-vous sûr de vouloir supprimer cette ressource ?
        </ConfirmationModal>
      </AppPage>
    </>
  );
};

export default DocumentListView;
