import { z } from 'zod';

export const FileTypeList = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
] as const;

export const FileType = z.enum(FileTypeList);

export type FileType = z.infer<typeof FileType>;

export const FileTypeLabels = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLXS',
  'application/vnd.ms-excel': 'XLS'
} as const satisfies Record<FileType, string>;
