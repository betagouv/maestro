import { XMLBuilder } from 'fast-xml-parser';
import { XmlDocument, XsdValidator } from 'libxml2-wasm';
import { Brand } from 'maestro-shared/constants';
import { LaboratoryShortName } from 'maestro-shared/referential/Laboratory';
import fs from 'node:fs';
import path from 'path';
import { z, ZodObject } from 'zod';
import {
  Acquittement,
  acquittementValidator,
  baseValidator,
  DAI,
  demandesAnalysesValidator
} from './sachaValidator';

const xml = z.string().brand('XML');
export type Xml = z.infer<typeof xml>;

export type XmlFile = { fileName: string; content: Xml };

export const generateXMLAcquitement = (
  messagesAcquittement: Acquittement['MessageAcquittement'],
  messagesNonAcquittement: Acquittement['MessageNonAcquittement'],
  laboratory: LaboratoryShortName
): XmlFile => {
  return generateXML(
    'AN',
    {
      MessageAcquittement: messagesAcquittement,
      MessageNonAcquittement: messagesNonAcquittement
    },
    laboratory
  );
};

export const generateXMLDAI = (
  dai: DAI['DemandeType'],
  laboratory: LaboratoryShortName
): XmlFile => {
  return generateXML(
    'DA',
    {
      DemandeType: dai
    },
    laboratory
  );
};

type FileType = 'AN' | 'DA';
const fileTypeConf = {
  AN: {
    name: 'AcquittementNonAcquittement',
    content: acquittementValidator.omit({
      MessageParametres: true,
      Emetteur: true,
      Destinataire: true
    })
  },
  DA: {
    name: 'DemandesAnalyses',
    content: demandesAnalysesValidator.omit({
      MessageParametres: true,
      Emetteur: true,
      Destinataire: true
    })
  }
} as const satisfies Record<
  FileType,
  {
    name: string;
    content: ZodObject;
  }
>;

const generateXML = <T extends FileType>(
  fileType: T,
  content: z.infer<(typeof fileTypeConf)[T]['content']>,
  laboratory: LaboratoryShortName
): XmlFile => {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true
  });

  const conf = fileTypeConf[fileType];

  // TODO
  const fileName: string = 'TODO_' + Math.random();

  const fullContent = z
    .object({
      ...baseValidator.shape,
      ...conf.content.shape
    })
    .encode({
      //FIXME
      MessageParametres: {
        CodeScenario: 'E.D.I. SIGAL/LABOS',
        VersionScenario: '1.0.1',
        TypeFichier: `${fileType}01`,
        NomFichier: fileName,
        NomLogicielCreation: 'SIGAL',
        VersionLogicielCreation: '4.0'
      },
      Emetteur: {
        Sigle: Brand,
        Nom: Brand,
        Telephone: Brand,
        LibellePartenaire: Brand,
        EmailPartenaire: Brand
      },
      //FIXME
      Destinataire: {
        Sigle: laboratory,
        Nom: laboratory,
        Telephone: laboratory,
        LibellePartenaire: laboratory,
        EmailPartenaire: laboratory
      },
      ...content
    });

  const xmlContent = builder.build({
    '?xml': {
      '@_version': '1.0',
      '@_encoding': 'UTF-8'
    },
    [conf.name]: {
      '@_schemavalidation': `${conf.name}.xsd`,
      ...fullContent
    }
  });

  const xmlResult = xml.parse(xmlContent);

  const xsd = path.join(import.meta.dirname, `./schema.xsd`);
  const schema = XmlDocument.fromBuffer(fs.readFileSync(xsd));
  const validator = XsdValidator.fromDoc(schema);

  const xmlDocument = XmlDocument.fromString(xmlResult);
  validator.validate(xmlDocument);

  xmlDocument.dispose();
  return { fileName, content: xmlResult };
};
