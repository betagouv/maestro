import { XMLBuilder } from 'fast-xml-parser';
import { Brand } from 'maestro-shared/constants';
import { LaboratoryName } from 'maestro-shared/referential/Laboratory';
import { z, ZodObject } from 'zod';
import {
  Acquittement,
  acquittementValidator,
  DAI,
  demandesAnalysesValidator
} from './sachaValidator';

const xml = z.string().brand('XML');
type Xml = z.infer<typeof xml>;

export const generateXMLAcquitement = (
  messagesAcquittement: Acquittement['MessageAcquittement'],
  messagesNonAcquittement: Acquittement['MessageNonAcquittement'],
  laboratory: LaboratoryName
): Xml => {
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
  laboratory: LaboratoryName
): Xml => {
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
  laboratory: LaboratoryName
): Xml => {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true
  });

  const conf = fileTypeConf[fileType];
  const xmlContent = builder.build({
    '?xml': {
      '@_encoding': 'UTF-8',
      '@_version': '1.0'
    },
    [conf.name]: {
      '@_schemavalidation': `${conf.name}.xsd`,
      //FIXME
      MessageParametres: {
        CodeScenario: 'E.D.I. SIGAL/LABOS',
        VersionScenario: '1.0.1',
        TypeFichier: `${fileType}01`,
        NomFichier: '',
        NomLogicielCreation: 'SIGAL',
        VersionLogicielCreation: '4.0'
      },
      Emetteur: {
        Nom: Brand,
        Sigle: Brand,
        LibellePartenaire: Brand,
        EmailPartenaire: Brand,
        Telephone: Brand
      },
      //FIXME
      Destinataire: {
        EmailPartenaire: laboratory,
        LibellePartenaire: laboratory,
        Nom: laboratory,
        Sigle: laboratory,
        Telephone: laboratory
      },
      ...content
    }
  });

  return xml.parse(xmlContent);
};
