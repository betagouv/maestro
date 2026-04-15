import fs from 'node:fs';
import path from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import { XmlDocument, XsdValidator } from 'libxml2-wasm';
import { err, ok, type Result } from 'maestro-shared/utils/result';
import type { SachaError } from './sachaErrors';
import { sachaValidator } from './sachaValidator';

export const validateSachaXml = (xmlString: string): void => {
  const xsd = path.join(import.meta.dirname, './schema.xsd');
  const schema = XmlDocument.fromBuffer(fs.readFileSync(xsd));
  const validator = XsdValidator.fromDoc(schema);

  const xmlDocument = XmlDocument.fromString(xmlString);
  validator.validate(xmlDocument);
  xmlDocument.dispose();
};

export const validateAndDecodeSachaXml = (
  xmlString: string,
  fileName: string
): Result<
  ReturnType<typeof sachaValidator.decode>,
  Extract<SachaError, { kind: 'xml-invalid' }>
> => {
  try {
    validateSachaXml(xmlString);
    const parser = new XMLParser({
      parseTagValue: false,
      isArray: (_tagName, path): boolean => {
        return [
          'Resultats.DialogueResultatType.DialoguePlanAnalyseType',
          'Resultats.DialogueResultatType.DialoguePlanAnalyseType.DialogueAnalyseType',
          'Resultats.DialogueResultatType.DialoguePlanAnalyseType.DialogueAnalyseType.DialogueResultatEchantillonAnalyse'
        ].includes(path as string);
      }
    });
    const xmlToJson = parser.parse(xmlString);
    return ok(sachaValidator.decode(xmlToJson));
  } catch (e) {
    return err({ kind: 'xml-invalid', fileName, detail: (e as Error).message });
  }
};
