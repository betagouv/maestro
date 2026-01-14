import { z } from 'zod';

export const BreedingMethod = z.enum(['PROD_1', 'PROD_2', 'PROD_3'], {
  error: () => "Veuillez renseigner le mode d'élevage"
});

export type BreedingMethod = z.infer<typeof BreedingMethod>;

export const BreedingMethodList = BreedingMethod.options;

export const BreedingMethodLabels: Record<BreedingMethod, string> = {
  PROD_1: 'Biologique',
  PROD_2: 'Standard',
  PROD_3: 'Autre signe de qualité'
};
