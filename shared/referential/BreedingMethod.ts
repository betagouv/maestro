import { z } from 'zod/v4';

export const BreedingMethod = z.enum(['STAND', 'AUTREQUALIT', 'AGRIBIO'], {
  error: () => "Veuillez renseigner la méthode d'élevage."
});

export type BreedingMethod = z.infer<typeof BreedingMethod>;

export const BreedingMethodList = BreedingMethod.options;

export const BreedingMethodLabels: Record<BreedingMethod, string> = {
  STAND: 'Standard',
  AUTREQUALIT: 'Autres signes de qualité',
  AGRIBIO: 'Biologique'
};
