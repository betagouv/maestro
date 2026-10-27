import { z } from 'zod';
import type { DistributionKind } from './DistributionKind';

export const ProgrammingPlanEchelon = z.enum([
  'National',
  'Regional',
  'Departmental'
]);
export type ProgrammingPlanEchelon = z.infer<typeof ProgrammingPlanEchelon>;

export const hasDepartmentalEchelon = (kind: DistributionKind): boolean =>
  kind !== 'REGIONAL';

export const hasCompanyEchelon = (kind: DistributionKind): boolean =>
  kind === 'SLAUGHTERHOUSE';

export const isTerminalEchelon = (
  echelon: ProgrammingPlanEchelon,
  distributionKind: DistributionKind
): boolean =>
  hasDepartmentalEchelon(distributionKind)
    ? echelon === 'Departmental'
    : echelon === 'Regional';
