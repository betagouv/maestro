import { z } from 'zod/v4';
import { FileType, FileTypeList } from './FileType';

export const MaxFileSize = 20 * 1000 * 1000;

export const FileInput = (
  acceptFileTypes: Readonly<[FileType, ...FileType[]]> = FileTypeList,
  multiple = false
) => {
  const fileSchema = z
    .any()
    .refine((file) => file instanceof File, 'Veuillez sélectionner un fichier.')
    .refine(
      (file) => file?.size <= MaxFileSize,
      'Le fichier est trop volumineux.'
    )
    .refine((file) => {
      const { success, data: fileType } = FileType.safeParse(file?.type);
      if (!success) {
        return false;
      }
      return acceptFileTypes.includes(fileType);
    }, "Ce type de fichier n'est pas accepté.");
  if (multiple) {
    return z
      .array(fileSchema)
      .nonempty('Veuillez sélectionner au moins un fichier.')
      .superRefine((files, ctx) => {
        files.forEach((file) => {
          const { success: typeSuccess, data: fileType } = FileType.safeParse(
            file.type
          );
          if (!typeSuccess || !acceptFileTypes.includes(fileType)) {
            ctx.addIssue({
              code: 'custom',
              message: 'Un ou plusieurs fichiers ne sont pas acceptés.'
            });
          }

          if (file.size > MaxFileSize) {
            ctx.addIssue({
              code: 'custom',
              message: 'Un ou plusieurs fichiers sont trop volumineux.'
            });
          }
        });
      });
  }

  return fileSchema;
};
