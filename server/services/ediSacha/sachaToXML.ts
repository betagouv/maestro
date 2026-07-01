import XMLBuilder from 'fast-xml-builder';
import {
  type Department,
  DepartmentLabels
} from 'maestro-shared/referential/Department';
import type { LaboratoryShortName } from 'maestro-shared/referential/Laboratory';
import type { LaboratoryWithSacha } from 'maestro-shared/schema/Laboratory/Laboratory';
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
  laboratory: Pick<LaboratoryWithSacha, 'name' | 'shortName' | 'sacha'>
): Promise<XmlFile> => {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true
  });

  const sacha = laboratory.sacha;
  const communication = sacha?.communication;
  const sigle = sacha?.sigle ?? '';

  const conf = fileTypeConf[fileType];

  const withPrefix = hasSenderPrefix(laboratory.shortName);
  const senderEmail = withPrefix
    ? config.sigal.emailDdsvPrefix
    : config.sigal.email;

  const fileName: string = getXmlFileName(
    fileType,
    department,
    sigle,
    dateNow,
    withPrefix
  );

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
        VersionLogicielCreation: '4.0',
        CodeReferentielPrescripteur: 'SIGAL'
      },
      Emetteur: {
        Sigle: getSenderSachaSigle(department, withPrefix),
        LibellePartenaire: `DDPP ${DepartmentLabels[department]}`,
        EmailPartenaire: senderEmail
      },
      Destinataire: {
        Sigle: sigle,
        LibellePartenaire: laboratory.name,
        EmailPartenaire:
          communication?.method === 'EMAIL' ? communication.recipientEmail : ''
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
  dateNow: number,
  withPrefix: boolean = true
): string => {
  const currentDate: string = formatWithTz(dateNow, 'yyMMddHHmmssSSS');
  return `${fileType}${getSenderSachaSigle(department, withPrefix)}${sigle}${currentDate}`;
};

export const getZipFileName = (
  fileType: SachaFileType,
  sigle: string,
  dateNow: number
): string => {
  const currentDate: string = formatWithTz(dateNow, 'yyMMddHHmm');
  const orderNumber: string = formatWithTz(dateNow, 'ssSSS');
  return `${fileType}${sigle}${currentDate}_${orderNumber}.zip`;
};

export const getSenderSachaSigle = (
  department: Department,
  withPrefix: boolean = true
) => `${withPrefix ? 'M' : ''}DDSV${department}`;

const SACHA_PREFIXED_LABORATORY_SHORT_NAMES: LaboratoryShortName[] = ['LDA 72'];

const hasSenderPrefix = (shortName: LaboratoryShortName): boolean =>
  SACHA_PREFIXED_LABORATORY_SHORT_NAMES.includes(shortName);
