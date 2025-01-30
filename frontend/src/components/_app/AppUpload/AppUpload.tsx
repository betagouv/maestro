import { Upload } from '@codegouvfr/react-dsfr/Upload';
import { MaxFileSize } from 'maestro-shared/schema/File/FileInput';
import {
  FileType,
  FileTypeLabels,
  FileTypeList
} from 'maestro-shared/schema/File/FileType';
import { ComponentPropsWithoutRef } from 'react';
import AppRequiredInput from 'src/components/_app/AppRequired/AppRequiredInput';
import { useForm } from 'src/hooks/useForm';
import { ZodRawShape } from 'zod';

type AppUploadProps<T extends ZodRawShape> = Partial<
  ComponentPropsWithoutRef<typeof Upload>
> & {
  inputForm: ReturnType<typeof useForm>;
  inputKey: keyof T;
  inputPathFromKey?: (string | number)[];
  whenValid?: string;
  acceptFileTypes?: FileType[];
  maxSize?: number;
  required?: boolean;
};

function AppUpload<T extends ZodRawShape>(props: AppUploadProps<T>) {
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
    ...uploadProps
  } = props;

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
          accept: (acceptFileTypes ?? FileTypeList).join(',')
        }}
        state={
          state ?? inputForm.messageType(String(inputKey), inputPathFromKey)
        }
        stateRelatedMessage={
          stateRelatedMessage ??
          inputForm.message(String(inputKey), inputPathFromKey, whenValid)
        }
      />
    </div>
  );
}

export default AppUpload;
