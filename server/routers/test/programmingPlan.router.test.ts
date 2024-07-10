import { constants } from 'http2';
import randomstring from 'randomstring';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { NationalCoordinator } from '../../../database/seeds/test/001-users';
import { genProgrammingPlan } from '../../../shared/test/testFixtures';
import db from '../../repositories/db';
import { ProgrammingPlans } from '../../repositories/programmingPlanRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('ProgrammingPlan router', () => {
  const { app } = createServer();

  const programmingPlan1 = genProgrammingPlan(NationalCoordinator.id);
  const programmingPlan2 = genProgrammingPlan(NationalCoordinator.id);

  beforeAll(async () => {
    await db.seed.run();
    await ProgrammingPlans().insert([programmingPlan1, programmingPlan2]);
  });

  describe('GET /programming-plans/{programmingPlanId}', () => {
    const testRoute = (programmingPlanId: string) =>
      `/api/programming-plans/${programmingPlanId}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(programmingPlan1.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid programmingPlan id', async () => {
      await request(app)
        .get(`${testRoute(randomstring.generate())}`)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the programmingPlan does not exist', async () => {
      await request(app)
        .get(`${testRoute(uuidv4())}`)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should get the programmingPlan', async () => {
      const res = await request(app)
        .get(testRoute(programmingPlan1.id))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...programmingPlan1,
        createdAt: programmingPlan1.createdAt.toISOString(),
      });
    });
  });

  describe('GET /programming-plans', () => {
    const testRoute = '/api/programming-plans';

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should find all the programmingPlans', async () => {
      const res = await request(app)
        .get(testRoute)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        expect.arrayContaining([
          {
            ...programmingPlan1,
            createdAt: programmingPlan1.createdAt.toISOString(),
          },
          {
            ...programmingPlan2,
            createdAt: programmingPlan2.createdAt.toISOString(),
          },
        ])
      );
    });
  });
});
