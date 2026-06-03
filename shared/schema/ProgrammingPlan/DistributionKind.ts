import { z } from 'zod';

export const DistributionKind = z.enum(
  ['REGIONAL', 'SLAUGHTERHOUSE', 'TO_BE_DEFINED'],
  {
    error: () => 'Veuillez renseigner le mode de répartition.'
  }
);

export type DistributionKind = z.infer<typeof DistributionKind>;
