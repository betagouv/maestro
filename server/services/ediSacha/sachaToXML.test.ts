import type { LaboratoryWithSacha } from 'maestro-shared/schema/Laboratory/Laboratory';
import { expect, test } from 'vitest';
import type { SachaConf } from '../../repositories/kysely.type';
import {
  generateXMLAcquitement,
  getXmlFileName,
  getZipFileName
} from './sachaToXML';
import { toSachaDateTime } from './sachaValidator';

const laboratory: LaboratoryWithSacha = {
  id: '11111111-1111-1111-1111-111111111111',
  shortName: 'LDA 72',
  name: 'Innovalys 72',
  address: '72 rue du test',
  postalCode: '72000',
  city: 'Le Mans',
  emails: [],
  emailsAnalysisResult: [],
  legacyDai: false,
  sacha: {
    activated: true,
    sigle: 'LDA72',
    communication: {
      method: 'EMAIL',
      recipientEmail: 'fake@email.fr',
      gpgEmail: 'fake-gpg@email.fr',
      gpgPublicKey: 'gpg'
    }
  }
};

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
        <NomFichier>AN01DDSV72LDA72251216100736798</NomFichier>
        <VersionReferenceStandardisees>v12341234</VersionReferenceStandardisees>
        <VersionReferencePrescripteur>v234</VersionReferencePrescripteur>
        <NomLogicielCreation>SIGAL</NomLogicielCreation>
        <VersionLogicielCreation>4.0</VersionLogicielCreation>
        <CodeReferentielPrescripteur>SIGAL</CodeReferentielPrescripteur>
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
      "fileName": "AN01DDSV72LDA72251216100736798",
      "fileType": "AN01",
    }
  `
  );
});

test('getXmlFileName', () => {
  expect(
    getXmlFileName(
      'AN01',
      '35',
      'LABERCA',
      //16/12/2025 10:07:36
      1765876056798
    )
  ).toBe('AN01DDSV35LABERCA251216100736798');
});
test('getZipFileName', () => {
  expect(getZipFileName('AN01', 'LDA72', 1765876056798)).toBe(
    'AN01LDA722512161007_1.zip'
  );
});
