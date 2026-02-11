import { XMLBuilder } from 'fast-xml-parser';
import {
  Department,
  DepartmentLabels
} from 'maestro-shared/referential/Department';
import { formatWithTz } from 'maestro-shared/utils/date';
import { RequiredNotNull } from 'maestro-shared/utils/typescript';
import { z, ZodObject } from 'zod';
import { Laboratories, SachaConf } from '../../repositories/kysely.type';
import config from '../../utils/config';
import {
  Acquittement,
  acquittementValidator,
  baseValidator,
  demandesAnalysesValidator
} from './sachaValidator';
import { validateSachaXml } from './validateSachaXml';

const xml = z.string().brand('XML');
export type Xml = z.infer<typeof xml>;

export type LaboratorySachaData = Pick<
  Laboratories,
  'sachaSigle' | 'sachaEmail' | 'shortName' | 'name' | 'sachaGpgPublicKey'
>;
type SachaLaboratory = RequiredNotNull<LaboratorySachaData>;

export type XmlFile = {
  fileName: string;
  fileType: SachaFileType;
  content: Xml;
  laboratory: SachaLaboratory;
};

const isSachaLaboratory = (
  laboratory: LaboratorySachaData
): laboratory is SachaLaboratory => {
  if (
    laboratory.sachaEmail === null ||
    laboratory.sachaSigle === null ||
    laboratory.sachaGpgPublicKey === null
  ) {
    throw new Error(
      `Le laboratoire ${laboratory.shortName} n'est pas configuré pour utiliser les EDI Sacha`
    );
  }

  return true;
};

export const generateXMLAcquitement = async (
  messagesAcquittement: Acquittement['MessageAcquittement'],
  messagesNonAcquittement: Acquittement['MessageNonAcquittement'],
  department: Department,
  dateNow: number,
  sachaConf: SachaConf,
  laboratory: LaboratorySachaData
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
  laboratory: LaboratorySachaData
): Promise<XmlFile> => {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true
  });

  if (!isSachaLaboratory(laboratory)) {
    throw new Error();
  }

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

  validateSachaXml(xmlResult);

  return { fileName, fileType, content: xmlResult, laboratory };
};

export const getXmlFileName = (
  fileType: SachaFileType,
  department: Department,
  laboratory: Pick<Laboratories, 'sachaSigle'>,
  dateNow: number
): string => {
  const currentDate: string = formatWithTz(dateNow, 'yyMMddHHmmssSS');
  return `${fileType}${getSenderSachaSigle(department)}${laboratory.sachaSigle}${currentDate}`;
};

export const getZipFileName = (
  fileType: SachaFileType,
  laboratory: Pick<Laboratories, 'sachaSigle'>,
  dateNow: number
): string => {
  const currentDate: string = formatWithTz(dateNow, 'yyMMddHHmm');
  return `${fileType}${laboratory.sachaSigle}${currentDate}_1.zip`;
};

const getSenderSachaSigle = (department: Department) => `DDSV${department}`;
