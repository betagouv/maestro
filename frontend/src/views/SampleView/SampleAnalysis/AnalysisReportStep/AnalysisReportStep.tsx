import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { skipToken } from '@reduxjs/toolkit/query';
import clsx from 'clsx';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PartialAnalysis } from 'shared/schema/Analysis/Analysis';
import { Document } from 'shared/schema/Document/Document';
import { FileInput } from 'shared/schema/File/FileInput';
import { FileType } from 'shared/schema/File/FileType';
import AppUpload from 'src/components/_app/AppUpload/AppUpload';
import { useDocument } from 'src/hooks/useDocument';
import { useForm } from 'src/hooks/useForm';
import {
  useCreateAnalysisMutation,
  useUpdateAnalysisMutation,
} from 'src/services/analysis.service';
import {
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  useGetDocumentQuery,
} from 'src/services/document.service';
import { z } from 'zod';

interface Props {
  sampleId: string;
  partialAnalysis?: PartialAnalysis;
}

const AnalysisReportStep = ({ sampleId, partialAnalysis }: Props) => {
  const navigate = useNavigate();

  const [
    createDocument,
    { isLoading: isCreateLoading, isError: isCreateError },
  ] = useCreateDocumentMutation({
    fixedCacheKey: 'createDocument',
  });
  const [deleteDocument] = useDeleteDocumentMutation();
  const [createAnalysis] = useCreateAnalysisMutation();
  const [updateAnalysis] = useUpdateAnalysisMutation();
  const { data: reportDocument } = useGetDocumentQuery(
    partialAnalysis?.reportDocumentId ?? skipToken
  );

  const { openDocument } = useDocument();

  const [fileInput, setFileInput] = useState<File | undefined>();
  const [hasReportDocument, setHasReportDocument] = useState(
    partialAnalysis?.reportDocumentId !== undefined
  );

  const acceptFileTypes: FileType[] = [
    'application/pdf',
    'image/jpeg',
    'image/png',
  ];

  const Form = z.object({
    hasReportDocument: z.boolean(),
    fileInput: FileInput(acceptFileTypes).optional().nullable(),
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
      const document = hasReportDocument
        ? (reportDocument as Document)
        : await createDocument({
            file: fileInput as File,
            kind: 'AnalysisReportDocument',
          }).unwrap();
      if (!partialAnalysis) {
        await createAnalysis({
          sampleId,
          reportDocumentId: document.id,
        });
      } else {
        if (partialAnalysis.reportDocumentId !== document.id) {
          await deleteDocument(partialAnalysis.reportDocumentId);
        }
        await updateAnalysis({
          ...partialAnalysis,
          reportDocumentId: document.id,
          status: 'Residues',
        });
      }
      navigate(`/prelevements/${sampleId}/analyse?etape=2`, {
        replace: true,
      });
    });
  };

  return (
    <>
      {hasReportDocument ? (
        <>
          <div className={cx('fr-label')}>Ajouter le rapport d'analyse</div>
          {reportDocument && (
            <div>
              <Link
                onClick={(e) => {
                  e.preventDefault();
                  openDocument(reportDocument?.id);
                }}
                to="#"
              >
                {reportDocument?.filename}
                <span
                  className={cx('fr-icon-download-line', 'fr-ml-1w')}
                ></span>
              </Link>
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
          )}
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
          small={true}
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
