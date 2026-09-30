import { DAOAInProgressProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
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
