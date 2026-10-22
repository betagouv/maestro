import { describe, expect, test } from 'vitest';
import { canInitiateNextCampaign } from './ProgrammingPlanDomain';

describe('canInitiateNextCampaign', () => {
  const today = new Date('2026-10-21');

  test('should allow the next campaign from the current year when it does not exist yet', () => {
    expect(canInitiateNextCampaign([2025, 2026], 2026, today)).toBe(true);
  });

  test('should not allow it once the next campaign exists', () => {
    expect(canInitiateNextCampaign([2025, 2026, 2027], 2026, today)).toBe(
      false
    );
  });

  test('should not allow it from another year than the current one', () => {
    expect(canInitiateNextCampaign([2024, 2025], 2025, today)).toBe(false);
  });

  test('should not allow it when the current year does not exist', () => {
    expect(canInitiateNextCampaign([2025], 2026, today)).toBe(false);
  });
});
