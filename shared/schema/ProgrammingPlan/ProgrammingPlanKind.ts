import { z } from 'zod';

export const ProgrammingPlanKind = z.enum(['PPV', 'PFAS_EGGS', 'PFAS_MEAT']);

export type ProgrammingPlanKind = z.infer<typeof ProgrammingPlanKind>;

export const ProgrammingPlanKindList: ProgrammingPlanKind[] =
  ProgrammingPlanKind.options;

export const PFASKindList: ProgrammingPlanKind[] = ['PFAS_EGGS', 'PFAS_MEAT'];
