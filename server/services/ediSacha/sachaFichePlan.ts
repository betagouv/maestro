import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import z from 'zod';

export const sigleContexteInterventionValidator = z.enum([
  '2026_RPDA_PVOL',
  '2026_RPDA_PBOV'
]);
export const SigleContexteIntervention: Record<
  Exclude<ProgrammingPlanKind, 'PPV'>,
  z.infer<typeof sigleContexteInterventionValidator>
> = {
  DAOA_BREEDING: '2026_RPDA_PVOL',
  DAOA_SLAUGHTER: '2026_RPDA_PBOV'
};

export const siglePlanAnalyseValidator = z.enum(['RestPest_DAOA']);

export const SiglePlanAnalyse: Record<
  Exclude<ProgrammingPlanKind, 'PPV'>,
  z.infer<typeof siglePlanAnalyseValidator>
> = {
  DAOA_BREEDING: 'RestPest_DAOA',
  DAOA_SLAUGHTER: 'RestPest_DAOA'
};
