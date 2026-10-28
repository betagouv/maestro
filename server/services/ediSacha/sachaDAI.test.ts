import type { LaboratoryWithSacha } from 'maestro-shared/schema/Laboratory/Laboratory';
import type { MatrixKind } from 'maestro-shared/schema/Matrix/MatrixReferential';
import type {
  ProgrammingSubPlan,
  SachaContextSigle
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type {
  CommemoratifSigle,
  CommemoratifValueSigle,
  SachaCommemoratifRecord
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import type {
  SachaCommemoratifLevel,
  SachaContext
} from 'maestro-shared/schema/SachaContext/SachaContext';
import type { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import type { SampleMatrix } from 'maestro-shared/schema/Sample/SampleMatrix';
import type { SachaFieldConfig } from 'maestro-shared/schema/SpecificData/ProgrammingSubPlanFieldConfig';
import type { SpecificData } from 'maestro-shared/schema/SpecificData/SpecificData';
import { MatrixReferentialFixture } from 'maestro-shared/test/matrixFixtures';
import { Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import type { MaestroDate } from 'maestro-shared/utils/date';
import { describe, expect, test } from 'vitest';
import type { SachaConf } from '../../repositories/kysely.type';
import { generateXMLDAI, getCommemoratifs } from './sachaDAI';

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

const sachaCommemoratifSigleEspece = 'ESPECE' as CommemoratifSigle;

const sachaFieldConfigs: SachaFieldConfig[] = [
  {
    key: 'sampling',
    inputType: 'text',
    label: 'sampling',
    hintText: null,
    sachaCommemoratifSigle: null,
    optional: false,
    options: []
  },
  {
    key: 'animalBatchIdentifier',
    inputType: 'text',
    label: 'animalBatchIdentifier',
    hintText: null,
    sachaCommemoratifSigle: null,
    optional: false,
    options: []
  },
  {
    key: 'ageInDays',
    inputType: 'text',
    label: 'ageInDays',
    hintText: null,
    sachaCommemoratifSigle: null,
    optional: false,
    options: []
  },
  {
    key: 'species',
    inputType: 'select',
    label: 'species',
    hintText: null,
    sachaCommemoratifSigle: sachaCommemoratifSigleEspece,
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
    optional: false,
    options: []
  },
  {
    key: 'outdoorAccess',
    inputType: 'text',
    label: 'outdoorAccess',
    hintText: null,
    sachaCommemoratifSigle: null,
    optional: false,
    options: []
  }
];

const commemoratifValues = (...sigles: string[]) =>
  Object.fromEntries(
    sigles.map((sigle) => [
      sigle,
      { sigle: sigle as CommemoratifValueSigle, libelle: sigle }
    ])
  );

const sachaCommemoratifRecord: SachaCommemoratifRecord = {
  [sachaCommemoratifSigleEspece]: {
    sigle: sachaCommemoratifSigleEspece,
    libelle: 'espèce animal',
    typeDonnee: 'list',
    unite: null,
    values: commemoratifValues('POULE', 'CANARD')
  }
};

const sachaContext = (
  commemoratifs: [string, SachaCommemoratifLevel][]
): SachaContext => ({
  sigle: 'PR17_2026_RPDA_PVOL' as SachaContextSigle,
  libelle: 'Plan de surveillance résidus de pesticides volaille',
  commemoratifs: commemoratifs.map(([sigle, level]) => ({
    sigle: sigle as CommemoratifSigle,
    level
  }))
});

const commemoratifsContext = sachaContext([
  ['ESPECE', 'Sample'],
  ['MODE_ELEVAGE', 'SampleMatrix'],
  ['IDA', 'Sample'],
  ['AGED', 'Sample']
]);

const daiSample = {
  reference: 'ARA-25-00073',
  sampledDate: '2025-12-16' as MaestroDate,
  lastUpdatedAt: new Date(1765876056798),
  sentAt: new Date(1765876056798),
  department: '72',
  matrices: [
    { matrixKind: 'A01SN' as MatrixKind, matrix: 'A01SN#F26.A07XE' }
  ] as SampleMatrix[],
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
    name: "nom d'entreprise très long qui doit être coupé"
  },
  sampler: Sampler1Fixture
} as const;

const daiSubPlan: Pick<
  ProgrammingSubPlan,
  'subPlanNumber' | 'sachaContextSigle'
> = {
  subPlanNumber: 'M01',
  sachaContextSigle: 'PR17_2026_RPDA_PVOL' as SachaContextSigle
};

const daiSampleItem: Pick<
  SampleItem,
  'sealId' | 'itemNumber' | 'copyNumber' | 'substanceKinds'
> = {
  sealId: 'sealId',
  itemNumber: 1,
  copyNumber: 2,
  substanceKinds: ['Copper']
};

const daiFieldConfigs: SachaFieldConfig[] = [
  ...sachaFieldConfigs.filter(
    (fc) => fc.key !== 'species' && fc.key !== 'ageInDays'
  ),
  {
    key: 'species',
    inputType: 'select' as const,
    label: 'species',
    hintText: null,
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
    optional: false,
    sachaCommemoratifSigle: 'AGED' as CommemoratifSigle,
    options: []
  }
];

const daiCommemoratifRecord: SachaCommemoratifRecord = {
  ...sachaCommemoratifRecord,
  ['SIGLE_SACHA' as CommemoratifSigle]: {
    sigle: 'SIGLE_SACHA' as CommemoratifSigle,
    libelle: 'nouveau sigle',
    typeDonnee: 'list',
    unite: null,
    values: commemoratifValues('SIGLE_VALUE_SACHA')
  },
  ['AGED' as CommemoratifSigle]: {
    sigle: 'AGED' as CommemoratifSigle,
    libelle: 'age en jours',
    typeDonnee: 'numeric',
    unite: 'jours',
    values: {}
  }
};

const daiContext = sachaContext([
  ['SIGLE_SACHA', 'Sample'],
  ['AGED', 'SampleMatrix']
]);

test(`génère un XML de DAI`, async () => {
  expect(
    await generateXMLDAI(
      MatrixReferentialFixture,
      daiSample,
      daiSubPlan,
      daiSampleItem,
      1765876056798,
      daiFieldConfigs,
      daiCommemoratifRecord,
      daiContext,
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
        <NomFichier>DA01MDDSV72LDA72251216100736798</NomFichier>
        <VersionReferenceStandardisees>v12341234</VersionReferenceStandardisees>
        <VersionReferencePrescripteur>v234</VersionReferencePrescripteur>
        <NomLogicielCreation>SIGAL</NomLogicielCreation>
        <VersionLogicielCreation>4.0</VersionLogicielCreation>
        <CodeReferentielPrescripteur>SIGAL</CodeReferentielPrescripteur>
      </MessageParametres>
      <Emetteur>
        <Sigle>MDDSV72</Sigle>
        <LibellePartenaire>DDPP Sarthe</LibellePartenaire>
        <EmailPartenaire>contact-ddsv@maestro.beta.gouv.fr</EmailPartenaire>
      </Emetteur>
      <Destinataire>
        <Sigle>LDA72</Sigle>
        <LibellePartenaire>Innovalys 72</LibellePartenaire>
        <EmailPartenaire>fake@email.fr</EmailPartenaire>
      </Destinataire>
      <DemandeType>
        <DialogueDemandeIntervention>
          <NumeroDAP>960025000073</NumeroDAP>
          <SigleContexteIntervention>PR17_2026_RPDA_PVOL</SigleContexteIntervention>
          <DateIntervention>2025-12-16</DateIntervention>
          <DateModification>2025-12-16T10:07:36</DateModification>
        </DialogueDemandeIntervention>
        <DialogueCommemoratif>
          <Sigle>SIGLE_SACHA</Sigle>
          <SigleValeur>SIGLE_VALUE_SACHA</SigleValeur>
        </DialogueCommemoratif>
        <ReferenceEtablissementType>
          <ReferenceEtablissement>
            <SigleIdentifiant>SIRET</SigleIdentifiant>
            <Identifiant>siret</Identifiant>
            <Nom>nom d&apos;entreprise très long qui doit être coupé</Nom>
            <CodePostal> </CodePostal>
          </ReferenceEtablissement>
        </ReferenceEtablissementType>
        <DialogueActeurType>
          <DialogueActeur>
            <SigleIdentifiant>DEPADM</SigleIdentifiant>
            <Identifiant>DDSV72</Identifiant>
            <Nom>John Doe</Nom>
          </DialogueActeur>
        </DialogueActeurType>
        <DialogueEchantillonCommemoratifType>
          <DialogueEchantillonComplet>
            <NumeroEchantillon>1</NumeroEchantillon>
            <SigleMatriceSpecifique>MSCL_VOL</SigleMatriceSpecifique>
            <NumeroEtiquette>029600250000732025350001</NumeroEtiquette>
            <Commentaire>sealId</Commentaire>
          </DialogueEchantillonComplet>
          <DialogueCommemoratif>
            <Sigle>AGED</Sigle>
            <TexteValeur>12</TexteValeur>
          </DialogueCommemoratif>
        </DialogueEchantillonCommemoratifType>
        <ReferencePlanAnalyseType>
          <ReferencePlanAnalyseEffectuer>
            <SiglePlanAnalyse>RPDA_CU</SiglePlanAnalyse>
          </ReferencePlanAnalyseEffectuer>
          <ReferencePlanAnalyseContenu>
            <LibelleMatrice>Matrice prescrite</LibelleMatrice>
            <SigleAnalyte>ANAPRS</SigleAnalyte>
            <SigleMethodeSpecifique>METPRS</SigleMethodeSpecifique>
            <Depistage>O</Depistage>
            <Confirmation>N</Confirmation>
            <Statut>V</Statut>
          </ReferencePlanAnalyseContenu>
        </ReferencePlanAnalyseType>
      </DemandeType>
    </DemandesAnalyses>
    ",
      "fileName": "DA01MDDSV72LDA72251216100736798",
      "fileType": "DA01",
    }
  `);
});

test(`fige le NumeroEtiquette sur sentAt (date d'envoi), tout en datant le fichier sur dateNow`, async () => {
  const dateNow = new Date('2026-01-05T09:00:00').getTime();

  const xmlFile = await generateXMLDAI(
    MatrixReferentialFixture,
    { ...daiSample, sentAt: new Date('2025-12-16T09:00:00') },
    daiSubPlan,
    daiSampleItem,
    dateNow,
    daiFieldConfigs,
    daiCommemoratifRecord,
    daiContext,
    sachaConf,
    laboratory
  );

  expect(xmlFile.content).toContain(
    '<NumeroEtiquette>029600250000732025350001</NumeroEtiquette>'
  );
  expect(xmlFile.fileName).toContain('260105');
  expect(xmlFile.fileName).not.toContain('251216');
});

test('génère un plan d’analyse par sigle distinct des analytes de l’exemplaire', async () => {
  const xmlFile = await generateXMLDAI(
    MatrixReferentialFixture,
    daiSample,
    daiSubPlan,
    { ...daiSampleItem, substanceKinds: ['Mono', 'Copper', 'Multi'] },
    1765876056798,
    daiFieldConfigs,
    daiCommemoratifRecord,
    daiContext,
    sachaConf,
    laboratory
  );

  expect(
    [
      ...xmlFile.content.matchAll(/<SiglePlanAnalyse>(.*)<\/SiglePlanAnalyse>/g)
    ].map(([, sigle]) => sigle)
  ).toEqual(['RPDA', 'RPDA_CU']);
});

test('refuse un sous-plan sans contexte d’intervention SIGAL', () => {
  expect(() =>
    generateXMLDAI(
      MatrixReferentialFixture,
      daiSample,
      { ...daiSubPlan, sachaContextSigle: null },
      daiSampleItem,
      1765876056798,
      daiFieldConfigs,
      daiCommemoratifRecord,
      daiContext,
      sachaConf,
      laboratory
    )
  ).toThrow("Pas de contexte d'intervention SIGAL pour le sous-plan M01.");
});

test('refuse un contexte d’intervention SIGAL gelé ou absent du référentiel', () => {
  expect(() =>
    generateXMLDAI(
      MatrixReferentialFixture,
      daiSample,
      daiSubPlan,
      daiSampleItem,
      1765876056798,
      daiFieldConfigs,
      daiCommemoratifRecord,
      undefined,
      sachaConf,
      laboratory
    )
  ).toThrow(
    'Le contexte d’intervention SIGAL PR17_2026_RPDA_PVOL est gelé ou absent du référentiel.'
  );
});

test('génère une DAI sans commémoratif quand le contexte n’en déclare aucun', async () => {
  const xmlFile = await generateXMLDAI(
    MatrixReferentialFixture,
    daiSample,
    daiSubPlan,
    daiSampleItem,
    1765876056798,
    daiFieldConfigs,
    daiCommemoratifRecord,
    sachaContext([]),
    sachaConf,
    laboratory
  );

  expect(xmlFile.content).toContain('<DialogueEchantillonCommemoratifType>');
  expect(xmlFile.content).not.toContain('<DialogueCommemoratif>');
});

test('refuse un exemplaire dont un analyte n’a pas de plan d’analyse', () => {
  expect(() =>
    generateXMLDAI(
      MatrixReferentialFixture,
      daiSample,
      daiSubPlan,
      { ...daiSampleItem, substanceKinds: ['Copper', 'ANALYTE1'] },
      1765876056798,
      daiFieldConfigs,
      daiCommemoratifRecord,
      daiContext,
      sachaConf,
      laboratory
    )
  ).toThrow("Pas de plan d'analyse de configuré.");
});

test('génère un échantillon par matrice, avec la même étiquette et le même scellé', async () => {
  const xmlFile = await generateXMLDAI(
    MatrixReferentialFixture,
    {
      ...daiSample,
      matrices: [
        { matrixKind: 'A01SN' as MatrixKind, matrix: 'A01SN#F26.A07XE' },
        { matrixKind: 'A01SN' as MatrixKind, matrix: 'A01SQ#F28.A0C0S' }
      ]
    },
    daiSubPlan,
    daiSampleItem,
    1765876056798,
    daiFieldConfigs,
    daiCommemoratifRecord,
    daiContext,
    sachaConf,
    laboratory
  );

  expect(
    [
      ...xmlFile.content.matchAll(
        /<DialogueEchantillonComplet>([\s\S]*?)<\/DialogueEchantillonComplet>/g
      )
    ].map(([, echantillon]) => echantillon.replace(/\s+/g, ''))
  ).toEqual([
    '<NumeroEchantillon>1</NumeroEchantillon><SigleMatriceSpecifique>MSCL_VOL</SigleMatriceSpecifique><NumeroEtiquette>029600250000732025350001</NumeroEtiquette><Commentaire>sealId</Commentaire>',
    '<NumeroEchantillon>2</NumeroEchantillon><SigleMatriceSpecifique>VDE_FRA_DIND</SigleMatriceSpecifique><NumeroEtiquette>029600250000732025350001</NumeroEtiquette><Commentaire>sealId</Commentaire>'
  ]);
});

test('numérote les échantillons à partir de 1, quel que soit le numéro de l’exemplaire', async () => {
  const xmlFile = await generateXMLDAI(
    MatrixReferentialFixture,
    daiSample,
    daiSubPlan,
    { ...daiSampleItem, itemNumber: 2 },
    1765876056798,
    daiFieldConfigs,
    daiCommemoratifRecord,
    daiContext,
    sachaConf,
    laboratory
  );

  expect(xmlFile.content).toContain('<NumeroEchantillon>1</NumeroEchantillon>');
  expect(xmlFile.content).toContain(
    '<NumeroEtiquette>029600250000732025350002</NumeroEtiquette>'
  );
});

test('refuse deux matrices de même sigle SACHA', () => {
  expect(() =>
    generateXMLDAI(
      MatrixReferentialFixture,
      {
        ...daiSample,
        matrices: [
          { matrixKind: 'A01SN' as MatrixKind, matrix: 'A01SN#F26.A07XE' },
          { matrixKind: 'A01SN' as MatrixKind, matrix: 'A01SP#F31.A0CSD' }
        ]
      },
      daiSubPlan,
      daiSampleItem,
      1765876056798,
      daiFieldConfigs,
      daiCommemoratifRecord,
      daiContext,
      sachaConf,
      laboratory
    )
  ).toThrow(
    'Plusieurs matrices avec le même sigle SACHA (MSCL_VOL) : non supporté par l’EDI Sacha.'
  );
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

  test('retourne un tableau vide quand le contexte ne déclare aucun des commémoratifs', () => {
    expect(
      getCommemoratifs(
        specificData,
        sachaFieldConfigs,
        sachaCommemoratifRecord,
        sachaContext([['AUTRE', 'Sample']])
      )
    ).toEqual([]);
  });

  test('retourne les commémoratifs déclarés par le contexte, avec leur niveau', () => {
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
        sachaCommemoratifRecord,
        commemoratifsContext
      )
    ).toEqual([{ sigle: 'ESPECE', level: 'Sample', sigleValue: 'POULE' }]);
  });

  test('retourne un commémoratif par valeur d’un choix multiple', () => {
    expect(
      getCommemoratifs(
        { species: ['ESP7', 'ESP8'] },
        [
          {
            key: 'species',
            inputType: 'multiselect',
            label: 'species',
            hintText: null,
            sachaCommemoratifSigle: 'ESPECE' as CommemoratifSigle,
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
        sachaCommemoratifRecord,
        commemoratifsContext
      )
    ).toEqual([
      { sigle: 'ESPECE', level: 'Sample', sigleValue: 'POULE' },
      { sigle: 'ESPECE', level: 'Sample', sigleValue: 'CANARD' }
    ]);
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
        sachaCommemoratifRecord,
        commemoratifsContext
      )
    ).toEqual([{ sigle: 'ESPECE', level: 'Sample', sigleValue: 'POULE' }]);
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
          values: commemoratifValues('INTENSIF')
        }
      },
      commemoratifsContext
    );
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({
      sigle: 'ESPECE',
      level: 'Sample',
      sigleValue: 'POULE'
    });
    expect(result).toContainEqual({
      sigle: 'MODE_ELEVAGE',
      level: 'SampleMatrix',
      sigleValue: 'INTENSIF'
    });
  });

  test('émet une erreur quand le sachaCommemoratifSigle est manquant', () => {
    expect(() =>
      getCommemoratifs(
        specificData,
        sachaFieldConfigs.filter((fc) => fc.key !== 'species'),
        sachaCommemoratifRecord,
        commemoratifsContext
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
        sachaCommemoratifRecord,
        commemoratifsContext
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
        sachaCommemoratifRecord,
        commemoratifsContext
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
          values: commemoratifValues('INTENSIF')
        }
      },
      sachaContext([['IDA', 'Sample']])
    );

    expect(result).toEqual([
      { sigle: 'IDA', level: 'Sample', textValue: 'super identifiant' }
    ]);
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
          values: commemoratifValues('INTENSIF')
        }
      },
      sachaContext([['AGED', 'Sample']])
    );

    expect(result).toEqual([
      { sigle: 'AGED', level: 'Sample', textValue: '140' }
    ]);
  });

  test('ignore un commémoratif gelé ou absent du référentiel', () => {
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
        {},
        commemoratifsContext
      )
    ).toEqual([]);
  });

  test('émet une erreur quand la valeur reliée est gelée', () => {
    expect(() =>
      getCommemoratifs(
        { species: 'ESP7' },
        [
          {
            key: 'species',
            inputType: 'select' as const,
            label: 'species',
            hintText: null,
            sachaCommemoratifSigle: 'ESPECE' as CommemoratifSigle,
            optional: false,
            options: [
              {
                value: 'ESP7',
                label: 'ESP7',
                order: 0,
                sachaCommemoratifValueSigle:
                  'POULE_GELEE' as CommemoratifValueSigle
              }
            ]
          }
        ],
        sachaCommemoratifRecord,
        commemoratifsContext
      )
    ).toThrow('Configuration SACHA incomplète: species ESP7');
  });
});

test("alimente l'établissement et l'atelier depuis le référentiel atelier", async () => {
  const xmlFile = await generateXMLDAI(
    MatrixReferentialFixture,
    {
      ...daiSample,
      companyWorkshop: {
        id: '11111111-2222-4333-8444-555555555555',
        siret: '54695037900216',
        typeIdentEta: 'ILU',
        etaId: '72080002',
        etaLb: 'SOCOPA VIANDES',
        ideLb: 'DOSDSV',
        ateIdentifiant: '72080002ABATTOIR',
        ateLb:
          "DOSDSV-72080002ABATTOIR-Viande de boucherie - Amont - Chaîne d'abattage anx de boucherie",
        adrLigne1: 'RN 23',
        cpEtab: '72400',
        communeEtab: 'CHERRE'
      }
    },
    daiSubPlan,
    daiSampleItem,
    1765876056798,
    daiFieldConfigs,
    daiCommemoratifRecord,
    daiContext,
    sachaConf,
    laboratory
  );

  expect(xmlFile.content).toContain('<SigleIdentifiant>ILU</SigleIdentifiant>');
  expect(xmlFile.content).toContain('<Identifiant>72080002</Identifiant>');
  expect(xmlFile.content).toContain('<Nom>SOCOPA VIANDES</Nom>');
  expect(xmlFile.content).toContain('<CodePostal>72400 CHERRE</CodePostal>');
  expect(xmlFile.content).toContain('<ReferenceAtelierType>');
  expect(xmlFile.content).toContain(
    '<SigleIdentifiant>DOSDSV</SigleIdentifiant>'
  );
  expect(xmlFile.content).toContain(
    '<Identifiant>72080002ABATTOIR</Identifiant>'
  );
  expect(xmlFile.content).toContain('<Adresse1>RN 23</Adresse1>');
});
