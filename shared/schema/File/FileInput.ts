import { z } from 'zod';
import { FileType, FileTypeList } from './FileType';

export const MaxFileSize = 20 * 1000 * 1000;

export const FileInput = (
  acceptFileTypes: Readonly<[FileType, ...FileType[]]> = FileTypeList
) =>
  z
    .any()
    .refine((file) => file instanceof File, 'Veuillez sélectionner un fichier.')
    .refine(
      (file) => file?.size <= MaxFileSize,
      'Le fichier est trop volumineux.'
    )
    .refine(
      (file) => {
        const {success, data: fileType} = FileType.safeParse(file?.type)
        if( !success ){
          return false
        }

        return acceptFileTypes.includes(fileType)

      },
      "Ce type de fichier n'est pas accepté."
    )


export type File = z.infer<ReturnType<typeof FileInput>>;
