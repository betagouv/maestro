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
  .transform((val) => Number(`${val}`.replace(',', '.')))
  .pipe(z.number());

export const padReferenceSerial = (
  year: number,
  serial: number | string
): string => String(serial).padStart(year < 2026 ? 4 : 5, '0');

export const parseSampleReference = (
  input: string
): { reference: string; copyNumber: number; itemNumber: number } | null => {
  const parts = input.split('-');
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
