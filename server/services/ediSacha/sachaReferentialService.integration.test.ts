import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fakerFR } from '@faker-js/faker';
import type { SachaContextSigle } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type { CommemoratifSigle } from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { afterEach, describe, expect, test } from 'vitest';
import { kysely } from '../../repositories/kysely';
import { sachaCommemoratifRepository } from '../../repositories/sachaCommemoratifRepository';
import {
  genCommemoratif,
  genCommemoratifValue
} from '../../repositories/sachaCommemoratifRepository.test';
import { sachaConfRepository } from '../../repositories/sachaConfRepository';
import { sachaContextRepository } from '../../repositories/sachaContextRepository';
import { sampleSpecificDataRepository } from '../../repositories/sampleSpecificDataRepository';
import { specificDataFieldConfigRepository } from '../../repositories/specificDataFieldConfigRepository';
import { TypeDonneeCodec } from './sachaCommemoratifsService';
import { importSachaReferential } from './sachaReferentialService';

// Use real field keys/option values from the seeded specific_data_fields (migration 081)
const FIELD_KEY = 'species'; // select field with options: ESP7, ESP8, ESP10, ESP20
const VALID_OPTION_VALUE = 'ESP7';
const FROZEN_OPTION_VALUE = 'ESP8';

const buildXML = (
  commemoratifs: Array<{
    sigle: string;
    libelle: string;
    statut: 'G' | 'V';
    typeDonnee: 'V' | 'N' | 'A' | 'D';
    unite?: string;
    values?: Array<{
      sigle: string;
      libelle: string;
      statut: 'G' | 'V';
    }>;
  }>
) => {
  const commemoratifsXML = commemoratifs
    .map((comm) => {
      const valuesXML =
        comm.values
          ?.map(
            (val) => `
      <ReferenceCommemoratifsValeurs>
        <Cle>${fakerFR.string.numeric(12)}</Cle>
        <Sigle>${val.sigle}</Sigle>
        <Libelle>${val.libelle}</Libelle>
        <Statut>${val.statut}</Statut>
      </ReferenceCommemoratifsValeurs>
    `
          )
          .join('') || '';

      return `
      <ReferenceCommemoratifType>
        <ReferenceCommemoratif>
          <Cle>${fakerFR.string.numeric(12)}</Cle>
          <Sigle>${comm.sigle}</Sigle>
          <Libelle>${comm.libelle}</Libelle>
          <Statut>${comm.statut}</Statut>
          ${comm.unite ? `<Unite>${comm.unite}</Unite>` : ''}
          <TypeDonnee>${comm.typeDonnee}</TypeDonnee>
        </ReferenceCommemoratif>
        ${valuesXML}
      </ReferenceCommemoratifType>
    `;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
    <DonneesStandardisees schemavalidation="DonneesStandardisees.xsd">
      <MessageParametres>
          <CodeScenario>E.D.I. SIGAL/LABOS</CodeScenario>
          <VersionScenario>1.0.1</VersionScenario>
          <TypeFichier>DS01</TypeFichier>
          <NomFichier>DS01DGALDGAL251224111923306</NomFichier>
          <NomLogicielCreation>SIGAL</NomLogicielCreation>
          <VersionLogicielCreation>4.0</VersionLogicielCreation>
          <CodeReferentielPrescripteur>SIGAL</CodeReferentielPrescripteur>
      </MessageParametres>
      ${commemoratifsXML}
    </DonneesStandardisees>
  `;
};

const buildRP01XML = (
  contexts: Array<{
    sigle: string;
    statut: 'G' | 'V';
    intervention?: string[];
    echantillon?: string[];
  }>
) => `<?xml version="1.0" encoding="UTF-8"?>
    <ReferentielPrescripteur schemavalidation="ReferentielPrescripteur.xsd">
      <MessageParametres>
        <CodeScenario>E.D.I. SIGAL/LABOS</CodeScenario>
        <VersionScenario>1.0.1</VersionScenario>
        <TypeFichier>RP01</TypeFichier>
        <NomFichier>RP01DGALDGAL260803195529876</NomFichier>
        <NomLogicielCreation>SIGAL</NomLogicielCreation>
        <VersionLogicielCreation>4.0</VersionLogicielCreation>
      </MessageParametres>
      <Emetteur>
        <Sigle>DGAL</Sigle>
        <LibellePartenaire>DGAL</LibellePartenaire>
        <EmailPartenaire>sigal.dgal@agriculture.gouv.fr</EmailPartenaire>
      </Emetteur>
      ${contexts
        .map(
          (context) => `
      <ReferenceContextesType>
        <ReferenceContextesIntervention>
          <Cle>${fakerFR.string.numeric(12)}</Cle>
          <Sigle>${context.sigle}</Sigle>
          <Libelle>Libellé ${context.sigle}</Libelle>
          <Statut>${context.statut}</Statut>
          <DateModification>2026-08-03T19:55:29</DateModification>
        </ReferenceContextesIntervention>
        ${(context.intervention ?? [])
          .map(
            (sigle) => `
        <ReferenceCommemoratifsInterventionContexte>
          <SigleCommemoratif>${sigle}</SigleCommemoratif>
        </ReferenceCommemoratifsInterventionContexte>`
          )
          .join('')}
        ${(context.echantillon ?? [])
          .map(
            (sigle) => `
        <ReferenceCommemoratifsEchantillonContexte>
          <SigleCommemoratif>${sigle}</SigleCommemoratif>
        </ReferenceCommemoratifsEchantillonContexte>`
          )
          .join('')}
      </ReferenceContextesType>`
        )
        .join('')}
    </ReferentielPrescripteur>
  `;

const genContextSigle = () =>
  `PR17_2026_${fakerFR.string.alpha({ length: 8, casing: 'upper' })}` as SachaContextSigle;

const findContextRows = (sigle: SachaContextSigle) =>
  kysely
    .selectFrom('sachaContextCommemoratifs')
    .select(['commemoratifSigle', 'level', 'deprecated'])
    .where('contextSigle', '=', sigle)
    .orderBy('commemoratifSigle')
    .execute();

afterEach(async () => {
  // Reset sacha mappings on the species field after each test
  await kysely
    .updateTable('specificDataFields')
    .set({ sachaCommemoratifSigle: null })
    .where('key', '=', FIELD_KEY)
    .execute();

  await kysely
    .updateTable('specificDataFieldOptions')
    .set({ sachaCommemoratifValueSigle: null })
    .where('fieldKey', '=', FIELD_KEY)
    .execute();
});

describe('importSachaReferential (DS01)', () => {
  test('inserts new valid commemoratifs from XML', async () => {
    const value1 = genCommemoratifValue();
    const value2 = genCommemoratifValue();
    const commemoratif = genCommemoratif({
      values: [value1, value2]
    });

    const xml = buildXML([
      {
        sigle: commemoratif.sigle,
        libelle: commemoratif.libelle,
        statut: 'V',
        typeDonnee: TypeDonneeCodec.encode(commemoratif.typeDonnee),
        values: [
          {
            sigle: value1.sigle,
            libelle: value1.libelle,
            statut: 'V'
          },
          { sigle: value2.sigle, libelle: value2.libelle, statut: 'V' }
        ]
      }
    ]);

    await expect(importSachaReferential(xml)).resolves.toEqual({
      kind: 'DS01',
      fileName: 'DS01DGALDGAL251224111923306'
    });

    const result = await sachaCommemoratifRepository.findAll();
    const insertedCommemoratif = result[commemoratif.sigle];

    expect(insertedCommemoratif).toMatchObject({
      sigle: commemoratif.sigle,
      libelle: commemoratif.libelle,
      typeDonnee: commemoratif.typeDonnee
    });

    expect(Object.keys(insertedCommemoratif.values)).toHaveLength(2);
    expect(insertedCommemoratif.values[value1.sigle]).toBeDefined();
    expect(insertedCommemoratif.values[value2.sigle]).toBeDefined();
  });

  test('ignores a frozen (gelé) commemoratif, and deprecates it when it was known', async () => {
    const valid = genCommemoratif();
    const unknown = genCommemoratif();
    const known = genCommemoratif();
    await sachaCommemoratifRepository.upsertAll([known]);

    await importSachaReferential(
      buildXML(
        [valid, unknown, known].map(({ sigle, libelle }) => ({
          sigle,
          libelle,
          statut: sigle === valid.sigle ? 'V' : 'G',
          typeDonnee: 'A'
        }))
      )
    );

    await expect(
      kysely
        .selectFrom('sachaCommemoratifs')
        .select(['sigle', 'deprecated'])
        .where('sigle', 'in', [unknown.sigle, known.sigle])
        .execute()
    ).resolves.toEqual([{ sigle: known.sigle, deprecated: true }]);
  });

  test('ignores a frozen (gelé) commemoratif value, and deprecates it when it was known', async () => {
    const validValue = genCommemoratifValue();
    const unknownValue = genCommemoratifValue();
    const knownValue = genCommemoratifValue();
    const commemoratif = genCommemoratif({ values: [validValue, knownValue] });
    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    await importSachaReferential(
      buildXML([
        {
          sigle: commemoratif.sigle,
          libelle: commemoratif.libelle,
          typeDonnee: 'A',
          statut: 'V',
          values: [validValue, unknownValue, knownValue].map(
            ({ sigle, libelle }) => ({
              sigle,
              libelle,
              statut: sigle === validValue.sigle ? 'V' : 'G'
            })
          )
        }
      ])
    );

    await expect(
      kysely
        .selectFrom('sachaCommemoratifValues')
        .select(['sigle', 'deprecated'])
        .where('commemoratifSigle', '=', commemoratif.sigle)
        .orderBy('sigle')
        .execute()
    ).resolves.toEqual(
      [
        { sigle: validValue.sigle, deprecated: false },
        { sigle: knownValue.sigle, deprecated: true }
      ].sort((a, b) => a.sigle.localeCompare(b.sigle))
    );
  });

  test('deprecates what a new file no longer contains, and restores it when it comes back', async () => {
    const keptValue = genCommemoratifValue();
    const removedValue = genCommemoratifValue();
    const kept = genCommemoratif({ values: [keptValue, removedValue] });
    const removed = genCommemoratif();
    const toXML = (
      commemoratifs: { sigle: string; values: { sigle: string }[] }[]
    ) =>
      buildXML(
        commemoratifs.map(({ sigle, values }) => ({
          sigle,
          libelle: sigle,
          statut: 'V',
          typeDonnee: 'V',
          values: values.map((value) => ({
            sigle: value.sigle,
            libelle: value.sigle,
            statut: 'V'
          }))
        }))
      );

    await importSachaReferential(toXML([kept, removed]));
    await importSachaReferential(toXML([{ ...kept, values: [keptValue] }]));

    const afterRemoval = await sachaCommemoratifRepository.findAll();
    expect(afterRemoval[removed.sigle]).toBeUndefined();
    expect(Object.keys(afterRemoval[kept.sigle].values)).toEqual([
      keptValue.sigle
    ]);

    await importSachaReferential(toXML([kept, removed]));

    const afterReturn = await sachaCommemoratifRepository.findAll();
    expect(afterReturn[removed.sigle]).toBeDefined();
    expect(Object.keys(afterReturn[kept.sigle].values).sort()).toEqual(
      [keptValue.sigle, removedValue.sigle].sort()
    );
  });

  test('keeps the field and option mappings of a frozen commemoratif', async () => {
    const value = genCommemoratifValue();
    const commemoratif = genCommemoratif({ values: [value] });
    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    await sampleSpecificDataRepository.updateSampleSpecificDataAttribute({
      attribute: FIELD_KEY,
      sachaCommemoratifSigle: commemoratif.sigle,
      optional: false
    });

    await sampleSpecificDataRepository.updateSampleSpecificDataAttributeValue({
      attribute: FIELD_KEY,
      attributeValue: VALID_OPTION_VALUE,
      sachaCommemoratifValueSigle: value.sigle
    });

    const valid = genCommemoratif();
    const xml = buildXML([
      {
        sigle: valid.sigle,
        libelle: valid.libelle,
        typeDonnee: 'A',
        statut: 'V'
      },
      {
        sigle: commemoratif.sigle,
        libelle: commemoratif.libelle,
        typeDonnee: 'V',
        statut: 'G',
        values: [{ sigle: value.sigle, libelle: value.libelle, statut: 'G' }]
      }
    ]);

    await importSachaReferential(xml);

    const result = await specificDataFieldConfigRepository.findSachaFields();
    const field = result.find((fc) => fc.key === FIELD_KEY);
    expect(field?.sachaCommemoratifSigle).toBe(commemoratif.sigle);
    expect(
      field?.options.find((o) => o.value === VALID_OPTION_VALUE)
        ?.sachaCommemoratifValueSigle
    ).toBe(value.sigle);
    expect(
      field?.options.find((o) => o.value === FROZEN_OPTION_VALUE)
        ?.sachaCommemoratifValueSigle
    ).toBeNull();
  });

  test('updates existing commemoratifs', async () => {
    const commemoratif = genCommemoratif();
    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    const updatedLibelle = 'Updated Libelle';
    const xml = buildXML([
      {
        sigle: commemoratif.sigle,
        libelle: updatedLibelle,
        typeDonnee: 'A',
        statut: 'V'
      }
    ]);
    await importSachaReferential(xml);

    const result = await sachaCommemoratifRepository.findAll();
    expect(result[commemoratif.sigle]?.libelle).toBe(updatedLibelle);
  });

  test('refuses a file not compliant with the XSD', async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <DonneesStandardisees schemavalidation="DonneesStandardisees.xsd">
      </DonneesStandardisees>
    `;

    await expect(importSachaReferential(xml)).rejects.toThrow(
      /^Fichier non conforme à la XSD Sacha/
    );
  });

  test('handles commemoratifs without values', async () => {
    const commemoratif = genCommemoratif({ values: [] });

    const xml = buildXML([
      {
        sigle: commemoratif.sigle,
        libelle: commemoratif.libelle,
        typeDonnee: 'A',
        statut: 'V'
      }
    ]);

    await importSachaReferential(xml);

    const result = await sachaCommemoratifRepository.findAll();
    const insertedCommemoratif = result[commemoratif.sigle];

    expect(insertedCommemoratif).toBeDefined();
    expect(Object.keys(insertedCommemoratif.values)).toHaveLength(0);
  });

  test('handles sacha version', async () => {
    const commemoratif = genCommemoratif({ values: [] });

    const xml = buildXML([
      {
        sigle: commemoratif.sigle,
        libelle: commemoratif.libelle,
        typeDonnee: 'A',
        statut: 'V'
      }
    ]);

    await importSachaReferential(xml);
    const version = await sachaConfRepository.get();

    expect(version.versionReferenceStandardisees).toEqual(
      'DS01DGALDGAL251224111923306'
    );
  });
});

describe('importSachaReferential (RP01)', () => {
  const sex = genCommemoratif({ sigle: 'SEX1_TEST' as CommemoratifSigle });
  const animalKind = genCommemoratif({
    sigle: 'TAXOEF_TEST' as CommemoratifSigle
  });
  const temperature = genCommemoratif({
    sigle: 'TEMPREC_TEST' as CommemoratifSigle
  });

  const importCommemoratifs = () =>
    sachaCommemoratifRepository.upsertAll([sex, animalKind, temperature]);

  test('imports the contexts with their commemoratifs at both levels', async () => {
    await importCommemoratifs();
    const sigle = genContextSigle();

    await expect(
      importSachaReferential(
        buildRP01XML([
          {
            sigle,
            statut: 'V',
            intervention: [sex.sigle, animalKind.sigle],
            echantillon: [temperature.sigle]
          }
        ])
      )
    ).resolves.toEqual({
      kind: 'RP01',
      fileName: 'RP01DGALDGAL260803195529876'
    });

    await expect(
      sachaContextRepository.findUsableBySigle(sigle)
    ).resolves.toEqual({
      sigle,
      libelle: `Libellé ${sigle}`,
      commemoratifs: [
        { sigle: sex.sigle, level: 'Sample' },
        { sigle: animalKind.sigle, level: 'Sample' },
        { sigle: temperature.sigle, level: 'SampleMatrix' }
      ]
    });
    expect((await sachaConfRepository.get()).versionReferencePrescripteur).toBe(
      'RP01DGALDGAL260803195529876'
    );
  });

  test('keeps a frozen or removed context and its lines as deprecated, and restores them', async () => {
    await importCommemoratifs();
    const frozen = genContextSigle();
    const removed = genContextSigle();
    const kept = genContextSigle();

    await importSachaReferential(
      buildRP01XML([
        { sigle: frozen, statut: 'V', intervention: [sex.sigle] },
        { sigle: removed, statut: 'V', intervention: [sex.sigle] },
        {
          sigle: kept,
          statut: 'V',
          intervention: [sex.sigle, animalKind.sigle]
        }
      ])
    );
    await importSachaReferential(
      buildRP01XML([
        { sigle: frozen, statut: 'G', intervention: [sex.sigle] },
        {
          sigle: kept,
          statut: 'V',
          intervention: [sex.sigle],
          echantillon: [animalKind.sigle]
        }
      ])
    );

    await expect(
      sachaContextRepository.findUsableBySigle(frozen)
    ).resolves.toBeUndefined();
    await expect(
      sachaContextRepository.findUsableBySigle(removed)
    ).resolves.toBeUndefined();
    await expect(findContextRows(removed)).resolves.toEqual([
      { commemoratifSigle: sex.sigle, level: 'Sample', deprecated: false }
    ]);
    await expect(findContextRows(kept)).resolves.toEqual(
      [
        {
          commemoratifSigle: animalKind.sigle,
          level: 'SampleMatrix',
          deprecated: false
        },
        {
          commemoratifSigle: sex.sigle,
          level: 'Sample',
          deprecated: false
        }
      ].sort((a, b) => a.commemoratifSigle.localeCompare(b.commemoratifSigle))
    );

    await importSachaReferential(
      buildRP01XML([{ sigle: kept, statut: 'V', intervention: [sex.sigle] }])
    );

    await expect(findContextRows(kept)).resolves.toEqual(
      [
        {
          commemoratifSigle: animalKind.sigle,
          level: 'SampleMatrix',
          deprecated: true
        },
        {
          commemoratifSigle: sex.sigle,
          level: 'Sample',
          deprecated: false
        }
      ].sort((a, b) => a.commemoratifSigle.localeCompare(b.commemoratifSigle))
    );

    await importSachaReferential(
      buildRP01XML([{ sigle: removed, statut: 'V', intervention: [sex.sigle] }])
    );

    await expect(
      sachaContextRepository.findUsableBySigle(removed)
    ).resolves.toMatchObject({ sigle: removed });
  });

  test('refuses a context that cites a commemoratif unknown from the DS01', async () => {
    const sigle = genContextSigle();

    await expect(
      importSachaReferential(
        buildRP01XML([{ sigle, statut: 'V', intervention: ['INCONNU_TEST'] }])
      )
    ).rejects.toThrow(
      'Importer d’abord les données standardisées (DS01) : commémoratif INCONNU_TEST inconnu.'
    );
    await expect(
      kysely
        .selectFrom('sachaContexts')
        .select('sigle')
        .where('sigle', '=', sigle)
        .executeTakeFirst()
    ).resolves.toBeUndefined();
  });

  test('refuses a file which is neither a DS01 nor a RP01', async () => {
    await expect(
      importSachaReferential(
        readFileSync(
          path.join(import.meta.dirname, 'example-rai-1.xml'),
          'utf-8'
        )
      )
    ).rejects.toThrow(
      'Ce fichier n’est ni un référentiel des données standardisées (DS01) ni un référentiel prescripteur (RP01).'
    );
  });
});
