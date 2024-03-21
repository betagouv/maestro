import { constants } from 'http2';
import randomstring from 'randomstring';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import {
  genNumber,
  genPrescriptions,
  genProgrammingPlan,
  genUserApi,
} from '../../../shared/test/testFixtures';
import { Prescriptions } from '../../repositories/prescriptionRepository';
import { ProgrammingPlans } from '../../repositories/programmingPlanRepository';
import { Users } from '../../repositories/userRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Prescriptions routes', () => {
  const { app } = createServer();

  const user = genUserApi();
  const programmingPlan1 = genProgrammingPlan(user.id);
  const programmingPlan2 = genProgrammingPlan(user.id);
  const prescriptions1 = genPrescriptions(programmingPlan1.id);
  const prescriptions2 = genPrescriptions(programmingPlan2.id);

  beforeAll(async () => {
    await Users().insert(user);
    await ProgrammingPlans().insert([programmingPlan1, programmingPlan2]);
    await Prescriptions().insert(prescriptions1);
    await Prescriptions().insert(prescriptions2);
  });

  describe('GET /programming-plans/{programmingPlanId}/prescriptions', () => {
    const testRoute = (programmingPlanId: string) =>
      `/api/programming-plans/${programmingPlanId}/prescriptions`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(programmingPlan1.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid programmingPlan id', async () => {
      await request(app)
        .get(`${testRoute(randomstring.generate())}`)
        .use(tokenProvider(user))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should find the prescriptions of the programmingPlan', async () => {
      const res = await request(app)
        .get(testRoute(programmingPlan1.id))
        .use(tokenProvider(user))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(expect.arrayContaining(prescriptions1));
      expect(res.body).not.toMatchObject(
        expect.arrayContaining(prescriptions2)
      );
    });
  });

  describe('PUT /programming-plans/{programmingPlanId}/prescriptions/{prescriptionId}', () => {
    const prescriptionUpdate = {
      sampleCount: genNumber(4),
    };
    const testRoute = (programmingPlanId: string, prescriptionId: string) =>
      `/api/programming-plans/${programmingPlanId}/prescriptions/${prescriptionId}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute(programmingPlan1.id, prescriptions1[0].id))
        .send(prescriptionUpdate)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should receive valid programmingPlanId and prescriptionId', async () => {
      await request(app)
        .put(testRoute(randomstring.generate(), prescriptions1[0].id))
        .send(prescriptionUpdate)
        .use(tokenProvider(user))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await request(app)
        .put(testRoute(programmingPlan1.id, randomstring.generate()))
        .send(prescriptionUpdate)
        .use(tokenProvider(user))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the prescription does not exist', async () => {
      await request(app)
        .put(testRoute(programmingPlan1.id, uuidv4()))
        .send(prescriptionUpdate)
        .use(tokenProvider(user))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the prescription does not belong to the programmingPlan', async () => {
      await request(app)
        .put(testRoute(programmingPlan1.id, prescriptions2[0].id))
        .send(prescriptions2[0])
        .use(tokenProvider(user))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should update the sample count of the prescription', async () => {
      const res = await request(app)
        .put(testRoute(programmingPlan1.id, prescriptions1[0].id))
        .send(prescriptionUpdate)
        .use(tokenProvider(user))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...prescriptions1[0],
        sampleCount: prescriptionUpdate.sampleCount,
      });
    });
  });
});
