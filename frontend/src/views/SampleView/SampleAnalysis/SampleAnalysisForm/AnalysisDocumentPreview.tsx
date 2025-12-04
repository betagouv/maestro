import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { PartialAnalysis } from 'maestro-shared/schema/Analysis/Analysis';
import { FileInput } from 'maestro-shared/schema/File/FileInput';
import { FileType } from 'maestro-shared/schema/File/FileType';
import {
  FunctionComponent,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { assert, Equals } from 'tsafe';
import { z } from 'zod';
import AppUpload from '../../../../components/_app/AppUpload/AppUpload';
import ConfirmationModal from '../../../../components/ConfirmationModal/ConfirmationModal';
import DocumentLink from '../../../../components/DocumentLink/DocumentLink';
import { useForm } from '../../../../hooks/useForm';
import { ApiClientContext } from '../../../../services/apiClient';

type Props = {
  partialAnalysis: PartialAnalysis | undefined;
  sampleId: string;
  readonly: boolean;
};

export const AnalysisDocumentPreview: FunctionComponent<Props> = ({
  partialAnalysis,
  sampleId,
  readonly,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);

  const [
    createDocument,
    { isLoading: isCreateLoading, isError: isCreateError }
  ] = apiClient.useCreateDocumentMutation({
    fixedCacheKey: 'createDocument'
  });
  const [createAnalysis] = apiClient.useCreateAnalysisMutation();
  const [updateAnalysis] = apiClient.useUpdateAnalysisMutation();
  const [createAnalysisReportDocument] =
    apiClient.useCreateAnalysisReportDocumentMutation();

  const acceptFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png'
  ] as const satisfies FileType[];

  const [fileInput, setFileInput] = useState<File | undefined>();

  const form = useForm(
    z.object({
      fileInput: FileInput(acceptFileTypes).nullish()
    }),
    { fileInput }
  );

  const selectFile = async (e: any) => {
    e.preventDefault();
    setFileInput(e?.target?.files?.[0]);
  };

  useEffect(() => {
    if (fileInput) {
      form.validate(async (result) => {
        form.reset();

        const reportDocumentId = await createDocument({
          file: result.fileInput as File,
          kind: 'AnalysisReportDocument'
        })
          .unwrap()
          .then((document) => document.id);
        let analysisId = partialAnalysis?.id;
        if (!analysisId) {
          const { data: analysis } = await createAnalysis({
            sampleId
          });
          analysisId = analysis!.id;
        }
        if (analysisId) {
          await createAnalysisReportDocument({
            analysisId,
            documentId: reportDocumentId,
            sampleId
          });
          await updateAnalysis({
            compliance: null,
            notesOnCompliance: null,
            ...partialAnalysis,
            id: analysisId,
            sampleId,
            status: 'Residues'
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileInput]);

  return (
    <div
      className={clsx(
        cx('fr-py-3w', 'fr-px-5w'),
        'border',
        'd-flex-align-start',
        'fr-grid-row'
      )}
      style={{ gap: '2rem' }}
    >
      <div className={clsx(cx('fr-col'))}>
        <h6 className={clsx('d-flex-align-center', cx('fr-pl-1w'))}>
          <div className="flex-grow-1">Document du rapport d’analyse</div>
        </h6>
        {!!partialAnalysis?.id && (
          <ReportDocumentList
            sampleId={sampleId}
            readonly={readonly}
            analysisId={partialAnalysis.id}
          />
        )}
      </div>
      {!readonly && (
        <div
          className={clsx(
            cx('fr-p-2w', 'fr-col-12', 'fr-col-lg-4', 'fr-ml-auto'),
            'border'
          )}
        >
          <AppUpload
            nativeInputProps={{
              onChange: (event: any) => selectFile(event)
            }}
            className={clsx(cx('fr-pb-2w'))}
            disabled={isCreateLoading}
            inputForm={form}
            inputKey="fileInput"
            whenValid="fichier valide"
            acceptFileTypes={acceptFileTypes}
          />

          {isCreateError && (
            <Alert
              className={cx('fr-mb-2w')}
              description={<>Le dépôt de fichier a échoué.</>}
              severity="error"
              small
            />
          )}
        </div>
      )}
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
          {reportDocumentIds.length === 1 ? (
            <DocumentLink documentId={reportDocumentIds[0]} />
          ) : (
            <div
              className={'d-flex-align-start'}
              style={{ flexDirection: 'column' }}
            >
              <span className={cx('fr-text--sm', 'fr-text--bold')}>
                Dernière version du rapport
              </span>
              <span>
                <DocumentLink documentId={reportDocumentIds[0]} />
              </span>
              <div
                className={clsx('border-middle', cx('fr-mx-0', 'fr-mb-2w'))}
                style={{ width: '100%' }}
              ></div>
              <span className={cx('fr-text--sm', 'fr-text--bold')}>
                Historique des rapports téléversés
              </span>
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
          )}
        </div>
      )}
    </>
  );
};
