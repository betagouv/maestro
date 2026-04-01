import { z } from 'zod';

export const DistributionKind = z.enum(['REGIONAL', 'SLAUGHTERHOUSE'], {
  error: () => 'Veuillez renseigner le mode de répartition.'
});

export type DistributionKind = z.infer<typeof DistributionKind>;

export const DistributionKindLabels = {
  REGIONAL: 'Région',
  SLAUGHTERHOUSE: 'Abattoir'
};
