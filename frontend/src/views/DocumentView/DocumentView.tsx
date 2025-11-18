import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Stepper from '@codegouvfr/react-dsfr/Stepper';
import { skipToken } from '@reduxjs/toolkit/query';
import clsx from 'clsx';
import { DocumentToCreate } from 'maestro-shared/schema/Document/Document';
import {
  DocumentKind,
  DocumentKindLabels
} from 'maestro-shared/schema/Document/DocumentKind';
import { FileInput } from 'maestro-shared/schema/File/FileInput';
import { useContext, useState } from 'react';
import { useParams } from 'react-router';
import { z } from 'zod';
import AppSelect from '../../components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from '../../components/_app/AppSelect/AppSelectOption';
import AppTextAreaInput from '../../components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from '../../components/_app/AppTextInput/AppTextInput';
import AppUpload from '../../components/_app/AppUpload/AppUpload';
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
  const { documentId } = useParams<{ documentId?: string }>();

  const { data: _document } = apiClient.useGetDocumentQuery(
    documentId ?? skipToken
  );

  const [step, setStep] = useState<number>(1);
  const [file, setFile] = useState<File | undefined>();
  const [kind, setKind] = useState<DocumentKind>();
  const [name, setName] = useState<string>();
  const [notes, setNotes] = useState<string>();

  const [
    createDocument,
    {
      isLoading: isCreateLoading,
      isSuccess: isCreateSuccess,
      isError: isCreateError
    }
  ] = apiClient.useCreateDocumentMutation({
    fixedCacheKey: 'createDocument'
  });

  const Form = z.object({
    ...DocumentToCreate.omit({ id: true, filename: true }).shape,
    file: FileInput()
  });

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
      await createDocument({
        ...formData,
        kind: kind as DocumentKind,
        file: file as File
      });
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
              Commencez par téléverser le document relatif à la fiche de plan
            </h3>
            <div
              className={clsx(
                cx('fr-text--bold', 'fr-text--lg'),
                'd-flex-align-center'
              )}
            >
              Document
              <div className="border-middle"></div>
            </div>
            {file ? (
              <>
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
              </>
            ) : (
              <AppUpload
                label="Ajouter un fichier"
                buttonLabel="Parcourir"
                nativeInputProps={{
                  onChange: (event: any) => selectFile(event)
                }}
                className={cx('fr-mb-2w')}
                disabled={isCreateLoading}
                key={`upload-${isCreateSuccess}`}
                inputForm={form}
                inputKey="file"
                whenValid="fichier valide"
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
            <hr className={cx('fr-my-4w')} />
            <Button
              className={clsx('float-right')}
              iconId="fr-icon-arrow-right-line"
              iconPosition="right"
              onClick={() => setStep(2)}
              disabled={isCreateLoading || !file}
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
              options={selectOptionsFromList(['Resource', 'FicheDePlan'], {
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
              label="Commentaires"
              hintText="Champs facultatif pour qualifier le contexte de la ressource"
            />
            <hr className={cx('fr-my-4w')} />

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
              disabled={isCreateLoading || !file}
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
