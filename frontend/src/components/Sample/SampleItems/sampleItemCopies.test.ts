import type { ProgrammingPlanSampleSetting } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSampleSetting';
import type { PartialSampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import { describe, expect, test } from 'vitest';
import {
  copyRecipientKinds,
  defaultCopyRecipientKind,
  isRemovableCopy,
  nextCopyNumber
} from './sampleItemCopies';

const sampleId = '11111111-1111-1111-1111-111111111111';

const samples: ProgrammingPlanSampleSetting[] = [
  {
    substanceKinds: ['Mono'],
    copies: [
      { required: true, recipientKinds: ['Laboratory'] },
      { required: false, recipientKinds: ['Sampler', 'Operator'] },
      { required: false, recipientKinds: ['Sampler', 'Operator'] }
    ]
  },
  {
    substanceKinds: ['Copper'],
    copies: [
      { required: true, recipientKinds: ['Laboratory'] },
      { required: false, recipientKinds: ['Sampler', 'Operator'] },
      { required: true, recipientKinds: ['Sampler'] }
    ]
  }
];

const item = (
  itemNumber: number,
  copyNumber: number,
  recipientKind?: PartialSampleItem['recipientKind']
): PartialSampleItem => ({ sampleId, itemNumber, copyNumber, recipientKind });

describe('copyRecipientKinds', () => {
  test('renvoie les destinataires paramétrés pour l’exemplaire', () => {
    expect(
      copyRecipientKinds(samples, { itemNumber: 2, copyNumber: 3 })
    ).toStrictEqual(['Sampler']);
  });

  test('propose préleveur et détenteur sans paramétrage', () => {
    expect(
      copyRecipientKinds([], { itemNumber: 1, copyNumber: 2 })
    ).toStrictEqual(['Operator', 'Sampler']);
  });
});

describe('defaultCopyRecipientKind', () => {
  test('préremplit le destinataire quand il est unique', () => {
    expect(
      defaultCopyRecipientKind(samples, [], { itemNumber: 2, copyNumber: 3 })
    ).toBe('Sampler');
  });

  test('déduit l’exemplaire 3 de l’exemplaire 2 quand c’est autorisé', () => {
    expect(
      defaultCopyRecipientKind(samples, [item(1, 1), item(1, 2, 'Sampler')], {
        itemNumber: 1,
        copyNumber: 3
      })
    ).toBe('Operator');
  });

  test('laisse le choix à l’exemplaire 2', () => {
    expect(
      defaultCopyRecipientKind(samples, [item(1, 1)], {
        itemNumber: 1,
        copyNumber: 2
      })
    ).toBeUndefined();
  });
});

describe('nextCopyNumber', () => {
  test('renvoie le premier numéro d’exemplaire libre', () => {
    expect(nextCopyNumber([item(2, 1), item(2, 3), item(1, 2)], 2)).toBe(2);
  });

  test('ne propose rien au-delà de 3 exemplaires', () => {
    expect(nextCopyNumber([item(1, 1), item(1, 2), item(1, 3)], 1)).toBe(
      undefined
    );
  });
});

describe('isRemovableCopy', () => {
  test('autorise la suppression du dernier exemplaire optionnel', () => {
    const items = [item(1, 1), item(1, 2), item(1, 3)];

    expect(isRemovableCopy(samples, items, item(1, 3))).toBe(true);
    expect(isRemovableCopy(samples, items, item(1, 2))).toBe(false);
  });

  test('interdit la suppression d’un exemplaire obligatoire', () => {
    const items = [item(2, 1), item(2, 2), item(2, 3)];

    expect(isRemovableCopy(samples, items, item(2, 1))).toBe(false);
    expect(isRemovableCopy(samples, items, item(2, 3))).toBe(false);
    expect(isRemovableCopy(samples, items, item(2, 2))).toBe(true);
  });
});
