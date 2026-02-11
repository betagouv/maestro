import { expect, test } from 'vitest';
import { SachaConf } from '../../repositories/kysely.type';
import {
  generateXMLAcquitement,
  getXmlFileName,
  getZipFileName,
  LaboratorySachaData
} from './sachaToXML';
import { toSachaDateTime } from './sachaValidator';

const laboratory = {
  shortName: 'LDA 72',
  sachaSigle: 'LDA72',
  name: 'Innovalys 72',
  sachaEmail: 'fake@email.fr',
  sachaGpgPublicKey: 'gpg'
} as const satisfies LaboratorySachaData;

const sachaConf = {
  versionReferenceStandardisees: 'v12341234',
  versionReferencePrescripteur: 'v234'
} as const satisfies SachaConf;

test(`génère un XML d'acquittement`, async () => {
  expect(
    await generateXMLAcquitement(
      [
        {
          DateAcquittement: toSachaDateTime(new Date(1765876056798)),
          NomFichier: 'RA01123123123123'
        }
      ],
      undefined,
      '72',
      1765876056798,
      sachaConf,
      laboratory
    )
  ).toMatchInlineSnapshot(
    `
    {
      "content": "<?xml version="1.0" encoding="UTF-8"?>
    <AcquittementNonAcquittement schemavalidation="AcquittementNonAcquittement.xsd">
      <MessageParametres>
        <CodeScenario>E.D.I. SIGAL/LABOS</CodeScenario>
        <VersionScenario>1.0.1</VersionScenario>
        <TypeFichier>AN01</TypeFichier>
        <NomFichier>AN01DDSV72LDA7225121610073679</NomFichier>
        <VersionReferenceStandardisees>v12341234</VersionReferenceStandardisees>
        <VersionReferencePrescripteur>v234</VersionReferencePrescripteur>
        <NomLogicielCreation>SIGAL</NomLogicielCreation>
        <VersionLogicielCreation>4.0</VersionLogicielCreation>
      </MessageParametres>
      <Emetteur>
        <Sigle>DDSV72</Sigle>
        <LibellePartenaire>DDPP Sarthe</LibellePartenaire>
        <EmailPartenaire>contact@maestro.beta.gouv.fr</EmailPartenaire>
      </Emetteur>
      <Destinataire>
        <Sigle>LDA72</Sigle>
        <LibellePartenaire>Innovalys 72</LibellePartenaire>
        <EmailPartenaire>fake@email.fr</EmailPartenaire>
      </Destinataire>
      <MessageAcquittement>
        <NomFichier>RA01123123123123</NomFichier>
        <DateAcquittement>2025-12-16T10:07:36</DateAcquittement>
      </MessageAcquittement>
    </AcquittementNonAcquittement>
    ",
      "fileName": "AN01DDSV72LDA7225121610073679",
      "fileType": "AN01",
      "laboratory": {
        "name": "Innovalys 72",
        "sachaEmail": "fake@email.fr",
        "sachaGpgPublicKey": "gpg",
        "sachaSigle": "LDA72",
        "shortName": "LDA 72",
      },
    }
  `
  );
});

test('getXmlFileName', () => {
  expect(
    getXmlFileName(
      'AN01',
      '35',
      { sachaSigle: 'LABERCA' },
      //16/12/2025 10:07:36
      1765876056798
    )
  ).toBe('AN01DDSV35LABERCA25121610073679');
});
test('getZipFileName', () => {
  expect(getZipFileName('AN01', { sachaSigle: 'LDA72' }, 1765876056798)).toBe(
    'AN01LDA722512161007_1.zip'
  );
});
