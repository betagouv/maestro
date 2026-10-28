import { describe, expect, test } from 'vitest';
import type { SachaContextSigle } from '../ProgrammingPlan/ProgrammingSubPlan';
import type { CommemoratifSigle } from '../SachaCommemoratif/SachaCommemoratif';
import type { SpecificDataFieldId } from '../SpecificData/ProgrammingSubPlanFieldConfig';
import { type SachaContext, sachaContextFieldsIssue } from './SachaContext';

const sexId = 'sex-id' as SpecificDataFieldId;
const animalKindId = 'animal-kind-id' as SpecificDataFieldId;
const speciesId = 'species-id' as SpecificDataFieldId;
const otherSpeciesId = 'other-species-id' as SpecificDataFieldId;

const fieldConfigs = [
  {
    id: sexId,
    label: 'Sexe',
    sachaCommemoratifSigle: 'SEX1' as CommemoratifSigle
  },
  {
    id: animalKindId,
    label: 'Type animal',
    sachaCommemoratifSigle: 'TAXOEF' as CommemoratifSigle
  },
  {
    id: speciesId,
    label: 'Espèce',
    sachaCommemoratifSigle: 'ESPPVO' as CommemoratifSigle
  },
  {
    id: otherSpeciesId,
    label: 'Autre espèce',
    sachaCommemoratifSigle: 'ESPPVO' as CommemoratifSigle
  }
];

const context = (...sigles: string[]): SachaContext => ({
  sigle: 'PR17_2026_RPDA_PBOV' as SachaContextSigle,
  libelle: 'Plan de surveillance résidus de pesticides bovin',
  commemoratifs: sigles.map((sigle) => ({
    sigle: sigle as CommemoratifSigle,
    level: 'Sample'
  }))
});

describe('sachaContextFieldsIssue', () => {
  test('requires the fields linked to the commemoratifs of the context', () => {
    expect(
      sachaContextFieldsIssue(
        context('DATRECPREL', 'TAXOEF', 'SEX1'),
        [{ fieldId: sexId, inheritance: 'Own' }],
        fieldConfigs
      )
    ).toBe(
      'Le contexte d’intervention SIGAL PR17_2026_RPDA_PBOV demande le descripteur « Type animal ».'
    );
  });

  test('lists every missing field, and ignores an excluded one', () => {
    expect(
      sachaContextFieldsIssue(
        context('TAXOEF', 'SEX1'),
        [{ fieldId: sexId, inheritance: 'Excluded' }],
        fieldConfigs
      )
    ).toBe(
      'Le contexte d’intervention SIGAL PR17_2026_RPDA_PBOV demande les descripteurs « Sexe », « Type animal ».'
    );
  });

  test('accepts any of the fields linked to the same commemoratif', () => {
    expect(
      sachaContextFieldsIssue(
        context('ESPPVO'),
        [{ fieldId: otherSpeciesId, inheritance: 'Inherited' }],
        fieldConfigs
      )
    ).toBeUndefined();
    expect(sachaContextFieldsIssue(context('ESPPVO'), [], fieldConfigs)).toBe(
      'Le contexte d’intervention SIGAL PR17_2026_RPDA_PBOV demande le descripteur « Espèce » ou « Autre espèce ».'
    );
  });
});
