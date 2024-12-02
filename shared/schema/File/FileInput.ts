import { z } from 'zod';
import { FileType, FileTypeList } from './FileType';

export const MaxFileSize = 20 * 1000 * 1000;

//FIXME ajouter des tests
export const FileInput = (
  acceptFileTypes: Readonly<[FileType, ...FileType[]]> = FileTypeList
) =>
  z.union([
    z.instanceof(File, { message: 'Veuillez sélectionner un fichier' }),
    z.object({
      type: z.enum(acceptFileTypes, {
        errorMap: () => ({ message: "Ce type de fichier n'est pas accepté" })
      }),
      size: z
        .number()
        .max(MaxFileSize, { message: 'Le fichier est trop volumineux' })
    })
  ]);
export type File = z.infer<ReturnType<typeof FileInput>>;
