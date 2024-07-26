import { z } from 'zod';
import { FileType, FileTypeList } from './FileType';

export const MaxFileSize = 20 * 1000 * 1000;

export const FileInput = (acceptFileTypes: FileType[] = FileTypeList) =>
  z
    .any()
    .refine((file) => file instanceof File, 'Veuillez sélectionner un fichier.')
    .refine(
      (file) => file?.size <= MaxFileSize,
      'Le fichier est trop volumineux.'
    )
    .refine(
      (file) => FileTypeList.includes(file?.type),
      "Ce type de fichier n'est pas accepté."
    )
    .refine(
      (file) => acceptFileTypes.includes(file?.type),
      "Ce type de fichier n'est pas accepté."
    );

export type File = z.infer<ReturnType<typeof FileInput>>;
