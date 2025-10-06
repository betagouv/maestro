import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Region } from '../../referential/Region';

export const LocalPrescriptionKey = z.object({
  prescriptionId: z.guid(),
  region: Region,
  department: Department.nullish()
});

export type LocalPrescriptionKey = z.infer<typeof LocalPrescriptionKey>;
