import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { useState } from 'react';
import { FileInput } from 'shared/schema/File/FileInput';
import { FileType } from 'shared/schema/File/FileType';
import AppUpload from 'src/components/_app/AppUpload/AppUpload';
import { useForm } from 'src/hooks/useForm';
import { useCreateDocumentMutation } from 'src/services/document.service';
import { z } from 'zod';

const AddAnalysisDocument = () => {
  const [
    createDocument,
    { isLoading: isCreateLoading, isError: isCreateError },
  ] = useCreateDocumentMutation({
    fixedCacheKey: 'createDocument',
  });

  const [file, setFile] = useState<File | undefined>();

  const acceptFileTypes: FileType[] = [
    'application/pdf',
    'image/jpeg',
    'image/png',
  ];

  const Form = z.object({
    file: FileInput(acceptFileTypes),
  });

  const form = useForm(Form, { file });

  type FormShape = typeof Form.shape;

  const selectFile = (event?: any) => {
    setFile(event?.target?.files?.[0]);
  };

  const submit = async () => {
    await form.validate(async () => {
      form.reset();
      const document = await createDocument(file as File);
      console.log('document', document);
    });
  };

  return (
    <>
      <AppUpload<FormShape>
        label="Ajouter le rapport d'analyse"
        nativeInputProps={{
          onChange: (event: any) => selectFile(event),
        }}
        disabled={isCreateLoading}
        acceptFileTypes={acceptFileTypes}
        inputForm={form}
        inputKey="file"
        whenValid="fichier valide"
      />
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
        Confirmer
      </Button>
    </>
  );
};

export default AddAnalysisDocument;
