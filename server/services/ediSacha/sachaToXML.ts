import { XMLBuilder } from 'fast-xml-parser';
import { XmlDocument, XsdValidator } from 'libxml2-wasm';
import {
  Department,
  DepartmentLabels
} from 'maestro-shared/referential/Department';
import { ProgrammingPlanKindWithSacha } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import {
  CommemoratifSigle,
  CommemoratifValueSigle,
  SachaCommemoratifRecord
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import {
  getSampleItemReference,
  SampleItem
} from 'maestro-shared/schema/Sample/SampleItem';
import { SampleMatrixSpecificData } from 'maestro-shared/schema/Sample/SampleMatrixSpecificData';
import { SampleSpecificDataRecord } from 'maestro-shared/schema/Sample/SampleSpecificDataAttribute';
import { formatWithTz, toMaestroDate } from 'maestro-shared/utils/date';
import { RequiredNotNull } from 'maestro-shared/utils/typescript';
import fs from 'node:fs';
import path from 'path';
import { z, ZodObject } from 'zod';
import { Laboratories, SachaConf } from '../../repositories/kysely.type';
import { laboratoryRepository } from '../../repositories/laboratoryRepository';
import { sachaConfRepository } from '../../repositories/sachaConfRepository';
import config from '../../utils/config';
import {
  NotPPVMatrix,
  SigleContexteIntervention,
  SigleMatrix,
  SiglePlanAnalyse
} from './sachaReferential';
import {
  Acquittement,
  acquittementValidator,
  baseValidator,
  demandesAnalysesValidator,
  toSachaDateTime
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

export const loadLaboratoryAndSachaConfCall =
  (laboratoryId: string) =>
  async (): Promise<{
    laboratory: XmlFile['laboratory'];
    sachaConf: SachaConf;
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

    const sachaConf = await sachaConfRepository.get();

    return {
      laboratory: {
        sachaSigle: laboratory.sachaSigle,
        sachaEmail: laboratory.sachaEmail,
        shortName: laboratory.shortName,
        name: laboratory.name
      },
      sachaConf
    };
  };

export const generateXMLAcquitement = async (
  messagesAcquittement: Acquittement['MessageAcquittement'],
  messagesNonAcquittement: Acquittement['MessageNonAcquittement'],
  loadLaboratoryAndSachaConf: ReturnType<typeof loadLaboratoryAndSachaConfCall>,
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
    loadLaboratoryAndSachaConf
  );
};

export const getCommemoratifs = (
  specificData: SampleMatrixSpecificData,
  sampleSpecifDataRecord: SampleSpecificDataRecord,
  sachaCommemoratifRecord: SachaCommemoratifRecord
): ({ sigle: CommemoratifSigle } & (
  | { textValue: string }
  | { sigleValue: CommemoratifValueSigle }
))[] => {
  const commemoratifs: ReturnType<typeof getCommemoratifs> = [];
  for (const specificDataKey of Object.keys(specificData)) {
    if (
      specificDataKey !== 'programmingPlanKind' &&
      specificDataKey in specificData
    ) {
      const conf = sampleSpecifDataRecord[specificDataKey];
      if (conf?.inDai) {
        const specificDataValue: string =
          specificData[specificDataKey as keyof SampleMatrixSpecificData];

        if (!conf.sachaCommemoratifSigle) {
          throw new Error(
            `Configuration SACHA incomplète: ${specificDataKey} `
          );
        }

        const typeDonnee =
          sachaCommemoratifRecord[conf.sachaCommemoratifSigle].typeDonnee;

        if (typeDonnee === 'list') {
          if (
            !sampleSpecifDataRecord[specificDataKey].values[specificDataValue]
          ) {
            throw new Error(
              `Configuration SACHA incomplète: ${specificDataKey} ${specificDataValue}`
            );
          }
          commemoratifs.push({
            sigle: conf.sachaCommemoratifSigle,
            sigleValue:
              sampleSpecifDataRecord[specificDataKey].values[specificDataValue]
          });
        } else {
          let textValue;
          if (typeDonnee === 'date') {
            textValue = toSachaDateTime(new Date(specificDataValue));
          } else {
            textValue = `${specificDataValue}`;
          }
          commemoratifs.push({
            sigle: conf.sachaCommemoratifSigle,
            textValue
          });
        }
      } else if (conf === undefined) {
        throw new Error(`Configuration SACHA incomplète: ${specificDataKey}`);
      }
    }
  }
  return commemoratifs;
};

export const generateXMLDAI = (
  sample: Pick<
    SampleChecked,
    | 'specificData'
    | 'sampledAt'
    | 'lastUpdatedAt'
    | 'company'
    | 'ownerEmail'
    | 'sampler'
    | 'department'
    | 'matrix'
    | 'reference'
  >,
  sampleItem: Pick<SampleItem, 'sealId' | 'itemNumber' | 'copyNumber'>,
  loadLaboratoryAndSachaConf: ReturnType<typeof loadLaboratoryAndSachaConfCall>,
  dateNow: number,

  sampleSpecifDataRecord: SampleSpecificDataRecord,
  sachaCommemoratifRecord: SachaCommemoratifRecord
): Promise<XmlFile> => {
  const programmingPlanKind = sample.specificData
    .programmingPlanKind as ProgrammingPlanKindWithSacha;

  if (!ProgrammingPlanKindWithSacha.options.includes(programmingPlanKind)) {
    throw new Error(`Pas d'EDI Sacha pour ${programmingPlanKind}`);
  }

  const matrix = sample.matrix;
  if (!(matrix in SigleMatrix)) {
    throw new Error(
      `Pas de Sigle SACHA associé à la matrice ${sample.matrix}.`
    );
  }

  const commemoratifs = getCommemoratifs(
    sample.specificData,
    sampleSpecifDataRecord,
    sachaCommemoratifRecord
  );

  return generateXML(
    'DA01',
    {
      DemandeType: {
        DialogueDemandeIntervention: {
          NumeroDAP: Number(
            `${new Date(dateNow).getFullYear()}${sample.reference.substring(sample.reference.lastIndexOf('-') + 1)}${sampleItem.copyNumber}${sampleItem.itemNumber}`
          ),
          SigleContexteIntervention:
            SigleContexteIntervention[programmingPlanKind],
          DateIntervention: toMaestroDate(sample.sampledAt),
          DateModification: toSachaDateTime(sample.lastUpdatedAt)
        },
        ReferenceEtablissementType: {
          ReferenceEtablissement: {
            //FIXME EDI
            SigleIdentifiant: '',
            Identifiant: sample.company.name,
            Nom: sample.company.name,
            CodePostal: `${sample.company.postalCode ?? ''} ${sample.company.city ?? ''}`,
            Adresse1: sample.company.address ?? undefined,
            Email: sample.ownerEmail ?? undefined
          }
        },
        DialogueActeurType: {
          DialogueActeur: {
            //FIXME EDI
            SigleIdentifiant: '',
            Identifiant: '',
            Nom: sample.sampler.name ?? ''
            //FIXME EDI email
          }
        },
        DialogueEchantillonCommemoratifType: [
          {
            DialogueEchantillonComplet: {
              NumeroEchantillon: sampleItem.itemNumber,
              SigleMatriceSpecifique: SigleMatrix[matrix as NotPPVMatrix],
              NumeroEtiquette: getSampleItemReference(
                sample,
                sampleItem.itemNumber,
                sampleItem.copyNumber
              ),
              Commentaire: sampleItem.sealId ?? ''
            },
            DialogueCommemoratif: commemoratifs.map((c) => {
              if ('sigleValue' in c) {
                return {
                  Sigle: c.sigle,
                  SigleValeur: c.sigleValue
                };
              }
              return {
                Sigle: c.sigle,
                TexteValeur: c.textValue
              };
            })
          }
        ],
        ReferencePlanAnalyseType: {
          ReferencePlanAnalyseEffectuer: {
            SiglePlanAnalyse: SiglePlanAnalyse[programmingPlanKind]
          },
          ReferencePlanAnalyseContenu: {
            LibelleMatrice: '',
            SigleAnalyte: '',
            SigleMethodeSpecifique: '',
            //FIXME EDI ??
            Depistage: false,
            Confirmation: false,
            Statut: 'G'
          }
        }
      }
    },
    dateNow,
    sample.department,
    loadLaboratoryAndSachaConf
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
  loadLaboratoryAndSachaConf: ReturnType<typeof loadLaboratoryAndSachaConfCall>
): Promise<XmlFile> => {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true
  });

  const { laboratory, sachaConf } = await loadLaboratoryAndSachaConf();

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
      //FIXME EDI
      MessageParametres: {
        CodeScenario: 'E.D.I. SIGAL/LABOS',
        VersionScenario: '1.0.1',
        TypeFichier: fileType,
        NomFichier: fileName,
        VersionReferenceStandardisees: sachaConf.versionReferenceStandardisees,
        VersionReferencePrescripteur: '',
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
  const currentDate: string = formatWithTz(dateNow, 'yyMMddHHmmssSS');
  return `${fileType}${getSenderSachaSigle(department)}${laboratory.sachaSigle}${currentDate}`;
};

export const getZipFileName = (
  fileType: FileType,
  laboratory: Pick<Laboratories, 'sachaSigle'>,
  dateNow: number
): string => {
  const currentDate: string = formatWithTz(dateNow, 'yyMMddHHmm');
  return `${fileType}${laboratory.sachaSigle}${currentDate}_1.zip`;
};

const getSenderSachaSigle = (department: Department) => `DDSV${department}`;
