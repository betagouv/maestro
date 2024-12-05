import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import React, { useState } from 'react';
import { PartialAnalysis } from 'shared/schema/Analysis/Analysis';
import { FileInput } from 'shared/schema/File/FileInput';
import { FileType } from 'shared/schema/File/FileType';
import DocumentLink from 'src/components/DocumentLink/DocumentLink';
import AppUpload from 'src/components/_app/AppUpload/AppUpload';
import { useForm } from 'src/hooks/useForm';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import {
  useCreateAnalysisMutation,
  useUpdateAnalysisMutation,
} from 'src/services/analysis.service';
import {
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
} from 'src/services/document.service';
import { z } from 'zod';

interface Props {
  sampleId: string;
  partialAnalysis?: PartialAnalysis;
}

const AnalysisReportStep = ({ sampleId, partialAnalysis }: Props) => {
  const { navigateToSample } = useSamplesLink();

  const [
    createDocument,
    { isLoading: isCreateLoading, isError: isCreateError },
  ] = useCreateDocumentMutation({
    fixedCacheKey: 'createDocument',
  });
  const [deleteDocument] = useDeleteDocumentMutation();
  const [createAnalysis] = useCreateAnalysisMutation();
  const [updateAnalysis] = useUpdateAnalysisMutation();

  const [fileInput, setFileInput] = useState<File | undefined>();
  const [hasReportDocument, setHasReportDocument] = useState(
    partialAnalysis?.reportDocumentId !== undefined
  );

  const acceptFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
  ] as const satisfies FileType[];

  const Form = z.object({
    hasReportDocument: z.boolean(),
    fileInput: FileInput(acceptFileTypes).nullish(),
  });

  const FormRefinement = Form.refine(
    ({ hasReportDocument, fileInput }) => hasReportDocument || fileInput,
    {
      path: ['fileInput'],
      message: 'Veuillez ajouter un fichier.',
    }
  );

  const form = useForm(FormRefinement, { hasReportDocument, fileInput });

  type FormShape = typeof Form.shape;

  const selectFile = (event?: any) => {
    setFileInput(event?.target?.files?.[0]);
  };

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async () => {
      form.reset();
      const reportDocumentId = hasReportDocument
        ? (partialAnalysis?.reportDocumentId as string)
        : await createDocument({
            file: fileInput as File,
            kind: 'AnalysisReportDocument',
          })
            .unwrap()
            .then((document) => document.id);
      if (!partialAnalysis) {
        await createAnalysis({
          sampleId,
          reportDocumentId,
        });
      } else {
        if (partialAnalysis.reportDocumentId !== reportDocumentId) {
          await deleteDocument(partialAnalysis.reportDocumentId);
        }
        await updateAnalysis({
          ...partialAnalysis,
          reportDocumentId,
          status: 'Residues',
        });
      }
      navigateToSample(sampleId, 2);
    });
  };

  return (
    <>
      {hasReportDocument ? (
        <>
          <div className={cx('fr-label')}>Ajouter le rapport d'analyse</div>
          <div>
            <DocumentLink documentId={partialAnalysis?.reportDocumentId} />
            <Button
              title="Supprimer"
              iconId="fr-icon-delete-line"
              priority="tertiary"
              size="small"
              onClick={(e) => {
                e.preventDefault();
                setHasReportDocument(false);
              }}
              className={clsx(cx('fr-mt-0'), 'float-right')}
            />
          </div>
        </>
      ) : (
        <AppUpload<FormShape>
          label="Ajouter le rapport d'analyse"
          nativeInputProps={{
            onChange: (event: any) => selectFile(event),
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
