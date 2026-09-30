import { constants } from 'node:http2';
import type { ProgrammingPlanDomain } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { genDeletableProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import {
  AdminFixture,
  NationalCoordinator
} from 'maestro-shared/test/userFixtures';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { programmingPlanDomainRepository } from '../../repositories/programmingPlanDomainRepository';
import programmingPlanRepository from '../../repositories/programmingPlanRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Programming plan domain move router', () => {
  const { app } = createServer();

  const programmingPlan = genDeletableProgrammingPlan();
  let targetDomain: ProgrammingPlanDomain;

  const testRoute = `/api/programming-plans/${programmingPlan.id}/domain`;

  beforeAll(async () => {
    await programmingPlanRepository.insert(programmingPlan);
    targetDomain = await programmingPlanDomainRepository.insert({
      label: 'Domaine cible',
      year: programmingPlan.year
    });
  });

  afterAll(async () => {
    await programmingPlanRepository.deleteOne(programmingPlan.id);
    await programmingPlanDomainRepository.deleteOne(targetDomain.id);
  });

  describe('PUT /programming-plans/:programmingPlanId/domain', () => {
    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute)
        .send({ domainId: targetDomain.id })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have the permission', async () => {
      await request(app)
        .put(testRoute)
        .send({ domainId: targetDomain.id })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should move the programming plan to the domain', async () => {
      const res = await request(app)
        .put(testRoute)
        .send({ domainId: targetDomain.id })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        id: programmingPlan.id,
        domainId: targetDomain.id
      });
      await expect(
        programmingPlanRepository.findUnique(programmingPlan.id)
      ).resolves.toMatchObject({ domainId: targetDomain.id });
    });
  });
});
