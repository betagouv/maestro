import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { skipToken } from '@reduxjs/toolkit/query';
import clsx from 'clsx';
import { PartialAnalysis } from 'maestro-shared/schema/Analysis/Analysis';
import { FunctionComponent, useContext, useMemo, useRef } from 'react';
import { Link } from 'react-router';
import { assert, Equals } from 'tsafe';
import ConfirmationModal from '../../../../components/ConfirmationModal/ConfirmationModal';
import DocumentLink from '../../../../components/DocumentLink/DocumentLink';
import { useDocument } from '../../../../hooks/useDocument';
import { ApiClientContext } from '../../../../services/apiClient';
import { pluralize } from '../../../../utils/stringUtils';
import { AnalysisDocumentModal } from './AnalysisDocumentModal';

type Props = {
  partialAnalysis: PartialAnalysis | undefined;
  sampleId: string;
  readonly: boolean;
};

const addFileModal = createModal({
  id: `add-file-modale-id`,
  isOpenedByDefault: false
});

export const AnalysisDocumentPreview: FunctionComponent<Props> = ({
  partialAnalysis,
  sampleId,
  readonly,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();
  const { useGetAnalysisReportDocumentIdsQuery } = useContext(ApiClientContext);
  const { openDocument } = useDocument();

  const { data: reportDocumentIds } = useGetAnalysisReportDocumentIdsQuery(
    partialAnalysis?.id ?? skipToken
  );

  return (
    <div
      className={cx(
        'fr-grid-row',
        'fr-grid-row--gutters',
        'fr-grid-row--bottom'
      )}
    >
      <div className={clsx(cx('fr-col-6'))}>
        <div className={cx('fr-mb-1v')}>
          {pluralize(reportDocumentIds?.length ?? 0)("Rapport d'analyse")}
          {reportDocumentIds?.length ? ` (${reportDocumentIds.length})` : ''}
        </div>
        {reportDocumentIds?.length ? (
          <Link
            to="#"
            className={cx('fr-link', 'fr-link--sm')}
            onClick={async (e) => {
              e.preventDefault();
              await openDocument(reportDocumentIds[0]);
            }}
          >
            Consulter le dernier rapport
            <span className={cx('fr-icon-eye-line', 'fr-link--icon-right')} />
          </Link>
        ) : (
          <span className={cx('fr-ml-1w')}>Aucun rapport disponible</span>
        )}
      </div>
      {!readonly && (
        <div className={clsx(cx('fr-col-6'))}>
          <Button
            priority="tertiary"
            iconId="fr-icon-file-add-line"
            size="small"
            type={'button'}
            onClick={() => {
              addFileModal.open();
            }}
          >
            {reportDocumentIds?.length
              ? 'Actualiser le rapport'
              : 'Ajouter le rapport'}
          </Button>
          {partialAnalysis && reportDocumentIds?.length && (
            <ReportDocumentList
              sampleId={sampleId}
              readonly={readonly}
              analysisId={partialAnalysis.id}
              reportDocumentIds={reportDocumentIds}
            />
          )}
        </div>
      )}
      <AnalysisDocumentModal
        modal={addFileModal}
        sampleId={sampleId}
        partialAnalysis={partialAnalysis}
      />
    </div>
  );
};

const ReportDocumentList = ({
  sampleId,
  readonly,
  analysisId,
  reportDocumentIds
}: Pick<Props, 'readonly' | 'sampleId'> & {
  analysisId: string;
  reportDocumentIds: string[];
}) => {
  const { useDeleteAnalysisReportDocumentMutation } =
    useContext(ApiClientContext);

  const [deleteDocument] = useDeleteAnalysisReportDocumentMutation();

  const documentIdToDelete = useRef<null | string>(null);

  const onDeleteDocument = async () => {
    if (documentIdToDelete.current) {
      await deleteDocument({
        analysisId,
        sampleId,
        documentId: documentIdToDelete.current
      });
      documentIdToDelete.current = null;
    }
  };
  const deleteReportDocumentConfirmationModal = useMemo(
    () =>
      createModal({
        id: `confirm-delete-report-document-${analysisId}`,
        isOpenedByDefault: false
      }),
    [analysisId]
  );

  const historyModal = useMemo(
    () =>
      createModal({
        id: `history-report-document-${analysisId}`,
        isOpenedByDefault: false
      }),
    [analysisId]
  );

  return (
    <>
      {reportDocumentIds.length > 1 && (
        <>
          <Button
            className={cx('fr-ml-1w')}
            priority="tertiary"
            iconId="fr-icon-time-line"
            size="small"
            type="button"
            onClick={() => {
              historyModal.open();
            }}
          >
            Historique
          </Button>
          <historyModal.Component
            title="Historique des rapports d'analyse"
            size="large"
          >
            <div
              className={'d-flex-align-start'}
              style={{ flexDirection: 'column', gap: '1rem' }}
            >
              {reportDocumentIds.map((id) => (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '1.5rem',
                    width: '100%'
                  }}
                  key={id}
                >
                  <span>
                    <DocumentLink documentId={id} />
                  </span>
                  {!readonly && (
                    <Button
                      className={clsx(cx('fr-ml-auto'))}
                      iconId="fr-icon-delete-line"
                      size={'small'}
                      priority={'tertiary'}
                      title={'Supprimer'}
                      onClick={() => {
                        documentIdToDelete.current = id;
                        deleteReportDocumentConfirmationModal.open();
                      }}
                    ></Button>
                  )}
                </span>
              ))}
            </div>
          </historyModal.Component>
          <ConfirmationModal
            modal={deleteReportDocumentConfirmationModal}
            title="Confirmez la suppression du rapport d'analyse"
            onConfirm={onDeleteDocument}
            closeOnConfirm
          >
            Attention le rapport d'analyse sera supprimé définitivement.
          </ConfirmationModal>
        </>
      )}
    </>
  );
};
