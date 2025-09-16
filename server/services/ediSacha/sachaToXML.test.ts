import { toMaestroDate } from 'maestro-shared/utils/date';
import { expect, test } from 'vitest';
import { generateXMLAcquitement, generateXMLDAI } from './sachaToXML';
import { toSachaDateTime } from './sachaValidator';

test(`génère un XML d'acquittement`, () => {
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
        <CodeScenario>E.D.I. SIGAL/LABOS</CodeScenario>
        <VersionScenario>1.0.1</VersionScenario>
        <TypeFichier>AN01</TypeFichier>
        <NomFichier></NomFichier>
        <NomLogicielCreation>SIGAL</NomLogicielCreation>
        <VersionLogicielCreation>4.0</VersionLogicielCreation>
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

test(`génère un XML de DAI`, () => {
  expect(
    generateXMLDAI(
      {
        DialogueActeurType: {
          DialogueActeur: {
            SigleIdentifiant: '',
            Identifiant: '',
            Nom: ''
          }
        },
        DialogueDemandeIntervention: {
          NumeroDAP: 0,
          SigleContexteIntervention: '',
          DateIntervention: toMaestroDate(new Date(12341234)),
          DateModification: toSachaDateTime(new Date(55555555))
        },
        ReferenceEtablissementType: {
          ReferenceEtablissement: {
            SigleIdentifiant: '',
            Identifiant: '',
            Nom: ''
          }
        }
      },
      'LDA 72'
    )
  ).toMatchInlineSnapshot(`
    "<?xml encoding="UTF-8" version="1.0"?>
    <DemandesAnalyses schemavalidation="DemandesAnalyses.xsd">
      <MessageParametres>
        <CodeScenario>E.D.I. SIGAL/LABOS</CodeScenario>
        <VersionScenario>1.0.1</VersionScenario>
        <TypeFichier>DA01</TypeFichier>
        <NomFichier></NomFichier>
        <NomLogicielCreation>SIGAL</NomLogicielCreation>
        <VersionLogicielCreation>4.0</VersionLogicielCreation>
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
      <DemandeType>
        <DialogueActeurType>
          <DialogueActeur>
            <SigleIdentifiant></SigleIdentifiant>
            <Identifiant></Identifiant>
            <Nom></Nom>
          </DialogueActeur>
        </DialogueActeurType>
        <DialogueDemandeIntervention>
          <NumeroDAP>0</NumeroDAP>
          <SigleContexteIntervention></SigleContexteIntervention>
          <DateIntervention>1970-01-01</DateIntervention>
          <DateModification>1970-01-01T16:25:55</DateModification>
        </DialogueDemandeIntervention>
        <ReferenceEtablissementType>
          <ReferenceEtablissement>
            <SigleIdentifiant></SigleIdentifiant>
            <Identifiant></Identifiant>
            <Nom></Nom>
          </ReferenceEtablissement>
        </ReferenceEtablissementType>
      </DemandeType>
    </DemandesAnalyses>
    "
  `);
});
