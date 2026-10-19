import { describe, expect, test } from 'vitest';
import {
  AdminFixture,
  NationalCoordinator,
  RegionalCoordinator,
  Sampler1Fixture
} from '../../test/userFixtures';
import { buildFindProgrammingPlanOptions } from './FindProgrammingPlanOptions';

describe('buildFindProgrammingPlanOptions', () => {
  test('should restrict a sampler to their own sub plans', () => {
    const result = buildFindProgrammingPlanOptions(
      Sampler1Fixture,
      'Sampler',
      {}
    );

    expect(result.subPlanIds).toEqual(
      Sampler1Fixture.programmingSubPlans.map((subPlan) => subPlan.id)
    );
  });

  test('should restrict a regional coordinator to their own sub plans', () => {
    const result = buildFindProgrammingPlanOptions(
      RegionalCoordinator,
      'RegionalCoordinator',
      {}
    );

    expect(result.subPlanIds).toEqual(
      RegionalCoordinator.programmingSubPlans.map((subPlan) => subPlan.id)
    );
  });

  test('should not restrict a national coordinator', () => {
    const result = buildFindProgrammingPlanOptions(
      NationalCoordinator,
      'NationalCoordinator',
      {}
    );

    expect(result.subPlanIds).toBeUndefined();
  });

  test('should not restrict an administrator', () => {
    const result = buildFindProgrammingPlanOptions(
      AdminFixture,
      'AdministratorMaestro',
      {}
    );

    expect(result.subPlanIds).toBeUndefined();
  });

  test('should restrict a national coordinator to the plans they own with the owned scope', () => {
    const result = buildFindProgrammingPlanOptions(
      NationalCoordinator,
      'NationalCoordinator',
      { scope: 'owned' }
    );

    expect(result.subPlanIds).toEqual(
      NationalCoordinator.programmingSubPlans.map((subPlan) => subPlan.id)
    );
  });

  test('should not restrict an administrator with the owned scope', () => {
    const result = buildFindProgrammingPlanOptions(
      AdminFixture,
      'AdministratorMaestro',
      { scope: 'owned' }
    );

    expect(result.subPlanIds).toBeUndefined();
  });
});
