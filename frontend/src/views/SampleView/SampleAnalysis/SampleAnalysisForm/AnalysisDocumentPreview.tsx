import Accordion from '@codegouvfr/react-dsfr/Accordion';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { PartialAnalysis } from 'maestro-shared/schema/Analysis/Analysis';
import { FunctionComponent, useContext, useMemo, useRef } from 'react';
import { assert, Equals } from 'tsafe';
import ConfirmationModal from '../../../../components/ConfirmationModal/ConfirmationModal';
import DocumentLink from '../../../../components/DocumentLink/DocumentLink';
import { ApiClientContext } from '../../../../services/apiClient';
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

  return (
    <div
      className={clsx(
        cx('fr-py-3w', 'fr-px-5w'),
        'border',
        'd-flex-align-start',
        'fr-grid-row'
      )}
    >
      <div className={clsx(cx('fr-col'))}>
        <h6 className={clsx(cx('fr-pl-1w', 'fr-m-0'))}>
          Document du rapport d’analyse
        </h6>
      </div>
      {!readonly && (
        <div className={clsx(cx('fr-ml-auto'))}>
          <Button
            priority="secondary"
            iconId="fr-icon-add-line"
            size="small"
            type={'button'}
            onClick={() => {
              addFileModal.open();
            }}
          >
            Ajouter
          </Button>
        </div>
      )}
      <div className={clsx(cx('fr-col-12'))}>
        {!!partialAnalysis?.id && (
          <ReportDocumentList
            sampleId={sampleId}
            readonly={readonly}
            analysisId={partialAnalysis.id}
          />
        )}
      </div>
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
  analysisId
}: Pick<Props, 'readonly' | 'sampleId'> & { analysisId: string }) => {
  const {
    useGetAnalysisReportDocumentIdsQuery,
    useDeleteAnalysisReportDocumentMutation
  } = useContext(ApiClientContext);
  const { data: reportDocumentIds } =
    useGetAnalysisReportDocumentIdsQuery(analysisId);

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

  return (
    <>
      {!!reportDocumentIds?.length && (
        <div className={cx('fr-pl-1w')}>
          <DocumentLink documentId={reportDocumentIds[0]} />
          {reportDocumentIds.length > 1 && (
            <Accordion
              className={cx('fr-mb-3w')}
              label={`Historique des rapports (${reportDocumentIds.length - 1})`}
            >
              <div
                className={'d-flex-align-start'}
                style={{ flexDirection: 'column' }}
              >
                {reportDocumentIds.map((id, index) => {
                  if (index === 0) {
                    return null;
                  }
                  return (
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
                      <ConfirmationModal
                        modal={deleteReportDocumentConfirmationModal}
                        title="Confirmez la suppression du rapport d'analyse"
                        onConfirm={onDeleteDocument}
                        closeOnConfirm
                      >
                        Attention le rapport d'analyse sera supprimé
                        définitivement.
                      </ConfirmationModal>
                    </span>
                  );
                })}
              </div>
            </Accordion>
          )}
        </div>
      )}
    </>
  );
};
