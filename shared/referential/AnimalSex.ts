import { z } from 'zod';

export const AnimalSex = z.enum(['SEX1', 'SEX2', 'SEX3', 'SEX4', 'SEX5'], {
  error: () => 'Veuillez renseigner le sexe'
});

export type AnimalSex = z.infer<typeof AnimalSex>;

export const AnimalSexList = AnimalSex.options;

export const AnimalSexLabels: Record<AnimalSex, string> = {
  SEX1: 'Mâle entier',
  SEX2: 'Mâle castré',
  SEX3: 'Mâle non déterminé',
  SEX4: 'Femelle',
  SEX5: 'Sexe inconnu'
};
