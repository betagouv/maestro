import { describe, expect, test } from 'vitest';
import {
  hasNewerLaunchedCampaign,
  isProgrammingPlanDeletable,
  isProgrammingPlanDomainDeletable
} from './ProgrammingPlans';

const plan = (
  settingsCompleted: boolean,
  ...subPlans: boolean[]
): Parameters<typeof isProgrammingPlanDeletable>[0] => ({
  settingsCompleted,
  subPlans: subPlans.map((completed) => ({ settingsCompleted: completed }))
});

describe('isProgrammingPlanDeletable', () => {
  test('should accept a plan whose settings and sub-plan settings are all in progress', () => {
    expect(isProgrammingPlanDeletable(plan(false, false, false))).toBe(true);
  });

  test('should accept a plan without any sub-plan', () => {
    expect(isProgrammingPlanDeletable(plan(false))).toBe(true);
  });

  test('should reject a plan whose settings are completed', () => {
    expect(isProgrammingPlanDeletable(plan(true, false))).toBe(false);
  });

  test('should reject a plan holding a completed sub-plan', () => {
    expect(isProgrammingPlanDeletable(plan(false, false, true))).toBe(false);
  });
});

describe('isProgrammingPlanDomainDeletable', () => {
  test('should accept a domain without any plan', () => {
    expect(isProgrammingPlanDomainDeletable([])).toBe(true);
  });

  test('should accept a domain whose plans are all deletable', () => {
    expect(
      isProgrammingPlanDomainDeletable([plan(false, false), plan(false)])
    ).toBe(true);
  });

  test('should reject a domain holding a completed plan', () => {
    expect(
      isProgrammingPlanDomainDeletable([plan(false, false), plan(true)])
    ).toBe(false);
  });

  test('should reject a domain holding a completed sub-plan', () => {
    expect(
      isProgrammingPlanDomainDeletable([plan(false), plan(false, true)])
    ).toBe(false);
  });
});

describe('hasNewerLaunchedCampaign', () => {
  const domainLabelById = new Map([
    ['pesticides-2026', 'Résidus de pesticides'],
    ['pesticides-2027', 'Résidus de pesticides'],
    ['contaminants-2027', 'Contaminants chimiques']
  ]);

  const currentPlan = {
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
    hasNewerLaunchedCampaign(
      currentPlan as never,
      others as never,
      domainLabelById
    );

  test('the same plan in a later launched campaign closes sampling', () => {
    expect(
      check([other({ year: 2027, launchedAt: new Date('2026-09-01') })])
    ).toBe(true);
  });

  test('the domain id changes every year, so only its label may be compared', () => {
    expect(currentPlan.domainId).not.toBe(
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
