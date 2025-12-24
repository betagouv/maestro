import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { XMLBuilder } from 'fast-xml-parser';
import { XmlDocument, XsdValidator } from 'libxml2-wasm';
import { Brand } from 'maestro-shared/constants';
import fs from 'node:fs';
import path from 'path';
import { z, ZodObject } from 'zod';
import { Laboratories } from '../../repositories/kysely.type';
import {
  Acquittement,
  acquittementValidator,
  baseValidator,
  DAI,
  demandesAnalysesValidator
} from './sachaValidator';

const xml = z.string().brand('XML');
export type Xml = z.infer<typeof xml>;

export type XmlFile = { fileName: string; fileType: FileType; content: Xml };

export const generateXMLAcquitement = (
  messagesAcquittement: Acquittement['MessageAcquittement'],
  messagesNonAcquittement: Acquittement['MessageNonAcquittement'],
  laboratory: Pick<
    Laboratories,
    'sachaSigle' | 'sachaEmail' | 'shortName' | 'name'
  >,
  dateNow: number
): XmlFile => {
  return generateXML(
    'AN01',
    {
      MessageAcquittement: messagesAcquittement,
      MessageNonAcquittement: messagesNonAcquittement
    },
    laboratory,
    dateNow
  );
};

export const generateXMLDAI = (
  dai: DAI['DemandeType'],
  laboratory: Pick<
    Laboratories,
    'sachaSigle' | 'sachaEmail' | 'shortName' | 'name'
  >,
  dateNow: number
): XmlFile => {
  return generateXML(
    'DA01',
    {
      DemandeType: dai
    },
    laboratory,
    dateNow
  );
};

type FileType = 'AN01' | 'DA01';
const fileTypeConf = {
  AN01: {
    name: 'AcquittementNonAcquittement',
    content: acquittementValidator.omit({
      MessageParametres: true,
      Emetteur: true,
      Destinataire: true
    })
  },
  DA01: {
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
  laboratory: Pick<
    Laboratories,
    'sachaSigle' | 'sachaEmail' | 'shortName' | 'name'
  >,
  dateNow: number
): XmlFile => {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true
  });

  if (laboratory.sachaEmail === null || laboratory.sachaSigle === null) {
    throw new Error(
      `Le laboratoire ${laboratory.shortName} n'est pas configuré pour utiliser les EDI Sacha`
    );
  }
  const conf = fileTypeConf[fileType];

  const fileName: string = getXmlFileName(
    fileType,
    laboratory,
    laboratory,
    dateNow
  );

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
        TypeFichier: fileType,
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
      Destinataire: {
        Sigle: laboratory.sachaSigle,
        Nom: laboratory.shortName,
        Telephone: '',
        LibellePartenaire: laboratory.name,
        EmailPartenaire: laboratory.sachaEmail
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
  return { fileName, fileType, content: xmlResult };
};

export const getXmlFileName = (
  fileType: FileType,
  //TODO replace Laboratories
  issuer: Pick<Laboratories, 'sachaSigle'>,
  laboratory: Pick<Laboratories, 'sachaSigle'>,
  dateNow: number
): string => {
  const currentDate: string = format(dateNow, 'yyMMddHHmmssSS', {
    locale: fr
  });
  return `${fileType}${issuer.sachaSigle}${laboratory.sachaSigle}${currentDate}`;
};

export const getZipFileName = (
  fileType: FileType,
  laboratory: Pick<Laboratories, 'sachaSigle'>,
  dateNow: number
): string => {
  const currentDate: string = format(dateNow, 'yyMMddHHmm', {
    locale: fr
  });
  return `${fileType}${laboratory.sachaSigle}${currentDate}_1.zip`;
};
