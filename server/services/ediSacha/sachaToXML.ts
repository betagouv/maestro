import { XMLBuilder } from 'fast-xml-parser';
import { Brand } from 'maestro-shared/constants';
import { LaboratoryName } from 'maestro-shared/referential/Laboratory';
import { z } from 'zod';
import { Acquittement } from './sachaValidator';

const xml = z.string().brand('XML');
type Xml = z.infer<typeof xml>;

export const generateXMLAcquitement = (
  messagesAcquittement: Acquittement['MessageAcquittement'],
  messagesNonAcquittement: Acquittement['MessageNonAcquittement'],
  laboratory: LaboratoryName
): Xml => {
  const acquitement: Acquittement = {
    //FIXME
    MessageParametres: {
      CodeScenario: '',
      VersionScenario: '',
      TypeFichier: 'AN01',
      NomFichier: '',
      NomLogicielCreation: '',
      VersionLogicielCreation: ''
    },
    //FIXME
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
    MessageAcquittement: messagesAcquittement,
    MessageNonAcquittement: messagesNonAcquittement
  };

  return generateXML({
    AcquittementNonAcquittement: {
      ...acquitement,
      '@_schemavalidation': 'AcquittementNonAcquittement.xsd'
    }
  });
};

const generateXML = (content: {
  [key: string]: {
    '@_schemavalidation': string;
  };
}): Xml => {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true
  });
  const xmlContent = builder.build({
    '?xml': {
      '@_encoding': 'UTF-8',
      '@_version': '1.0'
    },
    ...content
  });

  return xml.parse(xmlContent);
};
