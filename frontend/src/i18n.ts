import { isNil } from 'lodash-es';

const translations = {
  analysis: {
    zero: 'Aucune analyse',
    one: 'Une analyse',
    other: '{{count}} analyses'
  },
  has_been_commented: {
    zero: "n'a été commentée",
    one: 'a été commentée',
    other: 'ont été commentées'
  },
  matrix: {
    zero: 'Aucune matrice',
    one: 'Une matrice',
    other: '{{count}} matrices'
  },
  programmingPlan: {
    zero: 'Aucun plan',
    one: 'Un plan',
    other: '{{count}} plans'
  },
  subPlan: {
    zero: 'Aucun sous-plan',
    one: 'Un sous-plan',
    other: '{{count}} sous-plans'
  },
  sample: {
    zero: 'Aucun prélèvement',
    one: 'Un prélèvement',
    other: '{{count}} prélèvements'
  },
  residue: {
    zero: 'Aucun résidu',
    one: 'Un résidu',
    other: '{{count}} résidus'
  },
  department: {
    zero: 'Aucun département',
    one: 'Un département',
    other: '{{count}} départements'
  },
  context: {
    zero: 'Aucun contexte',
    one: 'Un contexte',
    other: '{{count}} contextes'
  }
} as const satisfies Record<string, Record<'zero' | 'one' | 'other', string>>;

export const t = (
  key: keyof typeof translations,
  { count }: { count: number | null | undefined }
): string => {
  if (isNil(count)) {
    return '';
  }
  const forms = translations[key];
  if (count === 0) {
    return forms.zero;
  }
  if (count === 1) {
    return forms.one;
  }
  return forms.other.replace('{{count}}', String(count));
};
