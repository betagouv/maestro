import { XMLParser } from 'fast-xml-parser';
import { readFileSync } from 'fs';
import path from 'path';
import { expect, test } from 'vitest';
import { sachaValidator } from './sachaValidator';

test.each([
  'example-rai-1.xml',
  'example-rai-2.xml',
  'example-an-1.xml',
  'example-an-2.xml'
])(`import un fichier de l'EDI Sacha RAI %s`, (fileName) => {
  const file = path.join(import.meta.dirname, `./${fileName}`);
  const content = readFileSync(file);

  const parser = new XMLParser({
    parseTagValue: false,
    isArray: (_tagName, path): boolean => {
      return [
        'Resultats.DialogueResultatType.DialoguePlanAnalyseType',
        'Resultats.DialogueResultatType.DialoguePlanAnalyseType.DialogueAnalyseType',
        'Resultats.DialogueResultatType.DialoguePlanAnalyseType.DialogueAnalyseType.DialogueResultatEchantillonAnalyse'
      ].includes(path);
    }
  });
  const xmlToJson = parser.parse(content);

  expect(sachaValidator.decode(xmlToJson)).toMatchSnapshot();
});
