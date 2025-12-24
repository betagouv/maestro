import { toMaestroDate } from 'maestro-shared/utils/date';
import { expect, test } from 'vitest';
import {
  generateXMLAcquitement,
  generateXMLDAI,
  getXmlFileName,
  getZipFileName,
  loadLaboratoryAndSenderCall
} from './sachaToXML';
import { toSachaDateTime } from './sachaValidator';

const laboratory = {
  shortName: 'LDA 72',
  sachaSigle: 'LDA72',
  name: 'Innovalys 72',
  sachaEmail: 'fake@email.fr'
} as const;

const loadLaboratoryAndSender: ReturnType<
  typeof loadLaboratoryAndSenderCall
> = async () => ({
  laboratory,
  sender: {
    sachaSigle: 'DAAF',
    name: 'DAAF Test',
    sachaEmail: 'daaf@gr.gouv.fr'
  }
});

test(`génère un XML d'acquittement`, async () => {
  expect(
    await generateXMLAcquitement(
      [
        {
          DateAcquittement: toSachaDateTime(new Date(12341234)),
          NomFichier: 'RA01123123123123'
        }
      ],
      undefined,
      loadLaboratoryAndSender,

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
        <NomFichier>AN01DAAFLDA7225121610073679</NomFichier>
        <NomLogicielCreation>SIGAL</NomLogicielCreation>
        <VersionLogicielCreation>4.0</VersionLogicielCreation>
      </MessageParametres>
      <Emetteur>
        <Sigle>DAAF</Sigle>
        <LibellePartenaire>DAAF Test</LibellePartenaire>
        <EmailPartenaire>daaf@gr.gouv.fr</EmailPartenaire>
      </Emetteur>
      <Destinataire>
        <Sigle>LDA72</Sigle>
        <LibellePartenaire>Innovalys 72</LibellePartenaire>
        <EmailPartenaire>fake@email.fr</EmailPartenaire>
      </Destinataire>
      <MessageAcquittement>
        <NomFichier>RA01123123123123</NomFichier>
        <DateAcquittement>1970-01-01T04:25:41</DateAcquittement>
      </MessageAcquittement>
    </AcquittementNonAcquittement>
    ",
      "fileName": "AN01DAAFLDA7225121610073679",
      "fileType": "AN01",
      "laboratory": {
        "name": "Innovalys 72",
        "sachaEmail": "fake@email.fr",
        "sachaSigle": "LDA72",
        "shortName": "LDA 72",
      },
    }
  `
  );
});

test(`génère un XML de DAI`, async () => {
  expect(
    await generateXMLDAI(
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
      loadLaboratoryAndSender,
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
        <NomFichier>DA01DAAFLDA7225121610073679</NomFichier>
        <NomLogicielCreation>SIGAL</NomLogicielCreation>
        <VersionLogicielCreation>4.0</VersionLogicielCreation>
      </MessageParametres>
      <Emetteur>
        <Sigle>DAAF</Sigle>
        <LibellePartenaire>DAAF Test</LibellePartenaire>
        <EmailPartenaire>daaf@gr.gouv.fr</EmailPartenaire>
      </Emetteur>
      <Destinataire>
        <Sigle>LDA72</Sigle>
        <LibellePartenaire>Innovalys 72</LibellePartenaire>
        <EmailPartenaire>fake@email.fr</EmailPartenaire>
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
      "fileName": "DA01DAAFLDA7225121610073679",
      "fileType": "DA01",
      "laboratory": {
        "name": "Innovalys 72",
        "sachaEmail": "fake@email.fr",
        "sachaSigle": "LDA72",
        "shortName": "LDA 72",
      },
    }
  `);
});

test('getXmlFileName', () => {
  expect(
    getXmlFileName(
      'AN01',
      { sachaSigle: 'LABERCA' },
      { sachaSigle: 'DDSV35' },
      //16/12/2025 10:07:36
      1765876056798
    )
  ).toBe('AN01LABERCADDSV3525121610073679');
});
test('getZipFileName', () => {
  expect(getZipFileName('AN01', { sachaSigle: 'LDA72' }, 1765876056798)).toBe(
    'AN01LDA722512161007_1'
  );
});
