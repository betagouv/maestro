import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Region } from '../../referential/Region';

export const LocalPrescriptionKey = z.object({
  prescriptionId: z.guid(),
  region: Region,
  department: Department.nullish(),
  companySiret: z
    .union([
      z.string().min(1, 'Veuillez renseigner une valeur.'),
      z.undefined(),
      z.null()
    ])
    .nullish()
});

export type LocalPrescriptionKey = z.infer<typeof LocalPrescriptionKey>;

export const LocalPrescriptionKeyString = z
  .string()
  .brand('LocalPrescriptionKeyString');
export type LocalPrescriptionKeyString = z.infer<
  typeof LocalPrescriptionKeyString
>;

export const toLocalPrescriptionKeyString = (
  key: Pick<
    LocalPrescriptionKey,
    'prescriptionId' | 'region' | 'department' | 'companySiret'
  >
): LocalPrescriptionKeyString =>
  LocalPrescriptionKeyString.parse(
    [
      key.prescriptionId,
      key.region,
      key.department ?? '',
      key.companySiret ?? ''
    ].join('|')
  );
