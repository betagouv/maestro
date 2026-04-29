import { XMLBuilder } from 'fast-xml-parser';
import {
  type Department,
  DepartmentLabels
} from 'maestro-shared/referential/Department';
import type { LaboratoryWithSacha } from 'maestro-shared/schema/Laboratory/Laboratory';
import type { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import type { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import { formatWithTz } from 'maestro-shared/utils/date';
import { type ZodObject, z } from 'zod';
import type { SachaConf } from '../../repositories/kysely.type';
import config from '../../utils/config';
import {
  type Acquittement,
  acquittementValidator,
  baseValidator,
  demandesAnalysesValidator
} from './sachaValidator';
import { validateSachaXml } from './validateSachaXml';

const xml = z.string().brand('XML');
export type Xml = z.infer<typeof xml>;

export type XmlFile = {
  fileName: string;
  fileType: SachaFileType;
  content: Xml;
};

export const generateXMLAcquitement = async (
  messagesAcquittement: Acquittement['MessageAcquittement'],
  messagesNonAcquittement: Acquittement['MessageNonAcquittement'],
  department: Department,
  dateNow: number,
  sachaConf: SachaConf,
  laboratory: LaboratoryWithSacha
): Promise<XmlFile> => {
  return generateXML(
    'AN01',
    {
      MessageAcquittement: messagesAcquittement,
      MessageNonAcquittement: messagesNonAcquittement
    },
    dateNow,
    department,
    sachaConf,
    laboratory
  );
};

export const getNumeroDAP = (
  sample: Pick<SampleChecked, 'reference'>,
  sampleItem: Pick<SampleItem, 'itemNumber' | 'copyNumber'>
) => {
  const firstSeparatorIndex = sample.reference.indexOf('-') + 1;
  const sampleIndex = sample.reference
    .substring(sample.reference.lastIndexOf('-') + 1)
    .padStart(6, '0');
  return Number(
    `${2000 + Number.parseInt(sample.reference.substring(firstSeparatorIndex, firstSeparatorIndex + 2), 10)}${sampleIndex}${sampleItem.itemNumber}${sampleItem.copyNumber}`
  );
};

export type SachaFileType = 'AN01' | 'DA01';
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
  SachaFileType,
  {
    name: string;
    content: ZodObject;
  }
>;

export const generateXML = async <T extends SachaFileType>(
  fileType: T,
  content: z.infer<(typeof fileTypeConf)[T]['content']>,
  dateNow: number,
  department: Department,
  sachaConf: SachaConf,
  laboratory: Pick<LaboratoryWithSacha, 'name' | 'sacha'>
): Promise<XmlFile> => {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true
  });

  const sacha = laboratory.sacha;
  const communication = sacha?.communication;
  const sigle = sacha?.sigle ?? '';

  const conf = fileTypeConf[fileType];

  const fileName: string = getXmlFileName(fileType, department, sigle, dateNow);

  const fullContent = z
    .object({
      ...baseValidator.shape,
      ...conf.content.shape
    })
    .encode({
      MessageParametres: {
        CodeScenario: 'E.D.I. SIGAL/LABOS',
        VersionScenario: '1.0.1',
        TypeFichier: fileType,
        NomFichier: fileName,
        VersionReferenceStandardisees: sachaConf.versionReferenceStandardisees,
        VersionReferencePrescripteur: sachaConf.versionReferencePrescripteur,
        NomLogicielCreation: 'SIGAL',
        VersionLogicielCreation: '4.0'
      },
      Emetteur: {
        Sigle: getSenderSachaSigle(department),
        LibellePartenaire: `DDPP ${DepartmentLabels[department]}`,
        EmailPartenaire: config.sigal.email
      },
      Destinataire: {
        Sigle: sigle,
        LibellePartenaire: laboratory.name,
        EmailPartenaire:
          communication?.method === 'EMAIL' ? communication.email : ''
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

  validateSachaXml(xmlResult);

  return { fileName, fileType, content: xmlResult };
};

export const getXmlFileName = (
  fileType: SachaFileType,
  department: Department,
  sigle: string,
  dateNow: number
): string => {
  const currentDate: string = formatWithTz(dateNow, 'yyMMddHHmmssSS');
  return `${fileType}${getSenderSachaSigle(department)}${sigle}${currentDate}`;
};

export const getZipFileName = (
  fileType: SachaFileType,
  sigle: string,
  dateNow: number
): string => {
  const currentDate: string = formatWithTz(dateNow, 'yyMMddHHmm');
  return `${fileType}${sigle}${currentDate}_1.zip`;
};

const getSenderSachaSigle = (department: Department) => `DDSV${department}`;
