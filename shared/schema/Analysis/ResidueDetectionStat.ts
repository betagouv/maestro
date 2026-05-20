import z from 'zod';
import { Matrix } from '../../referential/Matrix/Matrix';
import { Region } from '../../referential/Region';
import { SSD2Id } from '../../referential/Residue/SSD2Id';

export const ResidueDetectionStat = z.object({
  residueReference: SSD2Id,
  matrix: Matrix,
  region: Region,
  sampleCount: z.coerce.number()
});

export const FindResidueStatsOptions = z.object({
  programmingPlanId: z.guid().nullish()
});

export type ResidueDetectionStat = z.infer<typeof ResidueDetectionStat>;
export type FindResidueStatsOptions = z.infer<typeof FindResidueStatsOptions>;
