import { XMLParser } from 'fast-xml-parser';
import { XmlDocument, XsdValidator } from 'libxml2-wasm';
import fs from 'node:fs';
import path from 'path';
import { sachaValidator } from './sachaValidator';

export const validateSachaXml = (xmlString: string): void => {
  const xsd = path.join(import.meta.dirname, './schema.xsd');
  const schema = XmlDocument.fromBuffer(fs.readFileSync(xsd));
  const validator = XsdValidator.fromDoc(schema);

  const xmlDocument = XmlDocument.fromString(xmlString);
  validator.validate(xmlDocument);
  xmlDocument.dispose();
};

export const validateAndDecodeSachaXml = (xmlString: string) => {
  validateSachaXml(xmlString);
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
  const xmlToJson = parser.parse(xmlString);

  return sachaValidator.decode(xmlToJson);
};
