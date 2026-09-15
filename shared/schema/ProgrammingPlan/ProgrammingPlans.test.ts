import { describe, expect, test } from 'vitest';
import { hasNewerLaunchedCampaign } from './ProgrammingPlans';

describe('hasNewerLaunchedCampaign', () => {
  const plan = { domainId: 'pesticides', year: 2026 };

  const other = (overrides: {
    domainId?: string;
    year: number;
    launchedAt: Date | null;
  }) => ({ domainId: 'pesticides', ...overrides });

  test('a later campaign of the same domain, once launched, closes sampling', () => {
    expect(
      hasNewerLaunchedCampaign(
        plan as never,
        [other({ year: 2027, launchedAt: new Date('2026-09-01') })] as never
      )
    ).toBe(true);
  });

  test('a later campaign not yet launched leaves sampling open', () => {
    expect(
      hasNewerLaunchedCampaign(
        plan as never,
        [other({ year: 2027, launchedAt: null })] as never
      )
    ).toBe(false);
  });

  test('a launched campaign of another domain does not close sampling', () => {
    expect(
      hasNewerLaunchedCampaign(
        plan as never,
        [
          other({ domainId: 'daoa', year: 2027, launchedAt: new Date() })
        ] as never
      )
    ).toBe(false);
  });

  test('an earlier or same-year launched campaign does not close sampling', () => {
    expect(
      hasNewerLaunchedCampaign(
        plan as never,
        [
          other({ year: 2025, launchedAt: new Date() }),
          other({ year: 2026, launchedAt: new Date() })
        ] as never
      )
    ).toBe(false);
  });
});
