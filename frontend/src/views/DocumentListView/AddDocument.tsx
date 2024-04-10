import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Upload } from '@codegouvfr/react-dsfr/Upload';
import { useState } from 'react';
import { useForm } from 'src/hooks/useForm';
import { useCreateDocumentMutation } from 'src/services/document.service';
import { z } from 'zod';

const MAX_FILE_SIZE = 20 * 1000 * 1000;
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

const AddDocument = () => {
  const [
    createDocument,
    {
      isLoading: isCreateLoading,
      isSuccess: isCreateSuccess,
      isError: isCreateError,
    },
  ] = useCreateDocumentMutation({
    fixedCacheKey: 'createDocument',
  });

  const [file, setFile] = useState<File | undefined>();

  const Form = z.object({
    file: z
      .any()
      .refine(
        (file) => file instanceof File,
        'Veuillez sélectionner un fichier.'
      )
      .refine(
        (file) => file?.size <= MAX_FILE_SIZE,
        'Le fichier est trop volumineux.'
      )
      .refine(
        (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
        "Ce type de fichier n'est pas accepté."
      ),
  });

  const form = useForm(Form, { file });

  const selectFile = (event?: any) => {
    setFile(event?.target?.files?.[0]);
  };

  const submitFile = async () => {
    await form.validate(async () => {
      form.reset();
      await createDocument(file as File);
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
        height: 'fit-content',
      }}
    >
      <Upload
        label="Déposer un nouveau document"
        hint="Formats acceptés : PDF, JPEG, PNG, XLS, XLSX. Taille maximale : 20 Mo"
        nativeInputProps={{
          onChange: (event: any) => selectFile(event),
          accept: ACCEPTED_FILE_TYPES.join(','),
        }}
        state={form.messageType('file')}
        stateRelatedMessage={form.message('file', [], 'Fichier valide')}
        multiple={false}
        className={cx('fr-mb-2w')}
        disabled={isCreateLoading}
        key={`upload-${isCreateSuccess}`}
      />
      {isCreateError && (
        <Alert
          className={cx('fr-mb-2w')}
          description={<>Le dépôt de fichier a échoué.</>}
          severity="error"
          small={true}
        />
      )}
      <Button onClick={submitFile}>Déposer</Button>
    </div>
  );
};

export default AddDocument;
