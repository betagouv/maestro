import { z } from 'zod';

export const Species = z.enum(['SPECIES1', 'SPECIES2'], {
  errorMap: () => ({
    message: "Veuillez renseigner l'espèce."
  })
});

export type Species = z.infer<typeof Species>;

export const SpeciesList: Species[] = Species.options;

export const SpeciesLabels: Record<Species, string> = {
  SPECIES1: 'Espèce 1',
  SPECIES2: 'Espèce 2'
};
