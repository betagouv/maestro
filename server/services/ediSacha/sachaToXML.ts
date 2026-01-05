import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { XMLBuilder } from 'fast-xml-parser';
import { XmlDocument, XsdValidator } from 'libxml2-wasm';
import {
  Department,
  DepartmentLabels
} from 'maestro-shared/referential/Department';
import { RequiredNotNull } from 'maestro-shared/utils/typescript';
import fs from 'node:fs';
import path from 'path';
import { z, ZodObject } from 'zod';
import { Laboratories } from '../../repositories/kysely.type';
import { laboratoryRepository } from '../../repositories/laboratoryRepository';
import config from '../../utils/config';
import {
  Acquittement,
  acquittementValidator,
  baseValidator,
  DAI,
  demandesAnalysesValidator
} from './sachaValidator';

const xml = z.string().brand('XML');
export type Xml = z.infer<typeof xml>;

export type XmlFile = {
  fileName: string;
  fileType: FileType;
  content: Xml;
  laboratory: RequiredNotNull<
    Pick<Laboratories, 'sachaSigle' | 'sachaEmail' | 'shortName' | 'name'>
  >;
};

export const loadLaboratoryCall =
  (laboratoryId: string) =>
  async (): Promise<{
    laboratory: XmlFile['laboratory'];
  }> => {
    const laboratory = await laboratoryRepository.findUnique(laboratoryId);
    if (!laboratory) {
      throw new Error(`Le laboratoire ${laboratoryId} est introuvable.`);
    }

    if (laboratory.sachaEmail === null || laboratory.sachaSigle) {
      throw new Error(
        `Le laboratoire ${laboratory.shortName} n'est pas configuré pour utiliser les EDI Sacha`
      );
    }

    if (laboratory.sachaSigle === null) {
      throw new Error(
        `Le laboratoire ${laboratory.shortName} n'est pas configuré pour utiliser les EDI Sacha`
      );
    }

    return {
      laboratory: {
        sachaSigle: laboratory.sachaSigle,
        sachaEmail: laboratory.sachaEmail,
        shortName: laboratory.shortName,
        name: laboratory.name
      }
    };
  };

export const generateXMLAcquitement = async (
  messagesAcquittement: Acquittement['MessageAcquittement'],
  messagesNonAcquittement: Acquittement['MessageNonAcquittement'],
  loadLaboratoryAndSender: ReturnType<typeof loadLaboratoryCall>,
  department: Department,
  dateNow: number
): Promise<XmlFile> => {
  return generateXML(
    'AN01',
    {
      MessageAcquittement: messagesAcquittement,
      MessageNonAcquittement: messagesNonAcquittement
    },
    dateNow,
    department,
    loadLaboratoryAndSender
  );
};

export const generateXMLDAI = (
  dai: DAI['DemandeType'],
  loadLaboratoryAndSender: ReturnType<typeof loadLaboratoryCall>,
  department: Department,
  dateNow: number
): Promise<XmlFile> => {
  return generateXML(
    'DA01',
    {
      DemandeType: dai
    },
    dateNow,
    department,
    loadLaboratoryAndSender
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

const generateXML = async <T extends FileType>(
  fileType: T,
  content: z.infer<(typeof fileTypeConf)[T]['content']>,
  dateNow: number,
  department: Department,
  loadLaboratoryAndSender: ReturnType<typeof loadLaboratoryCall>
): Promise<XmlFile> => {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true
  });

  const { laboratory } = await loadLaboratoryAndSender();

  const conf = fileTypeConf[fileType];

  const fileName: string = getXmlFileName(
    fileType,
    department,
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
        Sigle: getSenderSachaSigle(department),
        LibellePartenaire: `DDPP ${DepartmentLabels[department]}`,
        EmailPartenaire: config.sigal.email
      },
      Destinataire: {
        Sigle: laboratory.sachaSigle,
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
  return { fileName, fileType, content: xmlResult, laboratory };
};

export const getXmlFileName = (
  fileType: FileType,
  department: Department,
  laboratory: Pick<Laboratories, 'sachaSigle'>,
  dateNow: number
): string => {
  const currentDate: string = format(dateNow, 'yyMMddHHmmssSS', {
    locale: fr
  });
  return `${fileType}${getSenderSachaSigle(department)}${laboratory.sachaSigle}${currentDate}`;
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

export const getSenderSachaSigle = (department: Department) =>
  `DDSV${department}`;
