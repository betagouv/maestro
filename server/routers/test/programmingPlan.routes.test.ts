import { constants } from 'http2';
import randomstring from 'randomstring';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import {
  genProgrammingPlan,
  genUserApi,
} from '../../../shared/test/testFixtures';
import { ProgrammingPlans } from '../../repositories/programmingPlanRepository';
import { Users } from '../../repositories/userRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('ProgrammingPlan routes', () => {
  const { app } = createServer();

  const user1 = genUserApi();
  const user2 = genUserApi();
  const programmingPlan1 = genProgrammingPlan(user1.id);
  const programmingPlan2 = genProgrammingPlan(user2.id);

  beforeAll(async () => {
    await Users().insert(user1);
    await Users().insert(user2);
    await ProgrammingPlans().insert(programmingPlan1);
    await ProgrammingPlans().insert(programmingPlan2);
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
        .use(tokenProvider(user1))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the programmingPlan does not exist', async () => {
      await request(app)
        .get(`${testRoute(uuidv4())}`)
        .use(tokenProvider(user1))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the programmingPlan does not belong to the user', async () => {
      await request(app)
        .get(`${testRoute(programmingPlan1.id)}`)
        .use(tokenProvider(user2))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should get the programmingPlan', async () => {
      const res = await request(app)
        .get(testRoute(programmingPlan1.id))
        .use(tokenProvider(user1))
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

    it('should find the programmingPlans of the authenticated user', async () => {
      const res = await request(app)
        .get(testRoute)
        .use(tokenProvider(user1))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject([
        {
          ...programmingPlan1,
          createdAt: programmingPlan1.createdAt.toISOString(),
        },
      ]);
    });
  });
});
