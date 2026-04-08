import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { cloneDeepWith, isDate } from 'lodash-es';
import { z } from 'zod';
import { refineSchema } from './zod';

export const maestroDateRefined = refineSchema(
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .brand<'Date'>(),
  (date) => !Number.isNaN(new Date(date).getTime()),
  { message: 'date invalide' }
);

export type MaestroDate = z.infer<typeof maestroDateRefined>;

export const formatDate = (date: Date) =>
  format(date, 'dd MMMM yyyy', {
    locale: fr
  });

export const formatMaestroDate = (date?: MaestroDate | null) =>
  date ? format(new Date(date), 'dd/MM/yyyy') : '';

export const formatDateTime = (date: Date, timeZone = 'Europe/Paris') =>
  formatWithTz(date, 'dd MMMM yyyy à HH:mm', timeZone);

export const toMaestroDate = (date: Date): MaestroDate => {
  // Use the Sweden locale because it uses the ISO format
  const dateString = date.toLocaleDateString('sv', {
    timeZone: 'Europe/Paris'
  });
  const parsedDate = maestroDateRefined.safeParse(dateString);
  if (parsedDate.success) {
    return parsedDate.data;
  }

  throw new Error(
    `Shouldn't get here (invalid toDateStr provided): ${date} ${dateString} ${parsedDate.error}`
  );
};
export function withISOStringDates(obj: any): any {
  return cloneDeepWith(obj, (value) => {
    if (isDate(value)) {
      return value.toISOString();
    }
    return undefined;
  });
}

export const formatWithTz = (
  date: Date | number,
  formatStr: string,
  timeZone = 'Europe/Paris'
) =>
  formatInTimeZone(date, timeZone, formatStr, {
    locale: fr
  });

export const parseWithTz = (
  value: string,
  formatStr: string,
  timeZone = 'Europe/Paris'
) => fromZonedTime(parse(value, formatStr, new Date()), timeZone);
