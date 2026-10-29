import { describe, expect, test } from 'vitest';
import type { SachaContextSigle } from '../ProgrammingPlan/ProgrammingSubPlan';
import type {
  CommemoratifSigle,
  CommemoratifValueSigle,
  SachaCommemoratifRecord
} from '../SachaCommemoratif/SachaCommemoratif';
import type { FieldInheritance } from '../SpecificData/FieldInheritance';
import type {
  SpecificDataFieldId,
  SpecificDataFieldOptionId
} from '../SpecificData/ProgrammingSubPlanFieldConfig';
import { type SachaContext, sachaContextFieldsIssue } from './SachaContext';

const sexId = 'sex-id' as SpecificDataFieldId;
const animalKindId = 'animal-kind-id' as SpecificDataFieldId;
const speciesId = 'species-id' as SpecificDataFieldId;
const otherSpeciesId = 'other-species-id' as SpecificDataFieldId;

const maleId = 'male-id' as SpecificDataFieldOptionId;
const femaleId = 'female-id' as SpecificDataFieldOptionId;
const unknownSexId = 'unknown-sex-id' as SpecificDataFieldOptionId;

const fieldConfigs = [
  {
    id: sexId,
    label: 'Sexe',
    sachaCommemoratifSigle: 'SEX1' as CommemoratifSigle,
    options: [
      {
        id: maleId,
        label: 'Mâle',
        sachaCommemoratifValueSigle: 'SEX1_M' as CommemoratifValueSigle
      },
      {
        id: femaleId,
        label: 'Femelle',
        sachaCommemoratifValueSigle: 'SEX1_F_GELE' as CommemoratifValueSigle
      },
      { id: unknownSexId, label: 'Inconnu', sachaCommemoratifValueSigle: null }
    ]
  },
  {
    id: animalKindId,
    label: 'Type animal',
    sachaCommemoratifSigle: 'TAXOEF' as CommemoratifSigle,
    options: []
  },
  {
    id: speciesId,
    label: 'Espèce',
    sachaCommemoratifSigle: 'ESPPVO' as CommemoratifSigle,
    options: []
  },
  {
    id: otherSpeciesId,
    label: 'Autre espèce',
    sachaCommemoratifSigle: 'ESPPVO' as CommemoratifSigle,
    options: []
  }
];

const sexCommemoratif = (
  typeDonnee: 'list' | 'text'
): SachaCommemoratifRecord => ({
  ['SEX1' as CommemoratifSigle]: {
    sigle: 'SEX1' as CommemoratifSigle,
    libelle: 'Sexe',
    typeDonnee,
    unite: null,
    values: {
      ['SEX1_M' as CommemoratifValueSigle]: {
        sigle: 'SEX1_M' as CommemoratifValueSigle,
        libelle: 'Mâle'
      }
    }
  }
});

const context = (...sigles: string[]): SachaContext => ({
  sigle: 'PR17_2026_RPDA_PBOV' as SachaContextSigle,
  libelle: 'Plan de surveillance résidus de pesticides bovin',
  commemoratifs: sigles.map((sigle) => ({
    sigle: sigle as CommemoratifSigle,
    level: 'Sample'
  }))
});

const field = (
  fieldId: SpecificDataFieldId,
  inheritance: FieldInheritance,
  optionIds: SpecificDataFieldOptionId[] = []
) => ({ fieldId, inheritance, optionIds });

describe('sachaContextFieldsIssue', () => {
  test('requires the fields linked to the commemoratifs of the context', () => {
    expect(
      sachaContextFieldsIssue(
        context('DATRECPREL', 'TAXOEF', 'SEX1'),
        [field(sexId, 'Own')],
        fieldConfigs,
        {}
      )
    ).toBe(
      'Le contexte d’intervention SIGAL PR17_2026_RPDA_PBOV demande le descripteur « Type animal ».'
    );
  });

  test('lists every missing field, and ignores an excluded one', () => {
    expect(
      sachaContextFieldsIssue(
        context('TAXOEF', 'SEX1'),
        [field(sexId, 'Excluded')],
        fieldConfigs,
        {}
      )
    ).toBe(
      'Le contexte d’intervention SIGAL PR17_2026_RPDA_PBOV demande les descripteurs « Sexe », « Type animal ».'
    );
  });

  test('accepts any of the fields linked to the same commemoratif', () => {
    expect(
      sachaContextFieldsIssue(
        context('ESPPVO'),
        [field(otherSpeciesId, 'Inherited')],
        fieldConfigs,
        {}
      )
    ).toBeUndefined();
    expect(
      sachaContextFieldsIssue(context('ESPPVO'), [], fieldConfigs, {})
    ).toBe(
      'Le contexte d’intervention SIGAL PR17_2026_RPDA_PBOV demande le descripteur « Espèce » ou « Autre espèce ».'
    );
  });

  test('requires a valid Sacha value for each option offered by the sub-plan', () => {
    expect(
      sachaContextFieldsIssue(
        context('SEX1'),
        [field(sexId, 'Own', [maleId, femaleId, unknownSexId])],
        fieldConfigs,
        sexCommemoratif('list')
      )
    ).toBe(
      'Le contexte d’intervention SIGAL PR17_2026_RPDA_PBOV transmet le descripteur « Sexe » : associez une valeur Sacha à ses options « Femelle », « Inconnu » dans le dictionnaire des descripteurs.'
    );
    expect(
      sachaContextFieldsIssue(
        context('SEX1'),
        [field(sexId, 'Inherited', [maleId, unknownSexId])],
        fieldConfigs,
        sexCommemoratif('list')
      )
    ).toBe(
      'Le contexte d’intervention SIGAL PR17_2026_RPDA_PBOV transmet le descripteur « Sexe » : associez une valeur Sacha à son option « Inconnu » dans le dictionnaire des descripteurs.'
    );
  });

  test('ignores the options not offered, not sent or of a commemoratif which is not a list', () => {
    expect(
      sachaContextFieldsIssue(
        context('SEX1'),
        [field(sexId, 'Own', [maleId])],
        fieldConfigs,
        sexCommemoratif('list')
      )
    ).toBeUndefined();
    expect(
      sachaContextFieldsIssue(
        context('SEX1'),
        [field(sexId, 'Own', [unknownSexId])],
        fieldConfigs,
        sexCommemoratif('text')
      )
    ).toBeUndefined();
    expect(
      sachaContextFieldsIssue(
        context('TAXOEF'),
        [field(animalKindId, 'Own'), field(sexId, 'Own', [unknownSexId])],
        fieldConfigs,
        sexCommemoratif('list')
      )
    ).toBeUndefined();
  });
});
