import { describe, expect, test } from 'vitest';
import {
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
