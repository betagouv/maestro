import { z } from 'zod';
import { refineSchema, superRefineSchema } from '../../utils/zod';
import { FileType, FileTypeList } from './FileType';

export const MaxFileSize = 20 * 1000 * 1000;

export const FileInput = (
  acceptFileTypes: Readonly<[FileType, ...FileType[]]> = FileTypeList,
  multiple = false
) => {
  const fileSchemaRefined = refineSchema(
    refineSchema(
      refineSchema(
        z.any(),
        (file) => file instanceof File,
        'Veuillez sélectionner un fichier.'
      ),
      (file) => file?.size <= MaxFileSize,
      'Le fichier est trop volumineux.'
    ),
    (file) => {
      const { success, data: fileType } = FileType.safeParse(file?.type);
      if (!success) {
        return false;
      }
      return acceptFileTypes.includes(fileType);
    },
    "Ce type de fichier n'est pas accepté."
  );
  if (multiple) {
    return superRefineSchema(
      z
        .array(fileSchemaRefined)
        .nonempty('Veuillez sélectionner au moins un fichier.'),
      (files, ctx) => {
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
      }
    );
  }

  return fileSchemaRefined;
};
