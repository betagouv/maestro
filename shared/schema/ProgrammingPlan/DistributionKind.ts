import { z } from 'zod';

export const DistributionKind = z.enum(
  ['REGIONAL', 'SLAUGHTERHOUSE', 'DEPARTMENTAL'],
  {
    error: () => 'Veuillez renseigner le mode de répartition.'
  }
);

export type DistributionKind = z.infer<typeof DistributionKind>;
