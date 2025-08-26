import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { z } from 'zod';

export const maestroDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .brand<'Date'>()
  .refine((date) => !isNaN(new Date(date).getTime()), {
    message: 'date invalide'
  });

export type MaestroDate = z.infer<typeof maestroDate>;

export const formatDate = (date: Date) =>
  format(date, 'dd MMMM yyyy', {
    locale: fr
  });
export const formatDateTime = (date: Date) =>
  format(date, 'dd MMMM yyyy à HH:mm', {
    locale: fr
  });

export const toMaestroDate = (date: Date): MaestroDate => {
  // Use the Sweden locale because it uses the ISO format
  const dateString = date.toLocaleDateString('sv');
  const parsedDate = maestroDate.safeParse(dateString);
  if (parsedDate.success) {
    return parsedDate.data;
  }

  throw new Error(`Shouldn't get here (invalid toDateStr provided): ${date}`);
};
