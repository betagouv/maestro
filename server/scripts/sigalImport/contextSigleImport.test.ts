import { describe, expect, test } from 'vitest';
import { computeContextSigleImport } from './contextSigleImport';
import type { MaestroSubPlan } from './descriptorImport';

const subPlan = (
  subPlanNumber: string,
  sachaContextSigle: string | null = null
): MaestroSubPlan => ({
  subPlanNumber,
  programmingPlanId: 'p1',
  programmingPlanTitle: 'Plan 1',
  sachaContextSigle
});

describe('computeContextSigleImport', () => {
  test('sets the acte of each matched sub-plan without context', () => {
    expect(
      computeContextSigleImport(
        [
          { acte: 'PR17_2026_PCRC_PBOV', code: '070' },
          { acte: 'PR17_2026_RPDV_PS', code: '937 PS' },
          { acte: 'PR17_2026_PCRC_PBOV', code: '999' }
        ],
        [subPlan('070'), subPlan('937'), subPlan('PPV01')]
      )
    ).toEqual({
      updates: [
        { subPlanNumber: '070', sachaContextSigle: 'PR17_2026_PCRC_PBOV' },
        { subPlanNumber: '937', sachaContextSigle: 'PR17_2026_RPDV_PS' }
      ],
      conflicts: []
    });
  });

  test('keeps a duplicated code once', () => {
    expect(
      computeContextSigleImport(
        [
          { acte: 'PR17_2026_PCRC_PBOV', code: '057' },
          { acte: 'PR17_2026_PCRC_PBOV', code: '057' }
        ],
        [subPlan('057')]
      ).updates
    ).toEqual([
      { subPlanNumber: '057', sachaContextSigle: 'PR17_2026_PCRC_PBOV' }
    ]);
  });

  test('reports a different context already set, and skips the same one', () => {
    expect(
      computeContextSigleImport(
        [
          { acte: 'PR17_2026_PCRC_PBOV', code: '070' },
          { acte: 'PR17_2026_PCRC_PPOR', code: '071' }
        ],
        [
          subPlan('070', 'PR17_2026_PCRC_PBOV'),
          subPlan('071', 'PR17_2026_PSRC_PPOR')
        ]
      )
    ).toEqual({
      updates: [],
      conflicts: [
        {
          subPlanNumber: '071',
          sachaContextSigle: 'PR17_2026_PCRC_PPOR',
          currentSachaContextSigle: 'PR17_2026_PSRC_PPOR'
        }
      ]
    });
  });
});
