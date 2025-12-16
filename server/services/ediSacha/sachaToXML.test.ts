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
      'LDA 72',

      1765876056798
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
        <NomFichier>AN01LDA722512161007_1</NomFichier>
        <NomLogicielCreation>SIGAL</NomLogicielCreation>
        <VersionLogicielCreation>4.0</VersionLogicielCreation>
      </MessageParametres>
      <Emetteur>
        <Sigle>Maestro</Sigle>
        <Nom>Maestro</Nom>
        <Telephone>Maestro</Telephone>
        <LibellePartenaire>Maestro</LibellePartenaire>
        <EmailPartenaire>Maestro</EmailPartenaire>
      </Emetteur>
      <Destinataire>
        <Sigle>LDA 72</Sigle>
        <Nom>LDA 72</Nom>
        <Telephone>LDA 72</Telephone>
        <LibellePartenaire>LDA 72</LibellePartenaire>
        <EmailPartenaire>LDA 72</EmailPartenaire>
      </Destinataire>
      <MessageAcquittement>
        <NomFichier>RA01123123123123</NomFichier>
        <DateAcquittement>1970-01-01T04:25:41</DateAcquittement>
      </MessageAcquittement>
    </AcquittementNonAcquittement>
    ",
      "fileName": "AN01LDA722512161007_1",
    }
  `
  );
});

test(`génère un XML de DAI`, () => {
  expect(
    generateXMLDAI(
      {
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
        },
        DialogueActeurType: {
          DialogueActeur: {
            SigleIdentifiant: '',
            Identifiant: '',
            Nom: ''
          }
        },
        ReferencePlanAnalyseType: {
          ReferencePlanAnalyseEffectuer: {
            SiglePlanAnalyse: ''
          },
          ReferencePlanAnalyseContenu: {
            LibelleMatrice: '',
            SigleAnalyte: '',
            SigleMethodeSpecifique: '',
            Depistage: false,
            Confirmation: false,
            Statut: 'G'
          }
        }
      },
      'LDA 72',
      1765876056798
    )
  ).toMatchInlineSnapshot(`
    {
      "content": "<?xml version="1.0" encoding="UTF-8"?>
    <DemandesAnalyses schemavalidation="DemandesAnalyses.xsd">
      <MessageParametres>
        <CodeScenario>E.D.I. SIGAL/LABOS</CodeScenario>
        <VersionScenario>1.0.1</VersionScenario>
        <TypeFichier>DA01</TypeFichier>
        <NomFichier>DA01LDA722512161007_1</NomFichier>
        <NomLogicielCreation>SIGAL</NomLogicielCreation>
        <VersionLogicielCreation>4.0</VersionLogicielCreation>
      </MessageParametres>
      <Emetteur>
        <Sigle>Maestro</Sigle>
        <Nom>Maestro</Nom>
        <Telephone>Maestro</Telephone>
        <LibellePartenaire>Maestro</LibellePartenaire>
        <EmailPartenaire>Maestro</EmailPartenaire>
      </Emetteur>
      <Destinataire>
        <Sigle>LDA 72</Sigle>
        <Nom>LDA 72</Nom>
        <Telephone>LDA 72</Telephone>
        <LibellePartenaire>LDA 72</LibellePartenaire>
        <EmailPartenaire>LDA 72</EmailPartenaire>
      </Destinataire>
      <DemandeType>
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
        <DialogueActeurType>
          <DialogueActeur>
            <SigleIdentifiant></SigleIdentifiant>
            <Identifiant></Identifiant>
            <Nom></Nom>
          </DialogueActeur>
        </DialogueActeurType>
        <ReferencePlanAnalyseType>
          <ReferencePlanAnalyseEffectuer>
            <SiglePlanAnalyse></SiglePlanAnalyse>
          </ReferencePlanAnalyseEffectuer>
          <ReferencePlanAnalyseContenu>
            <LibelleMatrice></LibelleMatrice>
            <SigleAnalyte></SigleAnalyte>
            <SigleMethodeSpecifique></SigleMethodeSpecifique>
            <Depistage>N</Depistage>
            <Confirmation>N</Confirmation>
            <Statut>G</Statut>
          </ReferencePlanAnalyseContenu>
        </ReferencePlanAnalyseType>
      </DemandeType>
    </DemandesAnalyses>
    ",
      "fileName": "DA01LDA722512161007_1",
    }
  `);
});
