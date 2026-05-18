import { z } from 'zod';
import { SSD2Id } from '../../referential/Residue/SSD2Id';

export const LaboratoryResidueMapping = z.object({
  laboratoryId: z.guid(),
  label: z.string().min(1),
  ssd2Id: SSD2Id.nullable()
});

export type LaboratoryResidueMapping = z.infer<typeof LaboratoryResidueMapping>;

export const LaboratoryResidueMappingToUpdate = z.object({
  label: z.string().min(1),
  ssd2Id: SSD2Id.nullable()
});

export type LaboratoryResidueMappingToUpdate = z.infer<
  typeof LaboratoryResidueMappingToUpdate
>;
