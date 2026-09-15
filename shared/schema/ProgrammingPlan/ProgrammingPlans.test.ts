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
  const currentPlan = { domainId: 'pesticides', year: 2026 };

  const other = (overrides: {
    domainId?: string;
    year: number;
    launchedAt: Date | null;
  }) => ({ domainId: 'pesticides', ...overrides });

  test('a later campaign of the same domain, once launched, closes sampling', () => {
    expect(
      hasNewerLaunchedCampaign(
        currentPlan as never,
        [other({ year: 2027, launchedAt: new Date('2026-09-01') })] as never
      )
    ).toBe(true);
  });

  test('a later campaign not yet launched leaves sampling open', () => {
    expect(
      hasNewerLaunchedCampaign(
        currentPlan as never,
        [other({ year: 2027, launchedAt: null })] as never
      )
    ).toBe(false);
  });

  test('a launched campaign of another domain does not close sampling', () => {
    expect(
      hasNewerLaunchedCampaign(
        currentPlan as never,
        [
          other({ domainId: 'daoa', year: 2027, launchedAt: new Date() })
        ] as never
      )
    ).toBe(false);
  });

  test('an earlier or same-year launched campaign does not close sampling', () => {
    expect(
      hasNewerLaunchedCampaign(
        currentPlan as never,
        [
          other({ year: 2025, launchedAt: new Date() }),
          other({ year: 2026, launchedAt: new Date() })
        ] as never
      )
    ).toBe(false);
  });
});
