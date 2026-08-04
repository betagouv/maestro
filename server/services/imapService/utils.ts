import { parse } from 'csv-parse/sync';
import { z } from 'zod';

export const csvToJson = (
  csv: string,
  separator: string
): Record<string, string>[] => {
  return parse(csv, {
    columns: true,
    skip_empty_lines: true,
    skip_records_with_empty_values: true,
    delimiter: separator,
    trim: true
  });
};

export const frenchNumberStringValidator = z
  .string()
  .transform((val) => `${val}`.replace(',', '.').trim())
  .transform((val) => (val === '' ? null : Number(val)))
  .pipe(z.number().nullable());

export const padReferenceSerial = (
  year: number,
  serial: number | string
): string => String(serial).padStart(year < 2026 ? 4 : 5, '0');

export const sampleReferenceValidator = (
  laboratoryName: string
): z.ZodType<
  { reference: string; copyNumber: number; itemNumber: number },
  string
> =>
  z.string().transform((l, ctx) => {
    const parsed = parseSampleReference(l);
    if (!parsed) {
      ctx.addIssue({
        code: 'custom',
        message: `Référence ${laboratoryName} invalide: ${l}`
      });
      return z.NEVER;
    }
    return parsed;
  });

export const parseSampleReference = (
  input: string
): { reference: string; copyNumber: number; itemNumber: number } | null => {
  // collapse spaces around separators, then drop any trailing free text (e.g. "GES-26-00621-A-1 BLE (FROMENT)")
  const [normalized] = input
    .trim()
    .replace(/\s*-\s*/g, '-')
    .split(/\s+/);

  const parts = normalized.split('-');
  if (parts.length < 3) return null;

  const [shortName, yearPart, serialPart] = parts;
  const year = 2000 + Number.parseInt(yearPart, 10);
  const reference = `${shortName}-${yearPart}-${padReferenceSerial(year, serialPart)}`;
  const tail = parts.slice(3).join(''); // "", "2", "A2", "A" (letter+copy collapsed)

  const match = tail.match(/^([A-Z])?(\d*)$/);
  if (!match) return null;

  const [, letter, copy] = match;
  return {
    reference,
    copyNumber: copy ? Number.parseInt(copy, 10) : 1,
    itemNumber: letter ? letter.charCodeAt(0) - 'A'.charCodeAt(0) + 1 : 1
  };
};
