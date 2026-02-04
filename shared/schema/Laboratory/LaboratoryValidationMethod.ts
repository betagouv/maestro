import { z } from 'zod';

export const LaboratoryValidationMethod = z.enum(['V001A', 'V005A'], {
  error: () => 'Veuillez renseigner la méthode de validation.'
});

export type LaboratoryValidationMethod = z.infer<
  typeof LaboratoryValidationMethod
>;

export const LaboratoryValidationMethodList =
  LaboratoryValidationMethod.options;

export const LaboratoryValidationMethodLabels: Record<
  LaboratoryValidationMethod,
  string
> = {
  V001A: 'Accréditée selon exigences de la norme 17025 (COFRAC)',
  V005A: 'Validé en interne'
};
