import { getDayOfYear } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { type Region, Regions } from 'maestro-shared/referential/Region';
import { z } from 'zod';

export const SampleReference = z
  .string()
  .regex(/^[A-Z]{3}-\d{2}-\d{5}$/)
  .brand('SampleReference');
export type SampleReference = z.infer<typeof SampleReference>;

export const NumeroDAP = z
  .string()
  .regex(/^\d{12}$/)
  .brand('NumeroDAP');
export type NumeroDAP = z.infer<typeof NumeroDAP>;

export const NumeroEtiquette = z
  .string()
  .regex(/^\d{24}$/)
  .brand('NumeroEtiquette');
export type NumeroEtiquette = z.infer<typeof NumeroEtiquette>;

const regionByShortName: Record<string, Region> = Object.fromEntries(
  Object.entries(Regions).map(([region, { shortName }]) => [
    shortName,
    region as Region
  ])
);

const numeroDAPFromReference = (reference: SampleReference): NumeroDAP => {
  const [shortName, yy, serial] = reference.split('-');
  const region = regionByShortName[shortName];
  if (!region) {
    throw new Error(`Région inconnue pour le préfixe ${shortName}`);
  }
  const year = `${2000 + Number.parseInt(yy, 10)}`;
  const paddedSerial = serial.padStart(6, '0');
  return NumeroDAP.parse(`${year}${region}${paddedSerial}`);
};

const referenceFromNumeroDAP = (numeroDAP: NumeroDAP): SampleReference => {
  const year = numeroDAP.substring(0, 4);
  const region = numeroDAP.substring(4, 6) as Region;
  const serial = numeroDAP.substring(6, 12);
  const regionConf = Regions[region];
  if (!regionConf) {
    throw new Error(`Code région inconnu ${region}`);
  }
  const yy = year.substring(2, 4);
  const trimmedSerial = serial.substring(1);
  return SampleReference.parse(
    `${regionConf.shortName}-${yy}-${trimmedSerial}`
  );
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
  reference: SampleReference;
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
    reference: referenceFromNumeroDAP(numeroDAP),
    itemNumber,
    year,
    dayOfYear
  };
};
