import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { SachaResultats } from './sachaValidator';
import { resultatsMessageValidator } from './sachaValidator';
import { validateAndDecodeSachaXml } from './validateSachaXml';

export const readSachaExample = (fileName: string): string =>
  readFileSync(path.join(import.meta.dirname, fileName)).toString();

export const decodeValidRai = (): SachaResultats =>
  validateAndDecodeSachaXml(
    readSachaExample('example-rai-daoa-valid.xml'),
    resultatsMessageValidator
  ).Resultats;
