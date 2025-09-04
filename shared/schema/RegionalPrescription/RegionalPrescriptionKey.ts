import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Region } from '../../referential/Region';

export const RegionalPrescriptionKey = z.object({
  prescriptionId: z.guid(),
  region: Region,
  department: Department.nullish()
});

export type RegionalPrescriptionKey = z.infer<typeof RegionalPrescriptionKey>;
