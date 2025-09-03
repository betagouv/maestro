import { expect, test } from 'vitest';
import { generateXMLAcquitement } from './sachaToXML';
import { toSachaDateTime } from './sachaValidator';

test(`génère un XML`, () => {
  expect(
    generateXMLAcquitement(
      [
        {
          DateAcquittement: toSachaDateTime(new Date(12341234)),
          NomFichier: 'RA01123123123123'
        }
      ],
      undefined,
      'LDA 72'
    )
  ).toMatchInlineSnapshot(
    `
    "<?xml encoding="UTF-8" version="1.0"?>
    <AcquittementNonAcquittement schemavalidation="AcquittementNonAcquittement.xsd">
      <MessageParametres>
        <CodeScenario></CodeScenario>
        <VersionScenario></VersionScenario>
        <TypeFichier>AN01</TypeFichier>
        <NomFichier></NomFichier>
        <NomLogicielCreation></NomLogicielCreation>
        <VersionLogicielCreation></VersionLogicielCreation>
      </MessageParametres>
      <Emetteur>
        <Nom>Maestro</Nom>
        <Sigle>Maestro</Sigle>
        <LibellePartenaire>Maestro</LibellePartenaire>
        <EmailPartenaire>Maestro</EmailPartenaire>
        <Telephone>Maestro</Telephone>
      </Emetteur>
      <Destinataire>
        <EmailPartenaire>LDA 72</EmailPartenaire>
        <LibellePartenaire>LDA 72</LibellePartenaire>
        <Nom>LDA 72</Nom>
        <Sigle>LDA 72</Sigle>
        <Telephone>LDA 72</Telephone>
      </Destinataire>
      <MessageAcquittement>
        <DateAcquittement>1970-01-01T04:25:41</DateAcquittement>
        <NomFichier>RA01123123123123</NomFichier>
      </MessageAcquittement>
    </AcquittementNonAcquittement>
    "
  `
  );
});
