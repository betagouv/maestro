import { z } from 'zod';
export const FindCompanyOptions = z.object({
  siret: z
    .string({
      required_error: 'Veuillez renseigner le SIRET.',
    })
    .regex(/^[0-9]{14}$/g, 'SIRET invalide.'),
});

export type FindCompanyOptions = z.infer<typeof FindCompanyOptions>;
