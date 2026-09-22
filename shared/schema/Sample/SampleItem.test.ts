import { describe, expect, test } from 'vitest';
import { defaultProgrammingPlanSample } from '../ProgrammingPlan/ProgrammingPlanSampleSetting';
import {
  resolveSubstanceKindsLaboratoryId,
  sampleItemsSettingsIssues,
  withFirstCopyLaboratory
} from './SampleItem';

describe('resolveSubstanceKindsLaboratoryId', () => {
  const laboratoryId = '11111111-1111-4111-8111-111111111111';
  const otherLaboratoryId = '22222222-2222-4222-8222-222222222222';

  test('should return the laboratory of a single analyte', () => {
    expect(
      resolveSubstanceKindsLaboratoryId(
        ['Mono'],
        [
          { substanceKind: 'Mono', laboratoryId },
          { substanceKind: 'Multi', laboratoryId: otherLaboratoryId }
        ]
      )
    ).toBe(laboratoryId);
  });

  test('should return the laboratory shared by every analyte', () => {
    expect(
      resolveSubstanceKindsLaboratoryId(
        ['Mono', 'Multi'],
        [
          { substanceKind: 'Mono', laboratoryId },
          { substanceKind: 'Multi', laboratoryId }
        ]
      )
    ).toBe(laboratoryId);
  });

  test('should return null when the analytes have different laboratories', () => {
    expect(
      resolveSubstanceKindsLaboratoryId(
        ['Mono', 'Multi'],
        [
          { substanceKind: 'Mono', laboratoryId },
          { substanceKind: 'Multi', laboratoryId: otherLaboratoryId }
        ]
      )
    ).toBeNull();
  });

  test('should return null when an analyte has no laboratory', () => {
    expect(
      resolveSubstanceKindsLaboratoryId(
        ['Mono', 'Multi'],
        [{ substanceKind: 'Mono', laboratoryId }]
      )
    ).toBeNull();
  });

  test('should return null without analyte', () => {
    expect(
      resolveSubstanceKindsLaboratoryId(
        [],
        [{ substanceKind: 'Mono', laboratoryId }]
      )
    ).toBeNull();
  });
});

describe('sampleItemsSettingsIssues', () => {
  const samples = [
    {
      substanceKinds: ['Mono' as const],
      copies: [
        { required: true, recipientKinds: ['Laboratory'] },
        { required: true, recipientKinds: ['Operator'] },
        { required: false, recipientKinds: ['Sampler', 'Operator'] }
      ] as typeof defaultProgrammingPlanSample.copies
    },
    { ...defaultProgrammingPlanSample, substanceKinds: ['Copper' as const] }
  ];

  test('accepte les exemplaires obligatoires avec des destinataires autorisés', () => {
    expect(
      sampleItemsSettingsIssues(
        [
          { itemNumber: 1, copyNumber: 1, recipientKind: 'Laboratory' },
          { itemNumber: 1, copyNumber: 2, recipientKind: 'Operator' },
          { itemNumber: 1, copyNumber: 3, recipientKind: 'Sampler' },
          { itemNumber: 2, copyNumber: 1, recipientKind: 'Laboratory' }
        ],
        samples
      )
    ).toStrictEqual([]);
  });

  test('signale un exemplaire obligatoire manquant', () => {
    expect(
      sampleItemsSettingsIssues(
        [
          { itemNumber: 1, copyNumber: 1, recipientKind: 'Laboratory' },
          { itemNumber: 2, copyNumber: 1, recipientKind: 'Laboratory' }
        ],
        samples
      )
    ).toStrictEqual([
      {
        path: ['items'],
        message: 'L’exemplaire 2 de l’échantillon 1 est obligatoire.'
      }
    ]);
  });

  test('signale un destinataire non autorisé, et ignore un destinataire non renseigné', () => {
    expect(
      sampleItemsSettingsIssues(
        [
          { itemNumber: 1, copyNumber: 1, recipientKind: 'Laboratory' },
          { itemNumber: 1, copyNumber: 2, recipientKind: 'Sampler' },
          { itemNumber: 2, copyNumber: 1, recipientKind: 'Laboratory' },
          { itemNumber: 2, copyNumber: 2, recipientKind: undefined }
        ],
        samples
      )
    ).toStrictEqual([
      {
        path: ['items', 1, 'recipientKind'],
        message: 'Ce destinataire n’est pas autorisé pour cet exemplaire.'
      }
    ]);
  });
});

describe('withFirstCopyLaboratory', () => {
  const sampleId = '11111111-1111-1111-1111-111111111111';
  const laboratoryId = '22222222-2222-2222-2222-222222222222';

  test('donne aux exemplaires destinés à un laboratoire le laboratoire de l’exemplaire 1', () => {
    expect(
      withFirstCopyLaboratory([
        {
          sampleId,
          itemNumber: 1,
          copyNumber: 1,
          recipientKind: 'Laboratory',
          laboratoryId
        },
        {
          sampleId,
          itemNumber: 1,
          copyNumber: 2,
          recipientKind: 'Laboratory',
          laboratoryId: null
        },
        {
          sampleId,
          itemNumber: 1,
          copyNumber: 3,
          recipientKind: 'Sampler',
          laboratoryId
        },
        {
          sampleId,
          itemNumber: 2,
          copyNumber: 2,
          recipientKind: 'Laboratory',
          laboratoryId
        }
      ])
    ).toStrictEqual([
      {
        sampleId,
        itemNumber: 1,
        copyNumber: 1,
        recipientKind: 'Laboratory',
        laboratoryId
      },
      {
        sampleId,
        itemNumber: 1,
        copyNumber: 2,
        recipientKind: 'Laboratory',
        laboratoryId
      },
      {
        sampleId,
        itemNumber: 1,
        copyNumber: 3,
        recipientKind: 'Sampler',
        laboratoryId: undefined
      },
      {
        sampleId,
        itemNumber: 2,
        copyNumber: 2,
        recipientKind: 'Laboratory',
        laboratoryId: undefined
      }
    ]);
  });
});
