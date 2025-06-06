import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { FileInput } from 'maestro-shared/schema/File/FileInput';
import { useState } from 'react';
import AppUpload from 'src/components/_app/AppUpload/AppUpload';
import { useForm } from 'src/hooks/useForm';
import { useCreateDocumentMutation } from 'src/services/document.service';
import { z } from 'zod/v4';

const AddDocument = () => {
  const [
    createDocument,
    {
      isLoading: isCreateLoading,
      isSuccess: isCreateSuccess,
      isError: isCreateError
    }
  ] = useCreateDocumentMutation({
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
    <div
      className={cx('fr-p-2w')}
      style={{
        border: `1px solid ${
          isCreateLoading
            ? fr.colors.decisions.border.disabled.grey.default
            : fr.colors.decisions.border.default.grey.default
        }`,
        height: 'fit-content'
      }}
      data-testid="add-document"
    >
      <AppUpload
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
      {isCreateError && (
        <Alert
          className={cx('fr-mb-2w')}
          description={<>Le dépôt de fichier a échoué.</>}
          severity="error"
          small
        />
      )}
      <Button onClick={submitFile}>Déposer</Button>
    </div>
  );
};

export default AddDocument;
