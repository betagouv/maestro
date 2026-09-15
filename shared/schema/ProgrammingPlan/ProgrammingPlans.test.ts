import { describe, expect, test } from 'vitest';
import { hasNewerLaunchedCampaign } from './ProgrammingPlans';

describe('hasNewerLaunchedCampaign', () => {
  const domainLabelById = new Map([
    ['pesticides-2026', 'Résidus de pesticides'],
    ['pesticides-2027', 'Résidus de pesticides'],
    ['contaminants-2027', 'Contaminants chimiques']
  ]);

  const plan = {
    domainId: 'pesticides-2026',
    title: "Produit carné à l'abattoir",
    year: 2026
  };

  const other = (overrides: {
    domainId?: string;
    title?: string;
    year: number;
    launchedAt: Date | null;
  }) => ({
    domainId: 'pesticides-2027',
    title: "Produit carné à l'abattoir",
    ...overrides
  });

  const check = (others: ReturnType<typeof other>[]) =>
    hasNewerLaunchedCampaign(plan as never, others as never, domainLabelById);

  test('the same plan in a later launched campaign closes sampling', () => {
    expect(
      check([other({ year: 2027, launchedAt: new Date('2026-09-01') })])
    ).toBe(true);
  });

  test('the domain id changes every year, so only its label may be compared', () => {
    expect(plan.domainId).not.toBe(
      other({ year: 2027, launchedAt: null }).domainId
    );
    expect(
      check([other({ year: 2027, launchedAt: new Date('2026-09-01') })])
    ).toBe(true);
  });

  test('a later campaign not yet launched leaves sampling open', () => {
    expect(check([other({ year: 2027, launchedAt: null })])).toBe(false);
  });

  test('another plan of another domain does not close sampling', () => {
    expect(
      check([
        other({
          domainId: 'contaminants-2027',
          title: 'Autre plan',
          year: 2027,
          launchedAt: new Date()
        })
      ])
    ).toBe(false);
  });

  test('an earlier or same-year launched campaign does not close sampling', () => {
    expect(
      check([
        other({
          domainId: 'pesticides-2026',
          year: 2025,
          launchedAt: new Date()
        }),
        other({
          domainId: 'pesticides-2026',
          year: 2026,
          launchedAt: new Date()
        })
      ])
    ).toBe(false);
  });
});
