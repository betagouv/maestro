import { z } from 'zod';

export const FieldInheritance = z.enum(['Own', 'Inherited', 'Excluded'], {
  error: () => "Veuillez renseigner le mode d'héritage du descripteur."
});

export type FieldInheritance = z.infer<typeof FieldInheritance>;

// export const FieldInheritanceList: FieldInheritance[] =
//   FieldInheritance.options;
//
// export const FieldInheritanceLabels: Record<FieldInheritance, string> = {
//   Own: 'Piloté par le sous-plan',
//   Inherited: 'Hérité du plan',
//   Excluded: 'Retiré du formulaire'
// };
