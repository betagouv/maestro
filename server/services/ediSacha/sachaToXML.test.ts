import {
  CommemoratifSigle,
  CommemoratifValueSigle
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { SampleMatrixSpecificData } from 'maestro-shared/schema/Sample/SampleMatrixSpecificData';
import { SampleSpecificDataRecord } from 'maestro-shared/schema/Sample/SampleSpecificDataAttribute';
import { Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import { describe, expect, test } from 'vitest';
import {
  generateXMLAcquitement,
  generateXMLDAI,
  getCommemoratifs,
  getXmlFileName,
  getZipFileName,
  loadLaboratoryCall
} from './sachaToXML';
import { toSachaDateTime } from './sachaValidator';

const laboratory = {
  shortName: 'LDA 72',
  sachaSigle: 'LDA72',
  name: 'Innovalys 72',
  sachaEmail: 'fake@email.fr'
} as const;

const loadLaboratoryAndSender: ReturnType<
  typeof loadLaboratoryCall
> = async () => ({
  laboratory,
  sender: {
    sachaSigle: 'DAAF',
    name: 'DAAF Test',
    sachaEmail: 'daaf@gr.gouv.fr'
  }
});

const sampleSpecificDataRecord: SampleSpecificDataRecord = {
  sampling: {
    attribute: 'sampling',
    sachaCommemoratifSigle: null,
    inDai: false,
    values: {}
  },
  animalIdentifier: {
    attribute: 'animalIdentifier',
    sachaCommemoratifSigle: null,
    inDai: false,
    values: {}
  },
  ageInDays: {
    attribute: 'ageInDays',
    sachaCommemoratifSigle: null,
    inDai: false,
    values: {}
  },
  species: {
    attribute: 'species',
    sachaCommemoratifSigle: 'ESPECE' as CommemoratifSigle,
    inDai: false,
    values: { ESP7: 'POULE' as CommemoratifValueSigle }
  },
  breedingMethod: {
    attribute: 'breedingMethod',
    sachaCommemoratifSigle: null,
    inDai: false,
    values: {}
  },
  outdoorAccess: {
    attribute: 'outdoorAccess',
    sachaCommemoratifSigle: null,
    inDai: false,
    values: {}
  }
};

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
      loadLaboratoryAndSender,
      '72',
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
        <NomFichier>AN01DDSV72LDA7225121610073679</NomFichier>
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
        reference: 'PEL-26-00073',
        sampledAt: new Date(1765876056798),
        lastUpdatedAt: new Date(1765876056798),
        department: '72',
        matrix: 'A01SN#F26.A07XE',
        specificData: {
          programmingPlanKind: 'DAOA_BREEDING',
          sampling: 'Aléatoire',
          animalIdentifier: '',
          ageInDays: 12,
          species: 'ESP7',
          breedingMethod: 'PROD_1',
          outdoorAccess: 'PAT1'
        },
        company: {
          siret: 'siret',
          name: 'companyName'
        },
        sampler: Sampler1Fixture
      },
      {
        sealId: 'sealId',
        itemNumber: 1,
        copyNumber: 2
      },
      loadLaboratoryAndSender,
      1765876056798,
      {
        ...sampleSpecificDataRecord,

        species: {
          attribute: 'species',
          inDai: true,
          sachaCommemoratifSigle: 'SIGLE_SACHA' as CommemoratifSigle,
          values: {
            ESP7: 'SIGLE_VALUE_SACHA' as CommemoratifValueSigle
          }
        }
      }
    )
  ).toMatchInlineSnapshot(`
    {
      "content": "<?xml version="1.0" encoding="UTF-8"?>
    <DemandesAnalyses schemavalidation="DemandesAnalyses.xsd">
      <MessageParametres>
        <CodeScenario>E.D.I. SIGAL/LABOS</CodeScenario>
        <VersionScenario>1.0.1</VersionScenario>
        <TypeFichier>DA01</TypeFichier>
        <NomFichier>DA01DDSV72LDA7225121610073679</NomFichier>
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
      <DemandeType>
        <DialogueDemandeIntervention>
          <NumeroDAP>20250007321</NumeroDAP>
          <SigleContexteIntervention>2026_RPDA_PVOL</SigleContexteIntervention>
          <DateIntervention>2025-12-16</DateIntervention>
          <DateModification>2025-12-16T10:07:36</DateModification>
        </DialogueDemandeIntervention>
        <ReferenceEtablissementType>
          <ReferenceEtablissement>
            <SigleIdentifiant></SigleIdentifiant>
            <Identifiant>companyName</Identifiant>
            <Nom>companyName</Nom>
            <CodePostal> </CodePostal>
          </ReferenceEtablissement>
        </ReferenceEtablissementType>
        <DialogueActeurType>
          <DialogueActeur>
            <SigleIdentifiant></SigleIdentifiant>
            <Identifiant></Identifiant>
            <Nom>John Doe</Nom>
          </DialogueActeur>
        </DialogueActeurType>
        <DialogueEchantillonCommemoratifType>
          <DialogueEchantillonComplet>
            <NumeroEchantillon>1</NumeroEchantillon>
            <SigleMatriceSpecifique>FOIE_BV</SigleMatriceSpecifique>
            <NumeroEtiquette>PEL-26-00073-A-2</NumeroEtiquette>
            <Commentaire>sealId</Commentaire>
          </DialogueEchantillonComplet>
          <DialogueCommemoratif>
            <Sigle>SIGLE_SACHA</Sigle>
            <SigleValeur>SIGLE_VALUE_SACHA</SigleValeur>
          </DialogueCommemoratif>
        </DialogueEchantillonCommemoratifType>
        <ReferencePlanAnalyseType>
          <ReferencePlanAnalyseEffectuer>
            <SiglePlanAnalyse>RestPest_DAOA</SiglePlanAnalyse>
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
      "fileName": "DA01DDSV72LDA7225121610073679",
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

describe('getCommemoratifs', () => {
  const specificData: SampleMatrixSpecificData = {
    programmingPlanKind: 'DAOA_BREEDING',
    sampling: 'Aléatoire',
    animalIdentifier: 'ID123',
    ageInDays: 30,
    species: 'ESP7',
    breedingMethod: 'PROD_1',
    outdoorAccess: 'PAT1'
  };

  test("retourne un tableau vide quand aucun attribut n'est inlus dans la DAI", () => {
    expect(getCommemoratifs(specificData, sampleSpecificDataRecord)).toEqual(
      []
    );
  });

  test('retourne les commémoratifs pour les attributs inclus dans la DAI', () => {
    expect(
      getCommemoratifs(specificData, {
        ...sampleSpecificDataRecord,
        species: {
          attribute: 'species',
          sachaCommemoratifSigle: 'ESPECE' as CommemoratifSigle,
          inDai: true,
          values: {
            ESP7: 'POULE' as CommemoratifValueSigle,
            ESP8: 'CANARD' as CommemoratifValueSigle
          }
        }
      })
    ).toEqual([{ sigle: 'ESPECE', value: 'POULE' }]);
  });

  test('ignore les attributs qui ne sont pas dans specificData', () => {
    expect(
      getCommemoratifs(specificData, {
        ...sampleSpecificDataRecord,

        species: {
          attribute: 'species',
          sachaCommemoratifSigle: 'ESPECE' as CommemoratifSigle,
          inDai: true,
          values: {
            ESP7: 'POULE' as CommemoratifValueSigle,
            ESP8: 'CANARD' as CommemoratifValueSigle
          }
        },
        unknownAttribute: {
          attribute: 'unknownAttribute',
          sachaCommemoratifSigle: 'UNKNOWN' as CommemoratifSigle,
          inDai: true,
          values: { val1: 'VAL1' as CommemoratifValueSigle }
        }
      })
    ).toEqual([{ sigle: 'ESPECE', value: 'POULE' }]);
  });

  test('retourne plusieurs commémoratifs quand plusieurs attributs inclus dans la DAI', () => {
    const result = getCommemoratifs(specificData, {
      ...sampleSpecificDataRecord,
      species: {
        attribute: 'species',
        sachaCommemoratifSigle: 'ESPECE' as CommemoratifSigle,
        inDai: true,
        values: {
          ESP7: 'POULE' as CommemoratifValueSigle,
          ESP8: 'CANARD' as CommemoratifValueSigle
        }
      },
      breedingMethod: {
        attribute: 'breedingMethod',
        sachaCommemoratifSigle: 'MODE_ELEVAGE' as CommemoratifSigle,
        inDai: true,
        values: {
          PROD_1: 'INTENSIF' as CommemoratifValueSigle,
          PROD_2: 'EXTENSIF' as CommemoratifValueSigle
        }
      }
    });
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ sigle: 'ESPECE', value: 'POULE' });
    expect(result).toContainEqual({ sigle: 'MODE_ELEVAGE', value: 'INTENSIF' });
  });

  test('émet une erreur quand le sachaCommemoratifSigle est manquant', () => {
    const { species: _, ...sampleSpecifiDataRecordWithoutSpecies } =
      sampleSpecificDataRecord;

    expect(() =>
      getCommemoratifs(specificData, sampleSpecifiDataRecordWithoutSpecies)
    ).toThrow('Configuration SACHA incomplète: species');
  });

  test("émet une erreur quand la valeur n'est pas mappée", () => {
    expect(() =>
      getCommemoratifs(specificData, {
        ...sampleSpecificDataRecord,

        species: {
          attribute: 'species',
          sachaCommemoratifSigle: 'ESPECE' as CommemoratifSigle,
          inDai: true,
          values: { ESP8: 'CANARD' as CommemoratifValueSigle } // ESP7 n'est pas mappé
        }
      })
    ).toThrow('Configuration SACHA incomplète: species ESP7');
  });
});
