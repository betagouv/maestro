import { constants } from 'node:http2';
import {
  genDeletableProgrammingPlan,
  genProgrammingPlanDomain,
  ProgrammingPlanDomainFixtures
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  AdminFixture,
  NationalCoordinatorDaoaFixture,
  RegionalCoordinator,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { kysely } from '../../repositories/kysely';
import { programmingPlanDomainRepository } from '../../repositories/programmingPlanDomainRepository';
import programmingPlanRepository from '../../repositories/programmingPlanRepository';
import { programmingSubPlanRepository } from '../../repositories/programmingSubPlanRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Programming plan domain router', () => {
  const { app } = createServer();

  const testRoute = '/api/programming-plan-domains';

  describe('GET /programming-plan-domains', () => {
    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get the domains sorted by label then year', async () => {
      const res = await request(app)
        .get(testRoute)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual(
        [...ProgrammingPlanDomainFixtures].sort(
          (a, b) => a.label.localeCompare(b.label) || a.year - b.year
        )
      );
    });
  });

  describe('POST /programming-plan-domains', () => {
    const testLabel = 'Domaine de test';
    const testYear = 2042;
    const testDomain = { label: testLabel, year: testYear };

    afterAll(async () => {
      await kysely
        .deleteFrom('programmingPlanDomains')
        .where('label', '=', testLabel)
        .execute();
    });

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .send(testDomain)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have the permission', async () => {
      await request(app)
        .post(testRoute)
        .send(testDomain)
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the label is empty', async () => {
      await request(app)
        .post(testRoute)
        .send({ label: ' ', year: testYear })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the year is missing', async () => {
      await request(app)
        .post(testRoute)
        .send({ label: testLabel })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should create the domain', async () => {
      const res = await request(app)
        .post(testRoute)
        .send(testDomain)
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        label: testLabel,
        year: testYear
      });

      const domains = await request(app)
        .get(testRoute)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(domains.body).toContainEqual(res.body);
    });
  });

  describe('DELETE /programming-plan-domains/:programmingPlanDomainId', () => {
    const deletableDomain = genProgrammingPlanDomain({ year: 2043 });
    const deletablePlan = genDeletableProgrammingPlan({
      domainId: deletableDomain.id,
      year: deletableDomain.year
    });

    const domainRoute = (domainId: string) => `${testRoute}/${domainId}`;

    beforeAll(async () => {
      await kysely
        .insertInto('programmingPlanDomains')
        .values(deletableDomain)
        .execute();
      await programmingPlanRepository.insert(deletablePlan);
    });

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .delete(domainRoute(deletableDomain.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have the permission', async () => {
      await request(app)
        .delete(domainRoute(deletableDomain.id))
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the user does not coordinate every plan of the domain', async () => {
      await request(app)
        .delete(domainRoute(deletableDomain.id))
        .use(tokenProvider(NationalCoordinatorDaoaFixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should delete the domain along with its plans and sub-plans', async () => {
      await request(app)
        .delete(domainRoute(deletableDomain.id))
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      await expect(
        programmingPlanDomainRepository.findUnique(deletableDomain.id)
      ).resolves.toBeUndefined();
      await expect(
        programmingPlanRepository.findUnique(deletablePlan.id)
      ).resolves.toBeUndefined();
      await expect(
        programmingSubPlanRepository.findUnique(deletablePlan.subPlans[0].id)
      ).resolves.toBeUndefined();
    });
  });
});
