import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Upload } from '@codegouvfr/react-dsfr/Upload';
import { MaxFileSize } from 'maestro-shared/schema/File/FileInput';
import {
  FileType,
  FileTypeLabels,
  FileTypeList
} from 'maestro-shared/schema/File/FileType';
import { ComponentPropsWithoutRef, useEffect, useRef, useState } from 'react';
import AppRequiredInput from 'src/components/_app/AppRequired/AppRequiredInput';
import { UseForm } from 'src/hooks/useForm';
import { z, ZodObject } from 'zod';

type AppUploadProps<T extends ZodObject, U extends UseForm<T>> = Partial<
  ComponentPropsWithoutRef<typeof Upload>
> & {
  inputForm: U;
  inputKey: keyof NoInfer<z.infer<U['schema']>>;
  inputPathFromKey?: (string | number)[];
  whenValid?: string;
  acceptFileTypes?: FileType[];
  maxSize?: number;
  required?: boolean;
  withPhoto?: boolean;
  buttonLabel?: string;
};

function AppUpload<T extends ZodObject>(props: AppUploadProps<T, UseForm<T>>) {
  const {
    label,
    hint,
    acceptFileTypes,
    maxSize,
    inputForm,
    inputKey,
    inputPathFromKey,
    whenValid,
    state,
    stateRelatedMessage,
    nativeInputProps,
    required,
    withPhoto,
    buttonLabel,
    ...uploadProps
  } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [isCameraAvailable, setIsCameraAvailable] = useState(false);

  useEffect(() => {
    if (withPhoto) {
      (async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true
          });
          stream.getTracks().forEach((track) => track.stop());

          const testInput = document.createElement('input');
          testInput.setAttribute('type', 'file');
          testInput.setAttribute('capture', 'environment');

          setIsCameraAvailable(testInput.capture === 'environment');
        } catch (_) {
          setIsCameraAvailable(false);
        }
      })();
    }
  }, [withPhoto]);

  return (
    <div style={{ position: 'relative' }}>
      <Upload
        {...uploadProps}
        label={
          <>
            {label ?? 'Déposer un nouveau document'}
            {required && <AppRequiredInput />}
          </>
        }
        hint={
          hint ??
          `Formats acceptés : ${(acceptFileTypes ?? FileTypeList)
            .map((type) => FileTypeLabels[type])
            .join(', ')}. Taille maximale : ${
            (maxSize ?? MaxFileSize) / 1000 / 1000
          } Mo`
        }
        nativeInputProps={{
          ...nativeInputProps,
          ref: fileInputRef,
          accept: (acceptFileTypes ?? FileTypeList).join(','),
          style: { display: 'none' }
        }}
        state={state ?? inputForm.messageType(inputKey, inputPathFromKey)}
        stateRelatedMessage={
          stateRelatedMessage ??
          inputForm.message(inputKey, inputPathFromKey, whenValid)
        }
      />

      {withPhoto && isCameraAvailable && (
        <>
          <Button
            priority="tertiary"
            iconId="fr-icon-camera-line"
            onClick={(e) => {
              e.preventDefault();
              photoInputRef.current?.click();
            }}
            className={cx('fr-mr-2w', 'fr-mb-2w')}
          >
            Prendre une photo
          </Button>

          <input
            {...nativeInputProps}
            ref={photoInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
          />
        </>
      )}

      <Button
        priority="tertiary"
        iconId="fr-icon-file-add-line"
        onClick={(e) => {
          e.preventDefault();
          fileInputRef.current?.click();
        }}
      >
        {buttonLabel ?? 'Ajouter un fichier'}
      </Button>
    </div>
  );
}

export default AppUpload;
