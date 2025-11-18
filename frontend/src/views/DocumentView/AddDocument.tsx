import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { FileInput } from 'maestro-shared/schema/File/FileInput';
import { useContext, useState } from 'react';
import AppUpload from 'src/components/_app/AppUpload/AppUpload';
import { useForm } from 'src/hooks/useForm';
import { z } from 'zod';
import { ApiClientContext } from '../../services/apiClient';

const AddDocument = () => {
  const apiClient = useContext(ApiClientContext);
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

  const [file, setFile] = useState<File | undefined>();

  const Form = z.object({
    file: FileInput()
  });

  const form = useForm(Form, { file });

  const selectFile = (event?: any) => {
    setFile(event?.target?.files?.[0]);
  };

  const submitFile = async () => {
    await form.validate(async () => {
      form.reset();
      await createDocument({ file: file as File, kind: 'Resource' });
    });
  };

  return (
    <>
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
          <div className={cx('fr-label')}>Déposer un nouveau document</div>
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
          <Button onClick={submitFile}>Déposer</Button>
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
        onClick={() => {}}
      >
        Continuer
      </Button>
    </>
  );
};

export default AddDocument;
