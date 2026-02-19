import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { PartialAnalysis } from 'maestro-shared/schema/Analysis/Analysis';
import { FileInput } from 'maestro-shared/schema/File/FileInput';
import { FileType } from 'maestro-shared/schema/File/FileType';
import { useContext, useEffect, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import { z } from 'zod';
import AppUpload from '../../../../components/_app/AppUpload/AppUpload';
import { useForm } from '../../../../hooks/useForm';
import { ApiClientContext } from '../../../../services/apiClient';
interface Props {
  modal: ReturnType<typeof createModal>;
  sampleId: string;
  partialAnalysis: PartialAnalysis | undefined;
}

export const AnalysisDocumentModal = ({
  modal,
  sampleId,
  partialAnalysis,
  ..._rest
}: Props) => {
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
            sampleId,
            itemNumber: 1, //TODO à gérer
            copyNumber: 1 //TODO à gérer
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
        modal.close();
      });
    }
  }, [fileInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const Form = z.object({
    fileInput: FileInput(acceptFileTypes).nullish()
  });

  const form = useForm(Form, { fileInput });

  return (
    <modal.Component
      title="Rapport d'analyse"
      concealingBackdrop={false}
      topAnchor
      buttons={[
        {
          children: 'Annuler',
          onClick: () => ({}),
          doClosesModal: true,
          priority: 'secondary'
        }
      ]}
    >
      <>
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

        {isCreateError && (
          <Alert
            className={cx('fr-my-2w')}
            description={<>Le dépôt de fichier a échoué.</>}
            severity="error"
            small
          />
        )}
      </>
    </modal.Component>
  );
};
