import { z } from 'zod';
export const Company = z.object({
  id: z.string().uuid(),
  siret: z.string(),
  name: z.string(),
  tradeName: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  nafCode: z.string().optional().nullable(),
});

export type Company = z.infer<typeof Company>;
