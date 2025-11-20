import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Stepper from '@codegouvfr/react-dsfr/Stepper';
import { skipToken } from '@reduxjs/toolkit/query';
import clsx from 'clsx';
import { isNil } from 'lodash-es';
import {
  documentChecks,
  DocumentToCreate,
  DocumentUpdate
} from 'maestro-shared/schema/Document/Document';
import {
  DocumentKind,
  DocumentKindLabels,
  SortedResourceDocumentKindList
} from 'maestro-shared/schema/Document/DocumentKind';
import { FileInput } from 'maestro-shared/schema/File/FileInput';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';
import AppSelect from '../../components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from '../../components/_app/AppSelect/AppSelectOption';
import AppTextAreaInput from '../../components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from '../../components/_app/AppTextInput/AppTextInput';
import AppUpload from '../../components/_app/AppUpload/AppUpload';
import DocumentLink from '../../components/DocumentLink/DocumentLink';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useForm } from '../../hooks/useForm';
import { ApiClientContext } from '../../services/apiClient';

const DocumentStepTitles = [
  'Téléversement de la ressource',
  'Qualification de la ressource'
];

const DocumentView = () => {
  const apiClient = useContext(ApiClientContext);
  useDocumentTitle('Document ressource');
  const navigate = useNavigate();
  const { documentId } = useParams<{ documentId?: string }>();

  const { data: document } = apiClient.useGetDocumentQuery(
    documentId ?? skipToken
  );

  const [step, setStep] = useState<number>(1);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [kind, setKind] = useState<DocumentKind | undefined>(document?.kind);
  const [name, setName] = useState<string>(document?.name ?? '');
  const [notes, setNotes] = useState<string>(document?.notes ?? '');
  const [hasError, setHasError] = useState<boolean>(false);

  const [createDocument, { isLoading: isCreateLoading }] =
    apiClient.useCreateDocumentMutation({
      fixedCacheKey: 'createDocument'
    });
  const [updateDocument, { isLoading: isUpdateLoading }] =
    apiClient.useUpdateDocumentMutation({
      fixedCacheKey: 'updateDocument'
    });
  const [deleteDocument, { isLoading: isDeleteLoading }] =
    apiClient.useDeleteDocumentMutation();

  const isLoading = useMemo(
    () => isCreateLoading || isUpdateLoading || isDeleteLoading,
    [isCreateLoading, isUpdateLoading, isDeleteLoading]
  );

  useEffect(() => {
    if (document) {
      setKind(document.kind);
      setName(document.name ?? '');
      setNotes(document.notes ?? '');
    }
  }, [document]);

  const Form = (
    document
      ? z.object({
          ...DocumentUpdate.shape,
          file: FileInput().nullish()
        })
      : z.object({
          ...DocumentToCreate.omit({ id: true, filename: true }).shape,
          file: FileInput()
        })
  ).check(documentChecks);

  const formData = {
    file,
    name,
    kind,
    notes,
    legend: undefined
  };
  const form = useForm(Form, formData);

  const selectFile = (event?: any) => {
    setFile(event?.target?.files?.[0]);
  };

  const submit = async () => {
    await form.validate(async () => {
      form.reset();
      setHasError(false);

      try {
        if (document) {
          await updateDocument({
            ...formData,
            documentId: document.id,
            kind: kind as DocumentKind
          }).unwrap();
          if (file) {
            await deleteDocument(document.id).unwrap();
          }
        }
        if (file) {
          await createDocument({
            ...formData,
            kind: kind as DocumentKind,
            file: file as File
          }).unwrap();
        }

        navigate('/documents');
      } catch (_error) {
        setHasError(true);
      }
    });
  };

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <div
        className={clsx(
          cx('fr-pt-3w', 'fr-pt-md-4w', 'fr-pb-6w'),
          'white-container'
        )}
      >
        <div className="app-stepper">
          <Stepper
            currentStep={step}
            nextTitle={DocumentStepTitles[step]}
            stepCount={2}
            title={<div>{DocumentStepTitles[step - 1]}</div>}
          />
        </div>
        {step === 1 && (
          <form className={cx('fr-px-10w', 'fr-py-1w')}>
            <h3>
              {document
                ? 'Téléversez une nouvelle version du document'
                : 'Commencez par téléverser le document'}
            </h3>
            {document ? (
              <>
                <div
                  className={clsx(
                    cx('fr-text--bold', 'fr-text--lg'),
                    'd-flex-align-center'
                  )}
                >
                  Version actuelle
                  <div className="border-middle"></div>
                </div>
                <DocumentLink
                  documentId={document.id}
                  iconId="fr-icon-eye-line"
                />
                <div
                  className={clsx(
                    cx('fr-text--bold', 'fr-text--lg', 'fr-pt-4w'),
                    'd-flex-align-center'
                  )}
                >
                  Nouvelle version
                  <div className="border-middle"></div>
                </div>
              </>
            ) : (
              <div
                className={clsx(
                  cx('fr-text--bold', 'fr-text--lg'),
                  'd-flex-align-center'
                )}
              >
                Document
                <div className="border-middle"></div>
              </div>
            )}
            {file ? (
              <div
                className={clsx(
                  cx('fr-hint-text', 'fr-my-2w'),
                  'd-flex-align-center'
                )}
              >
                <div className="flex-grow-1">
                  {file.name} <br />({Math.round(file.size / 1024)} Ko)
                </div>
                <Button
                  title="Supprimer"
                  iconId="fr-icon-delete-line"
                  priority="tertiary"
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    setFile(undefined);
                  }}
                  className={clsx('fr-ml-2w')}
                />
              </div>
            ) : (
              <AppUpload
                label="Ajouter un fichier"
                buttonLabel="Parcourir"
                nativeInputProps={{
                  onChange: (event: any) => selectFile(event)
                }}
                className={cx('fr-mb-2w')}
                disabled={isLoading}
                inputForm={form}
                inputKey="file"
                whenValid="fichier valide"
              />
            )}
            <hr className={cx('fr-my-4w')} />

            <Button
              iconId="fr-icon-arrow-left-line"
              priority="secondary"
              onClick={(e) => {
                e.preventDefault();
                navigate(-1);
              }}
              title="Retour"
            />
            <Button
              className={clsx('float-right')}
              iconId="fr-icon-arrow-right-line"
              iconPosition="right"
              onClick={(e) => {
                e.preventDefault();
                setStep(2);
              }}
              disabled={isLoading || (isNil(file) && isNil(document))}
            >
              Continuer
            </Button>
          </form>
        )}
        {step === 2 && (
          <div className={cx('fr-px-10w', 'fr-py-1w')}>
            <h3>Complétez les informations suivantes</h3>
            <AppTextInput
              value={name || ''}
              onChange={(e) => setName(e.target.value ?? '')}
              inputForm={form}
              inputKey="name"
              label="Nom de la ressource"
              hintText="Formatage à définir avec Diane"
              required
            />
            <AppSelect
              value={kind || ''}
              options={selectOptionsFromList(SortedResourceDocumentKindList, {
                labels: DocumentKindLabels
              })}
              onChange={(e) => setKind(e.target.value as DocumentKind)}
              inputForm={form}
              inputKey="kind"
              label="Catégorie de la ressource"
              required
            />
            <AppTextAreaInput
              defaultValue={notes ?? ''}
              onChange={(e) => setNotes(e.target.value)}
              inputForm={form}
              inputKey="notes"
              whenValid="Note correctement renseignée."
              label="Notes"
              hintText="Champs facultatif pour qualifier le contexte de la ressource"
            />
            <hr className={cx('fr-my-4w')} />

            {hasError && (
              <Alert
                className={cx('fr-mb-4w', 'fr-py-1w')}
                description={<>Le dépôt de fichier a échoué.</>}
                severity="error"
                small
              />
            )}

            <Button
              iconId="fr-icon-arrow-left-line"
              priority="secondary"
              onClick={() => setStep(1)}
              title="Retour au téléversement"
            />
            <Button
              className={clsx('float-right')}
              iconId="fr-icon-check-line"
              onClick={submit}
              disabled={
                isCreateLoading ||
                isUpdateLoading ||
                (isNil(file) && isNil(document))
              }
            >
              Enregistrer
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default DocumentView;
