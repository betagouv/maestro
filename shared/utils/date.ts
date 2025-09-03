import { z } from 'zod';

export const maestroDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .brand<'Date'>()
  .refine((date) => !isNaN(new Date(date).getTime()), {
    message: 'date invalide'
  });

export type MaestroDate = z.infer<typeof maestroDate>;
