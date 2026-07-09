import { expect, test } from 'vitest';
import {
  acquittementMessageValidator,
  resultatsMessageValidator
} from './sachaValidator';
import { readSachaExample } from './testUtils';
import { validateAndDecodeSachaXml } from './validateSachaXml';

test.each([
  'example-rai-1.xml',
  'example-rai-RestPest_DAOA.xml',
  'example-rai-RestPest_DAOA_CU.xml'
])(`import un fichier RAI de l'EDI Sacha %s`, (fileName) => {
  expect(
    validateAndDecodeSachaXml(
      readSachaExample(fileName),
      resultatsMessageValidator
    )
  ).toMatchSnapshot();
});

test.each([
  'example-an-1.xml',
  'example-an-2.xml'
])(`import un fichier AN de l'EDI Sacha %s`, (fileName) => {
  expect(
    validateAndDecodeSachaXml(
      readSachaExample(fileName),
      acquittementMessageValidator
    )
  ).toMatchSnapshot();
});
