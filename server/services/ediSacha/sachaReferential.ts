import type { SubstanceKind } from 'maestro-shared/schema/Substance/SubstanceKind';
import z from 'zod';

export const siglePlanAnalyseValidator = z.enum(['RPDA', 'RPDA_CU']);

export const SiglePlanAnalyse: Partial<
  Record<SubstanceKind, z.infer<typeof siglePlanAnalyseValidator>>
> = {
  Copper: 'RPDA_CU',
  Mono: 'RPDA',
  Multi: 'RPDA'
};
