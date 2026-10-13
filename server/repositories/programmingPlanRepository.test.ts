import { Regions } from 'maestro-shared/referential/Region';
import {
  DAOAInProgressProgrammingPlanFixture,
  DAOAValidatedProgrammingPlanFixture,
  PPVValidatedProgrammingPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import { describe, expect, test } from 'vitest';
import programmingPlanRepository from './programmingPlanRepository';

describe('findUnique', () => {
  test('should give the matrices of each sub-plan', async () => {
    const programmingPlan = await programmingPlanRepository.findUnique(
      DAOAInProgressProgrammingPlanFixture.id
    );

    expect(
      programmingPlan?.subPlans.map(({ id, matrices }) => ({ id, matrices }))
    ).toStrictEqual(
      DAOAInProgressProgrammingPlanFixture.subPlans.map(({ id, matrices }) => ({
        id,
        matrices
      }))
    );
  });
});

describe('findMany', () => {
  test('should give a department the regional plans of its region, but not the other plans without a departmental status', async () => {
    const programmingPlans = await programmingPlanRepository.findMany({
      region: '44',
      department: Regions['44'].departments[0]
    });

    const ids = programmingPlans.map(({ id }) => id);
    expect(ids).toContain(PPVValidatedProgrammingPlanFixture.id);
    expect(ids).not.toContain(DAOAValidatedProgrammingPlanFixture.id);
    expect(ids).not.toContain(DAOAInProgressProgrammingPlanFixture.id);
  });
});
