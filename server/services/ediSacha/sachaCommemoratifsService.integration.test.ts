import { fakerFR } from '@faker-js/faker';
import { describe, expect, test } from 'vitest';
import { sachaCommemoratifRepository } from '../../repositories/sachaCommemoratifRepository';
import {
  genCommemoratif,
  genCommemoratifValue
} from '../../repositories/sachaCommemoratifRepository.test';
import { sachaConfRepository } from '../../repositories/sachaConfRepository';
import { sampleSpecificDataRepository } from '../../repositories/sampleSpecificDataRepository';
import {
  TypeDonneeCodec,
  updateSachaCommemoratifs
} from './sachaCommemoratifsService';

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
          ${comm.typeDonnee ? `<TypeDonnee>${comm.typeDonnee}</TypeDonnee>` : ''}
          ${comm.unite ? `<Unite>${comm.unite}</Unite>` : ''}
        </ReferenceCommemoratif>
        ${valuesXML}
      </ReferenceCommemoratifType>
    `;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
    <DonneesStandardisees>
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

describe('updateSachaCommemoratifs', () => {
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

    await updateSachaCommemoratifs(xml);

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

  test('does not insert frozen (gelé) commemoratifs', async () => {
    const commemoratif = genCommemoratif();

    const xml = buildXML([
      {
        sigle: commemoratif.sigle,
        libelle: commemoratif.libelle,
        statut: 'G',
        typeDonnee: 'A'
      }
    ]);

    await updateSachaCommemoratifs(xml);

    const result = await sachaCommemoratifRepository.findAll();
    expect(result[commemoratif.sigle]).toBeUndefined();
  });

  test('does not insert frozen (gelé) commemoratif values', async () => {
    const validValue = genCommemoratifValue();
    const frozenValue = genCommemoratifValue();
    const commemoratif = genCommemoratif({
      values: [validValue, frozenValue]
    });

    const xml = buildXML([
      {
        sigle: commemoratif.sigle,
        libelle: commemoratif.libelle,
        typeDonnee: 'A',
        statut: 'V',
        values: [
          {
            sigle: validValue.sigle,
            libelle: validValue.libelle,
            statut: 'V'
          },
          {
            sigle: frozenValue.sigle,
            libelle: frozenValue.libelle,
            statut: 'G'
          }
        ]
      }
    ]);

    await updateSachaCommemoratifs(xml);

    const result = await sachaCommemoratifRepository.findAll();
    const insertedCommemoratif = result[commemoratif.sigle];

    expect(insertedCommemoratif).toBeDefined();
    expect(Object.keys(insertedCommemoratif.values)).toHaveLength(1);
    expect(insertedCommemoratif.values[validValue.sigle]).toBeDefined();
    expect(insertedCommemoratif.values[frozenValue.sigle]).toBeUndefined();
  });

  test('unlinks frozen commemoratif from sample specific data', async () => {
    const value = genCommemoratifValue();
    const commemoratif = genCommemoratif({ values: [value] });
    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    const attribute = fakerFR.string.alpha(10);
    const attributeValue = fakerFR.string.alpha(10);

    await sampleSpecificDataRepository.updateSampleSpecificDataAttribute({
      attribute,
      sachaCommemoratifSigle: commemoratif.sigle,
      inDai: true,
      optional: false
    });

    await sampleSpecificDataRepository.updateSampleSpecificDataAttributeValue({
      attribute,
      attributeValue,
      sachaCommemoratifValueSigle: value.sigle
    });

    const xml = buildXML([
      {
        sigle: commemoratif.sigle,
        libelle: commemoratif.libelle,
        typeDonnee: 'A',
        statut: 'G'
      }
    ]);

    await updateSachaCommemoratifs(xml);

    const result = await sampleSpecificDataRepository.findAll();
    expect(result[attribute]?.sachaCommemoratifSigle).toBeNull();
    expect(result[attribute]?.values).toEqual({});
  });

  test('deletes frozen commemoratif value from sample specific data', async () => {
    const validValue = genCommemoratifValue();
    const frozenValue = genCommemoratifValue();
    const commemoratif = genCommemoratif({
      values: [validValue, frozenValue]
    });
    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    const attribute = fakerFR.string.alpha(10);
    const validAttributeValue = fakerFR.string.alpha(10);
    const frozenAttributeValue = fakerFR.string.alpha(10);

    await sampleSpecificDataRepository.updateSampleSpecificDataAttribute({
      attribute,
      sachaCommemoratifSigle: commemoratif.sigle,
      inDai: true,
      optional: false
    });

    await sampleSpecificDataRepository.updateSampleSpecificDataAttributeValue({
      attribute,
      attributeValue: validAttributeValue,
      sachaCommemoratifValueSigle: validValue.sigle
    });

    await sampleSpecificDataRepository.updateSampleSpecificDataAttributeValue({
      attribute,
      attributeValue: frozenAttributeValue,
      sachaCommemoratifValueSigle: frozenValue.sigle
    });

    const xml = buildXML([
      {
        sigle: commemoratif.sigle,
        libelle: commemoratif.libelle,
        typeDonnee: 'A',
        statut: 'V',
        values: [
          {
            sigle: validValue.sigle,
            libelle: validValue.libelle,
            statut: 'V'
          },
          {
            sigle: frozenValue.sigle,
            libelle: frozenValue.libelle,
            statut: 'G'
          }
        ]
      }
    ]);

    await updateSachaCommemoratifs(xml);

    const result = await sampleSpecificDataRepository.findAll();
    expect(result[attribute]?.values[validAttributeValue]).toBe(
      validValue.sigle
    );
    expect(result[attribute]?.values[frozenAttributeValue]).toBeUndefined();
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
    await updateSachaCommemoratifs(xml);

    const result = await sachaCommemoratifRepository.findAll();
    expect(result[commemoratif.sigle]?.libelle).toBe(updatedLibelle);
  });

  test('handles XML with no commemoratifs', async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <DonneesStandardisees>
      </DonneesStandardisees>
    `;

    await expect(updateSachaCommemoratifs(xml)).rejects.toThrow();
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

    await updateSachaCommemoratifs(xml);

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

    await updateSachaCommemoratifs(xml);
    const version = await sachaConfRepository.get();

    expect(version.versionReferenceStandardisees).toEqual(
      'DS01DGALDGAL251224111923306'
    );
  });
});
