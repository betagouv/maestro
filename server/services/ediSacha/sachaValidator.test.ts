import { readFileSync } from 'fs';
import path from 'path';
import { expect, test } from 'vitest';
import { validateAndDecodeSachaXml } from './validateSachaXml';

test.each([
  'example-rai-1.xml',
  'example-rai-RestPest_DAOA.xml',
  'example-rai-RestPest_DAOA_CU.xml',
  'example-an-1.xml',
  'example-an-2.xml'
])(`import un fichier de l'EDI Sacha RAI %s`, (fileName) => {
  const file = path.join(import.meta.dirname, `./${fileName}`);
  const content = readFileSync(file);

  expect(validateAndDecodeSachaXml(content.toString())).toMatchSnapshot();
});
