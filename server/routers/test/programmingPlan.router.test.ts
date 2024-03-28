import { constants } from 'http2';
import randomstring from 'randomstring';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { genProgrammingPlan, genUser } from '../../../shared/test/testFixtures';
import { ProgrammingPlans } from '../../repositories/programmingPlanRepository';
import { Users } from '../../repositories/userRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('ProgrammingPlan router', () => {
  const { app } = createServer();

  const nationalCoordinator = genUser('NationalCoordinator');
  const regionalCoordinator = genUser('RegionalCoordinator');
  const sampler = genUser('Sampler');
  const programmingPlan1 = genProgrammingPlan(nationalCoordinator.id);
  const programmingPlan2 = genProgrammingPlan(nationalCoordinator.id);

  beforeAll(async () => {
    await Users().insert([nationalCoordinator, regionalCoordinator, sampler]);
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
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the programmingPlan does not exist', async () => {
      await request(app)
        .get(`${testRoute(uuidv4())}`)
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the user does not have the permission to read programmingPlans', async () => {
      await request(app)
        .get(testRoute(programmingPlan1.id))
        .use(tokenProvider(sampler))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should get the programmingPlan', async () => {
      const res = await request(app)
        .get(testRoute(programmingPlan1.id))
        .use(tokenProvider(nationalCoordinator))
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

    it('should fail if the user does not have the permission to read programmingPlans', async () => {
      await request(app)
        .get(testRoute)
        .use(tokenProvider(sampler))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should find all the programmingPlans', async () => {
      const res = await request(app)
        .get(testRoute)
        .use(tokenProvider(regionalCoordinator))
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
