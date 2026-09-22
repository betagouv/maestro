import { describe, expect, test } from 'vitest';
import { getSubstancesSections } from './pdfService';

describe('getSubstancesSections', () => {
  const sample = {
    matrix: 'Muscle',
    monoSubstances: ['RF-00004266-PAR' as const],
    multiSubstances: []
  };

  test('affiche un seul analyte en pleine largeur', () => {
    expect(getSubstancesSections(['Copper'], sample)).toEqual({
      substancesSections: [
        { label: 'Cuivre', substances: [], withEmptyLines: false }
      ],
      substancesColClass: 'fr-col-12'
    });
  });

  test('affiche un bloc par analyte en demi-largeur dès qu’il y en a plusieurs', () => {
    expect(
      getSubstancesSections(['Mono', 'Multi', 'ANALYTE5'], sample)
    ).toEqual({
      substancesSections: [
        {
          label: 'Mono-résidu',
          substances: ['delta 3-carene'],
          withEmptyLines: false
        },
        {
          label: 'Multi-résidus dont :',
          substances: [],
          withEmptyLines: false
        },
        { label: 'Acrylamide', substances: [], withEmptyLines: false }
      ],
      substancesColClass: 'fr-col-6'
    });
  });

  test('affiche Any comme Mono et Multi', () => {
    expect(
      getSubstancesSections(['Any', 'Mono'], sample).substancesSections.map(
        ({ label }) => label
      )
    ).toEqual(['Mono-résidu', 'Multi-résidus dont :']);
  });

  test('laisse des lignes vides pour Mono et Multi sans matrice', () => {
    expect(
      getSubstancesSections(['Mono', 'Multi', 'Copper'], {
        ...sample,
        matrix: ''
      }).substancesSections
    ).toEqual([
      { label: 'Mono-résidu', substances: [], withEmptyLines: true },
      { label: 'Multi-résidus', substances: [], withEmptyLines: true },
      { label: 'Cuivre', substances: [], withEmptyLines: false }
    ]);
  });
});
