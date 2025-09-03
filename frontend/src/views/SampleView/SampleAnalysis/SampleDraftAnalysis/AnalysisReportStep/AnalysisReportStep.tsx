import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { PartialAnalysis } from 'maestro-shared/schema/Analysis/Analysis';
import { FileInput } from 'maestro-shared/schema/File/FileInput';
import { FileType } from 'maestro-shared/schema/File/FileType';
import React, { useContext, useEffect, useState } from 'react';
import AppUpload from 'src/components/_app/AppUpload/AppUpload';
import { useForm } from 'src/hooks/useForm';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import { z } from 'zod';
import { ApiClientContext } from '../../../../../services/apiClient';
import { AnalysisDocumentPreview } from '../../../components/AnalysisDocumentPreview';

interface Props {
  sampleId: string;
  partialAnalysis?: PartialAnalysis;
}

const AnalysisReportStep = ({ sampleId, partialAnalysis }: Props) => {
  const { navigateToSample } = useSamplesLink();
  const apiClient = useContext(ApiClientContext);

  const [
    createDocument,
    { isLoading: isCreateLoading, isError: isCreateError }
  ] = apiClient.useCreateDocumentMutation({
    fixedCacheKey: 'createDocument'
  });
  const [createAnalysis] = apiClient.useCreateAnalysisMutation();
  const [updateAnalysis] = apiClient.useUpdateAnalysisMutation();
  const [getAnalysisReportDocumentIds] =
    apiClient.useLazyGetAnalysisReportDocumentIdsQuery();
  const [createAnalysisReportDocument] =
    apiClient.useCreateAnalysisReportDocumentMutation();

  const [fileInput, setFileInput] = useState<File | undefined>();
  const [hasReportDocument, setHasReportDocument] = useState(false);
  const [addingNewReportDocument, setAddingNewReportDocument] = useState(false);

  useEffect(() => {
    if (partialAnalysis) {
      getAnalysisReportDocumentIds(partialAnalysis.id)
        .unwrap()
        .then((ids) => {
          setHasReportDocument(ids.length > 0);
        });
    } else {
      setHasReportDocument(false);
    }
  }, [partialAnalysis, getAnalysisReportDocumentIds]);

  const acceptFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png'
  ] as const satisfies FileType[];

  const Form = z.object({
    hasReportDocument: z.boolean(),
    fileInput: FileInput(acceptFileTypes).nullish()
  });

  const FormRefinement = Form.refine(
    ({ hasReportDocument, fileInput }) => hasReportDocument || fileInput,
    {
      path: ['fileInput'],
      message: 'Veuillez ajouter un fichier.'
    }
  );

  const form = useForm(FormRefinement, { hasReportDocument, fileInput });

  const selectFile = (event?: any) => {
    setFileInput(event?.target?.files?.[0]);
  };

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async () => {
      form.reset();
      if (fileInput) {
        const reportDocumentId = await createDocument({
          file: fileInput as File,
          kind: 'AnalysisReportDocument'
        })
          .unwrap()
          .then((document) => document.id);
        let analysisId = partialAnalysis?.id;
        if (!analysisId) {
          const { data: analysis } = await createAnalysis({
            sampleId
          });
          analysisId = analysis?.id;
        }
        if (analysisId) {
          await createAnalysisReportDocument({
            analysisId,
            documentId: reportDocumentId,
            sampleId
          });
          await updateAnalysis({
            ...partialAnalysis,
            id: analysisId,
            sampleId,
            status: 'Residues'
          });
        }
      }

      navigateToSample(sampleId, 2);
    });
  };

  return (
    <>
      {hasReportDocument && partialAnalysis?.id && !addingNewReportDocument ? (
        <AnalysisDocumentPreview
          analysisId={partialAnalysis?.id}
          sampleId={sampleId}
          readonly={false}
          button={
            <Button
              priority="secondary"
              iconId="fr-icon-add-line"
              className={cx('fr-mt-0')}
              size="small"
              onClick={() => {
                setAddingNewReportDocument(true);
              }}
            >
              Ajouter
            </Button>
          }
        />
      ) : fileInput ? (
        <div>
          <div className={cx('fr-label')}>Ajouter le rapport d'analyse</div>
          <div className={clsx(cx('fr-hint-text'), 'd-flex-align-center')}>
            <div className="flex-grow-1">
              {fileInput.name} ({Math.round(fileInput.size / 1024)} Ko)
            </div>
            <Button
              title="Supprimer"
              iconId="fr-icon-delete-line"
              priority="tertiary"
              size="small"
              onClick={(e) => {
                e.preventDefault();
                setFileInput(undefined);
              }}
              className={clsx(cx('fr-mt-0'), 'float-right')}
            />
          </div>
        </div>
      ) : (
        <AppUpload
          label="Ajouter le rapport d'analyse"
          nativeInputProps={{
            onChange: (event: any) => selectFile(event)
          }}
          disabled={isCreateLoading}
          acceptFileTypes={acceptFileTypes}
          inputForm={form}
          inputKey="fileInput"
          whenValid="fichier valide"
          required
        />
      )}
      {isCreateError && (
        <Alert
          className={cx('fr-mb-2w')}
          description={<>Le dépôt de fichier a échoué.</>}
          severity="error"
          small
        />
      )}
      <hr />
      <Button
        type="submit"
        iconId="fr-icon-arrow-right-line"
        iconPosition="right"
        className="fr-m-0"
        onClick={submit}
      >
        Continuer
      </Button>
    </>
  );
};

export default AnalysisReportStep;
