import fs from 'node:fs';
import path from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import { XmlDocument, XsdValidator } from 'libxml2-wasm';
import type { z } from 'zod';
import { RaiLabError, RaiMaestroError } from './sachaErrors';

export const validateSachaXml = (xmlString: string): void => {
  const xsd = path.join(import.meta.dirname, './schema.xsd');
  const schema = XmlDocument.fromBuffer(fs.readFileSync(xsd));
  const validator = XsdValidator.fromDoc(schema);

  const xmlDocument = XmlDocument.fromString(xmlString);
  validator.validate(xmlDocument);
  xmlDocument.dispose();
};

export const validateAndDecodeSachaXml = <S extends z.ZodType>(
  xmlString: string,
  schema: S,
  xmlDocumentId: string | null = null
): z.output<S> => {
  try {
    validateSachaXml(xmlString);
  } catch (e) {
    throw new RaiLabError(
      `XML invalide : ${(e as Error).message}`,
      xmlDocumentId
    );
  }
  try {
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
    return schema.decode(xmlToJson);
  } catch (e) {
    throw new RaiMaestroError(
      `XML conforme à la XSD mais décodage impossible : ${(e as Error).message}`,
      xmlDocumentId
    );
  }
};
