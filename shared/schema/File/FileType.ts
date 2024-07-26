import { z } from 'zod';

export const FileType = z.enum([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
]);

export type FileType = z.infer<typeof FileType>;

export const FileTypeList: FileType[] = FileType.options;

export const FileTypeLabels: Record<FileType, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLXS',
  'application/vnd.ms-excel': 'XLS',
};
