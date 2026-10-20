import type { SubstanceKind } from 'maestro-shared/schema/Substance/SubstanceKind';
import z from 'zod';

export const sigleContexteInterventionValidator = z.enum([
  'PR17_2026_RPDA_PVOL',
  'PR17_2026_RPDA_PBOV'
]);
export const SigleContexteIntervention: Record<
  string,
  z.infer<typeof sigleContexteInterventionValidator>
> = {
  M01: 'PR17_2026_RPDA_PVOL',
  M02: 'PR17_2026_RPDA_PBOV'
};

export const siglePlanAnalyseValidator = z.enum(['RPDA', 'RPDA_CU']);

export const SiglePlanAnalyse: Partial<
  Record<SubstanceKind, z.infer<typeof siglePlanAnalyseValidator>>
> = {
  Copper: 'RPDA_CU',
  Mono: 'RPDA',
  Multi: 'RPDA'
};
