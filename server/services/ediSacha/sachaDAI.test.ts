import {
  CommemoratifSigle,
  CommemoratifValueSigle,
  SachaCommemoratifRecord
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { SachaFieldConfig } from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import { SpecificData } from 'maestro-shared/schema/SpecificData/SpecificData';
import { Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import { describe, expect, test } from 'vitest';
import { SachaConf } from '../../repositories/kysely.type';
import { generateXMLDAI, getCommemoratifs } from './sachaDAI';
import { LaboratorySachaData } from './sachaToXML';

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

const sachaCommemoratifSigleEspece = 'ESPECE' as CommemoratifSigle;

const sachaFieldConfigs: SachaFieldConfig[] = [
  {
    key: 'sampling',
    inputType: 'text',
    label: 'sampling',
    hintText: null,
    sachaCommemoratifSigle: null,
    inDai: false,
    optional: false,
    options: []
  },
  {
    key: 'animalBatchIdentifier',
    inputType: 'text',
    label: 'animalBatchIdentifier',
    hintText: null,
    sachaCommemoratifSigle: null,
    inDai: false,
    optional: false,
    options: []
  },
  {
    key: 'ageInDays',
    inputType: 'text',
    label: 'ageInDays',
    hintText: null,
    sachaCommemoratifSigle: null,
    inDai: false,
    optional: false,
    options: []
  },
  {
    key: 'species',
    inputType: 'select',
    label: 'species',
    hintText: null,
    sachaCommemoratifSigle: sachaCommemoratifSigleEspece,
    inDai: false,
    optional: false,
    options: [
      {
        value: 'ESP7',
        label: 'ESP7',
        order: 0,
        sachaCommemoratifValueSigle: 'POULE' as CommemoratifValueSigle
      }
    ]
  },
  {
    key: 'breedingMethod',
    inputType: 'text',
    label: 'breedingMethod',
    hintText: null,
    sachaCommemoratifSigle: null,
    inDai: false,
    optional: false,
    options: []
  },
  {
    key: 'outdoorAccess',
    inputType: 'text',
    label: 'outdoorAccess',
    hintText: null,
    sachaCommemoratifSigle: null,
    inDai: false,
    optional: false,
    options: []
  }
];

const sachaCommemoratifRecord: SachaCommemoratifRecord = {
  [sachaCommemoratifSigleEspece]: {
    sigle: sachaCommemoratifSigleEspece,
    libelle: 'espèce animal',
    typeDonnee: 'list',
    unite: null,
    values: {}
  }
};

test(`génère un XML de DAI`, async () => {
  expect(
    await generateXMLDAI(
      {
        reference: 'PEL-26-00073',
        sampledAt: new Date(1765876056798),
        lastUpdatedAt: new Date(1765876056798),
        department: '72',
        matrix: 'A01SN#F26.A07XE',
        programmingPlanKind: 'DAOA_VOLAILLE',
        specificData: {
          sampling: 'Aléatoire',
          animalBatchIdentifier: '',
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
        copyNumber: 2,
        substanceKind: 'Copper'
      },
      1765876056798,
      [
        ...sachaFieldConfigs.filter(
          (fc) => fc.key !== 'species' && fc.key !== 'ageInDays'
        ),
        {
          key: 'species',
          inputType: 'select' as const,
          label: 'species',
          hintText: null,
          inDai: true,
          optional: false,
          sachaCommemoratifSigle: 'SIGLE_SACHA' as CommemoratifSigle,
          options: [
            {
              value: 'ESP7',
              label: 'ESP7',
              order: 0,
              sachaCommemoratifValueSigle:
                'SIGLE_VALUE_SACHA' as CommemoratifValueSigle
            }
          ]
        },
        {
          key: 'ageInDays',
          inputType: 'text' as const,
          label: 'ageInDays',
          hintText: null,
          inDai: true,
          optional: false,
          sachaCommemoratifSigle: 'AGED' as CommemoratifSigle,
          options: []
        }
      ],
      {
        ...sachaCommemoratifRecord,
        ['SIGLE_SACHA' as CommemoratifSigle]: {
          sigle: 'SIGLE_SACHA' as CommemoratifSigle,
          libelle: 'nouveau sigle',
          typeDonnee: 'list',
          unite: null,
          values: {}
        },
        ['AGED' as CommemoratifSigle]: {
          sigle: 'AGED' as CommemoratifSigle,
          libelle: 'age en jours',
          typeDonnee: 'numeric',
          unite: 'jours',
          values: {}
        }
      },
      sachaConf,
      laboratory
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
      <DemandeType>
        <DialogueDemandeIntervention>
          <NumeroDAP>202600007312</NumeroDAP>
          <SigleContexteIntervention>PR17_2026_RPDA_PVOL</SigleContexteIntervention>
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
            <SigleMatriceSpecifique>MSCL_VOL</SigleMatriceSpecifique>
            <NumeroEtiquette>PEL-26-00073-A-2</NumeroEtiquette>
            <Commentaire>sealId</Commentaire>
          </DialogueEchantillonComplet>
          <DialogueCommemoratif>
            <Sigle>AGED</Sigle>
            <TexteValeur>12</TexteValeur>
          </DialogueCommemoratif>
          <DialogueCommemoratif>
            <Sigle>SIGLE_SACHA</Sigle>
            <SigleValeur>SIGLE_VALUE_SACHA</SigleValeur>
          </DialogueCommemoratif>
        </DialogueEchantillonCommemoratifType>
        <ReferencePlanAnalyseType>
          <ReferencePlanAnalyseEffectuer>
            <SiglePlanAnalyse>RPDA_CU</SiglePlanAnalyse>
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
        "sachaGpgPublicKey": "gpg",
        "sachaSigle": "LDA72",
        "shortName": "LDA 72",
      },
    }
  `);
});
describe('getCommemoratifs', () => {
  const specificData: SpecificData = {
    sampling: 'Aléatoire',
    animalBatchIdentifier: 'ID123',
    ageInDays: 30,
    species: 'ESP7',
    breedingMethod: 'PROD_1',
    outdoorAccess: 'PAT1'
  };

  test("retourne un tableau vide quand aucun attribut n'est inlus dans la DAI", () => {
    expect(
      getCommemoratifs(specificData, sachaFieldConfigs, sachaCommemoratifRecord)
    ).toEqual([]);
  });

  test('retourne les commémoratifs pour les attributs inclus dans la DAI', () => {
    expect(
      getCommemoratifs(
        specificData,
        [
          ...sachaFieldConfigs.filter((fc) => fc.key !== 'species'),
          {
            key: 'species',
            inputType: 'select' as const,
            label: 'species',
            hintText: null,
            sachaCommemoratifSigle: 'ESPECE' as CommemoratifSigle,
            inDai: true,
            optional: false,
            options: [
              {
                value: 'ESP7',
                label: 'ESP7',
                order: 0,
                sachaCommemoratifValueSigle: 'POULE' as CommemoratifValueSigle
              },
              {
                value: 'ESP8',
                label: 'ESP8',
                order: 1,
                sachaCommemoratifValueSigle: 'CANARD' as CommemoratifValueSigle
              }
            ]
          }
        ],
        sachaCommemoratifRecord
      )
    ).toEqual([{ sigle: 'ESPECE', sigleValue: 'POULE' }]);
  });

  test('ignore les attributs qui ne sont pas dans specificData', () => {
    expect(
      getCommemoratifs(
        specificData,
        [
          ...sachaFieldConfigs.filter((fc) => fc.key !== 'species'),
          {
            key: 'species',
            inputType: 'select' as const,
            label: 'species',
            hintText: null,
            sachaCommemoratifSigle: 'ESPECE' as CommemoratifSigle,
            inDai: true,
            optional: false,
            options: [
              {
                value: 'ESP7',
                label: 'ESP7',
                order: 0,
                sachaCommemoratifValueSigle: 'POULE' as CommemoratifValueSigle
              },
              {
                value: 'ESP8',
                label: 'ESP8',
                order: 1,
                sachaCommemoratifValueSigle: 'CANARD' as CommemoratifValueSigle
              }
            ]
          },
          {
            key: 'unknownAttribute',
            inputType: 'select' as const,
            label: 'unknownAttribute',
            hintText: null,
            sachaCommemoratifSigle: 'UNKNOWN' as CommemoratifSigle,
            inDai: true,
            optional: false,
            options: [
              {
                value: 'val1',
                label: 'val1',
                order: 0,
                sachaCommemoratifValueSigle: 'VAL1' as CommemoratifValueSigle
              }
            ]
          }
        ],
        sachaCommemoratifRecord
      )
    ).toEqual([{ sigle: 'ESPECE', sigleValue: 'POULE' }]);
  });

  test('retourne plusieurs commémoratifs quand plusieurs attributs inclus dans la DAI', () => {
    const result = getCommemoratifs(
      specificData,
      [
        ...sachaFieldConfigs.filter(
          (fc) => fc.key !== 'species' && fc.key !== 'breedingMethod'
        ),
        {
          key: 'species',
          inputType: 'select' as const,
          label: 'species',
          hintText: null,
          sachaCommemoratifSigle: 'ESPECE' as CommemoratifSigle,
          inDai: true,
          optional: false,
          options: [
            {
              value: 'ESP7',
              label: 'ESP7',
              order: 0,
              sachaCommemoratifValueSigle: 'POULE' as CommemoratifValueSigle
            },
            {
              value: 'ESP8',
              label: 'ESP8',
              order: 1,
              sachaCommemoratifValueSigle: 'CANARD' as CommemoratifValueSigle
            }
          ]
        },
        {
          key: 'breedingMethod',
          inputType: 'select' as const,
          label: 'breedingMethod',
          hintText: null,
          sachaCommemoratifSigle: 'MODE_ELEVAGE' as CommemoratifSigle,
          inDai: true,
          optional: false,
          options: [
            {
              value: 'PROD_1',
              label: 'PROD_1',
              order: 0,
              sachaCommemoratifValueSigle: 'INTENSIF' as CommemoratifValueSigle
            },
            {
              value: 'PROD_2',
              label: 'PROD_2',
              order: 1,
              sachaCommemoratifValueSigle: 'EXTENSIF' as CommemoratifValueSigle
            }
          ]
        }
      ],
      {
        ...sachaCommemoratifRecord,
        ['MODE_ELEVAGE' as CommemoratifSigle]: {
          sigle: 'MODE_ELEVAGE' as CommemoratifSigle,
          libelle: 'nouveau sigle',
          typeDonnee: 'list',
          unite: null,
          values: {}
        }
      }
    );
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ sigle: 'ESPECE', sigleValue: 'POULE' });
    expect(result).toContainEqual({
      sigle: 'MODE_ELEVAGE',
      sigleValue: 'INTENSIF'
    });
  });

  test('émet une erreur quand le sachaCommemoratifSigle est manquant', () => {
    expect(() =>
      getCommemoratifs(
        specificData,
        sachaFieldConfigs.filter((fc) => fc.key !== 'species'),
        sachaCommemoratifRecord
      )
    ).toThrow('Configuration SACHA incomplète: species');
  });

  test("émet une erreur quand la valeur n'est pas mappée", () => {
    expect(() =>
      getCommemoratifs(
        specificData,
        [
          ...sachaFieldConfigs.filter((fc) => fc.key !== 'species'),
          {
            key: 'species',
            inputType: 'select' as const,
            label: 'species',
            hintText: null,
            sachaCommemoratifSigle: 'ESPECE' as CommemoratifSigle,
            inDai: true,
            optional: false,
            options: [
              {
                value: 'ESP8',
                label: 'ESP8',
                order: 0,
                sachaCommemoratifValueSigle: 'CANARD' as CommemoratifValueSigle
              } // ESP7 n'est pas mappé
            ]
          }
        ],
        sachaCommemoratifRecord
      )
    ).toThrow('Configuration SACHA incomplète: species ESP7');
  });

  test("n'émet pas d'erreur quand la valeur n'est pas mappée et que le commemoratif est optionnel", () => {
    expect(
      getCommemoratifs(
        specificData,
        [
          ...sachaFieldConfigs.filter((fc) => fc.key !== 'species'),
          {
            key: 'species',
            inputType: 'select' as const,
            label: 'species',
            hintText: null,
            sachaCommemoratifSigle: 'ESPECE' as CommemoratifSigle,
            inDai: true,
            optional: true,
            options: [
              {
                value: 'ESP8',
                label: 'ESP8',
                order: 0,
                sachaCommemoratifValueSigle: 'CANARD' as CommemoratifValueSigle
              } // ESP7 n'est pas mappé
            ]
          }
        ],
        sachaCommemoratifRecord
      )
    ).toMatchInlineSnapshot(`[]`);
  });

  test('gère les commémoratifs de type texte', () => {
    const specificDataWithText: SpecificData = {
      ...specificData,
      animalBatchIdentifier: 'super identifiant'
    };

    const result = getCommemoratifs(
      specificDataWithText,
      [
        ...sachaFieldConfigs.filter((fc) => fc.key !== 'animalBatchIdentifier'),
        {
          key: 'animalBatchIdentifier',
          inputType: 'text' as const,
          label: 'animalBatchIdentifier',
          hintText: null,
          sachaCommemoratifSigle: 'IDA' as CommemoratifSigle,
          inDai: true,
          optional: false,
          options: []
        }
      ],
      {
        ...sachaCommemoratifRecord,
        ['IDA' as CommemoratifSigle]: {
          sigle: 'IDA' as CommemoratifSigle,
          libelle: 'Identifiant animal',
          typeDonnee: 'text',
          unite: null,
          values: {}
        }
      }
    );

    expect(result).toEqual([{ sigle: 'IDA', textValue: 'super identifiant' }]);
  });

  test('gère les commémoratifs de type numérique', () => {
    const specificDataWithNumber: SpecificData = {
      ...specificData,
      ageInDays: 140
    };

    const result = getCommemoratifs(
      specificDataWithNumber,
      [
        ...sachaFieldConfigs.filter((fc) => fc.key !== 'ageInDays'),
        {
          key: 'ageInDays',
          inputType: 'number' as const,
          label: 'ageInDays',
          hintText: null,
          sachaCommemoratifSigle: 'AGED' as CommemoratifSigle,
          inDai: true,
          optional: false,
          options: []
        }
      ],
      {
        ...sachaCommemoratifRecord,
        ['AGED' as CommemoratifSigle]: {
          sigle: 'AGED' as CommemoratifSigle,
          libelle: 'age en jours',
          typeDonnee: 'number',
          unite: 'jours',
          values: {}
        }
      }
    );

    expect(result).toEqual([{ sigle: 'AGED', textValue: '140' }]);
  });

  test("émet une erreur quand le sachaCommemoratifSigle n'existe pas dans sachaCommemoratifRecord", () => {
    expect(() =>
      getCommemoratifs(
        specificData,
        [
          ...sachaFieldConfigs.filter((fc) => fc.key !== 'species'),
          {
            key: 'species',
            inputType: 'select' as const,
            label: 'species',
            hintText: null,
            sachaCommemoratifSigle: 'SIGLE_INEXISTANT' as CommemoratifSigle,
            inDai: true,
            optional: false,
            options: [
              {
                value: 'ESP7',
                label: 'ESP7',
                order: 0,
                sachaCommemoratifValueSigle: 'POULE' as CommemoratifValueSigle
              }
            ]
          }
        ],
        sachaCommemoratifRecord
      )
    ).toThrow();
  });
});
