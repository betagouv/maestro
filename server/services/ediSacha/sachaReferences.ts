import { getDayOfYear } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { z } from 'zod';

export const SampleReference = z
  .string()
  .regex(/^[A-Z]{3}-\d{2}-\d{5}$/)
  .brand('SampleReference');
export type SampleReference = z.infer<typeof SampleReference>;

const NumeroDAP = z
  .string()
  .regex(/^6666\d{8}$/)
  .brand('NumeroDAP');
type NumeroDAP = z.infer<typeof NumeroDAP>;

export const NumeroEtiquette = z
  .string()
  .regex(/^\d{24}$/)
  .brand('NumeroEtiquette');
export type NumeroEtiquette = z.infer<typeof NumeroEtiquette>;

export const numeroDAPFromReference = (
  reference: SampleReference
): NumeroDAP => {
  const [, year, serial] = reference.split('-');
  return NumeroDAP.parse(`6666${year}${serial.padStart(6, '0')}`);
};

export const referencesFromSample = (
  reference: SampleReference,
  now: number,
  itemNumber: number
): { numeroDAP: NumeroDAP; numeroEtiquette: NumeroEtiquette } => {
  const numeroDAP = numeroDAPFromReference(reference);
  const parisDate = toZonedTime(now, 'Europe/Paris');
  const year = String(parisDate.getFullYear());
  const dayOfYear = String(getDayOfYear(parisDate)).padStart(3, '0');
  const paddedItemNumber = String(itemNumber).padStart(3, '0');
  const numeroEtiquette = NumeroEtiquette.parse(
    `02${numeroDAP}${year}${dayOfYear}${paddedItemNumber}`
  );
  return { numeroDAP, numeroEtiquette };
};

export const referencesFromEtiquette = (
  etiquette: NumeroEtiquette
): {
  numeroDAP: NumeroDAP;
  referenceSuffix: string;
  itemNumber: number;
  year: number;
  dayOfYear: number;
} => {
  const numeroDAP = NumeroDAP.parse(etiquette.substring(2, 14));
  const year = Number.parseInt(etiquette.substring(14, 18), 10);
  const dayOfYear = Number.parseInt(etiquette.substring(18, 21), 10);
  const itemNumber = Number.parseInt(etiquette.substring(21, 24), 10);
  return {
    numeroDAP,
    referenceSuffix: `${numeroDAP.substring(4, 6)}-${numeroDAP.substring(7, 12)}`,
    itemNumber,
    year,
    dayOfYear
  };
};
