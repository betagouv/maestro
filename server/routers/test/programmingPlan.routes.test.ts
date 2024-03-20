import { constants } from 'http2';
import randomstring from 'randomstring';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { User1, User2 } from '../../../database/seeds/test/001-users';
import { ProgrammingPlans } from '../../repositories/programmingPlanRepository';
import { createServer } from '../../server';
import { genProgrammingPlan } from '../../../shared/test/testFixtures';
import { withAccessToken } from '../../test/testUtils';


describe('ProgrammingPlan routes', () => {
  const { app } = createServer();

  const programmingPlan1 = genProgrammingPlan(User1.id);
  const programmingPlan2 = genProgrammingPlan(User2.id);

  beforeAll(async () => {
    await ProgrammingPlans().insert(programmingPlan1);
    await ProgrammingPlans().insert(programmingPlan2);
  });

  describe('GET /programming-plans/{programmingPlanId}', () => {
    const testRoute = (programmingPlanId: string) => `/api/programming-plans/${programmingPlanId}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(programmingPlan1.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid programmingPlan id', async () => {
      await withAccessToken(
        request(app).get(`${testRoute(randomstring.generate())}`)
      ).expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the programmingPlan does not exist', async () => {
      await withAccessToken(
        request(app).get(`${testRoute(uuidv4())}`),
        User1
      ).expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the programmingPlan does not belong to the user', async () => {
      await withAccessToken(
        request(app).get(`${testRoute(programmingPlan1.id)}`),
        User2
      ).expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should get the programmingPlan', async () => {
      const res = await withAccessToken(
        request(app).get(testRoute(programmingPlan1.id)),
      ).expect(constants.HTTP_STATUS_OK);

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
      const res = await withAccessToken(request(app).get(testRoute)).expect(
        constants.HTTP_STATUS_OK
      );

      expect(res.body).toMatchObject([
        {
          ...programmingPlan1,
          createdAt: programmingPlan1.createdAt.toISOString(),
        },
      ]);
    });
  });

});
