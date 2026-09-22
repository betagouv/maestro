import { defaultProgrammingPlanSample } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSampleSetting';
import { describe, expect, test } from 'vitest';
import { buildSampleItems } from './sampleItemService';

const sampleId = '11111111-1111-1111-1111-111111111111';

const samples = [
  {
    substanceKinds: ['Mono' as const, 'Multi' as const],
    copies: [
      { required: true, recipientKinds: ['Laboratory'] },
      { required: true, recipientKinds: ['Operator'] },
      { required: false, recipientKinds: ['Sampler', 'Operator'] }
    ] as typeof defaultProgrammingPlanSample.copies
  },
  { ...defaultProgrammingPlanSample, substanceKinds: ['Copper' as const] }
];

describe('buildSampleItems', () => {
  test('crée les exemplaires obligatoires de chaque échantillon paramétré', () => {
    expect(
      buildSampleItems(sampleId, samples, { withOptionalCopies: false })
    ).toStrictEqual([
      {
        sampleId,
        itemNumber: 1,
        copyNumber: 1,
        recipientKind: 'Laboratory',
        substanceKinds: ['Mono', 'Multi']
      },
      {
        sampleId,
        itemNumber: 1,
        copyNumber: 2,
        recipientKind: 'Operator',
        substanceKinds: ['Mono', 'Multi']
      },
      {
        sampleId,
        itemNumber: 2,
        copyNumber: 1,
        recipientKind: 'Laboratory',
        substanceKinds: ['Copper']
      }
    ]);
  });

  test('crée aussi les exemplaires optionnels, sans destinataire quand il y a le choix', () => {
    const items = buildSampleItems(sampleId, samples, {
      withOptionalCopies: true
    });

    expect(
      items.map(({ itemNumber, copyNumber, recipientKind }) => ({
        itemNumber,
        copyNumber,
        recipientKind
      }))
    ).toStrictEqual([
      { itemNumber: 1, copyNumber: 1, recipientKind: 'Laboratory' },
      { itemNumber: 1, copyNumber: 2, recipientKind: 'Operator' },
      { itemNumber: 1, copyNumber: 3, recipientKind: undefined },
      { itemNumber: 2, copyNumber: 1, recipientKind: 'Laboratory' },
      { itemNumber: 2, copyNumber: 2, recipientKind: undefined },
      { itemNumber: 2, copyNumber: 3, recipientKind: undefined }
    ]);
  });
});
