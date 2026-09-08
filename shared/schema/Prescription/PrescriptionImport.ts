import { z } from 'zod';

export const PrescriptionImportFile = z.object({
  filename: z.string().min(1, 'Veuillez renseigner le nom du fichier.'),
  content: z.string().min(1, 'Le fichier est vide.'),
  year: z.number().int()
});

export type PrescriptionImportFile = z.infer<typeof PrescriptionImportFile>;

export const PrescriptionImportResult = z.object({
  importedCellCount: z.number().int(),
  unrecognized: z.array(z.string())
});

export type PrescriptionImportResult = z.infer<typeof PrescriptionImportResult>;

export const PrescriptionImportExtensions = ['xls', 'xlsx', 'csv'] as const;

export const isSupportedPrescriptionImportFile = (filename: string): boolean =>
  PrescriptionImportExtensions.some((extension) =>
    filename.toLowerCase().endsWith(`.${extension}`)
  );
