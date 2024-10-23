import { constants } from 'http2';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import {
  NationalCoordinator,
  Sampler1Fixture,
} from '../../../database/seeds/test/001-users';
import { genPrescriptions } from '../../../shared/test/prescriptionFixtures';
import { genProgrammingPlan } from '../../../shared/test/programmingPlanFixtures';
import { Prescriptions } from '../../repositories/prescriptionRepository';
import { ProgrammingPlans } from '../../repositories/programmingPlanRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';
describe('ProgrammingPlan router', () => {
  const { app } = createServer();

  const programmingPlan2020 = genProgrammingPlan({
    createdBy: NationalCoordinator.id,
    year: 2020,
    status: 'InProgress',
  });
  const programmingPlan2021 = genProgrammingPlan({
    createdBy: NationalCoordinator.id,
    year: 2021,
    status: 'Validated',
  });
  const controlPrescription2021 = genPrescriptions({
    programmingPlanId: programmingPlan2021.id,
    context: 'Control',
  });
  const surveillancePrescription2021 = genPrescriptions({
    programmingPlanId: programmingPlan2021.id,
    context: 'Surveillance',
  });

  beforeAll(async () => {
    await ProgrammingPlans().insert([programmingPlan2020, programmingPlan2021]);
    await Prescriptions().insert([
      ...controlPrescription2021,
      ...surveillancePrescription2021,
    ]);
  });

  afterAll(async () => {
    await Prescriptions()
      .whereIn('programmingPlanId', [
        programmingPlan2020.id,
        programmingPlan2021.id,
      ])
      .delete();
    await ProgrammingPlans()
      .delete()
      .where('id', 'in', [programmingPlan2020.id, programmingPlan2021.id]);
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
            ...programmingPlan2020,
            createdAt: programmingPlan2020.createdAt.toISOString(),
          },
          {
            ...programmingPlan2021,
            createdAt: programmingPlan2021.createdAt.toISOString(),
          },
        ])
      );
    });
  });

  describe('GET /programming-plans/:year', () => {
    const testRoute = (year: string) => `/api/programming-plans/${year}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute('2025'))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid year', async () => {
      await request(app)
        .get(testRoute('invalid'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the programmingPlan does not exist', async () => {
      await request(app)
        .get(testRoute('2025'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should find the programmingPlan for the given year', async () => {
      const res = await request(app)
        .get(testRoute('2020'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...programmingPlan2020,
        createdAt: programmingPlan2020.createdAt.toISOString(),
      });
    });
  });

  describe('POST /programming-plans/:year', () => {
    const testRoute = (year: string) => `/api/programming-plans/${year}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute('2025'))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    //test user not authorize
    it('should fail if the user is not authorized', async () => {
      await request(app)
        .post(testRoute('2025'))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the previous programming plan does not exist', async () => {
      await request(app)
        .post(testRoute('2023'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the previous programming plan is not validated', async () => {
      await request(app)
        .post(testRoute('2020'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should create a new programming plan for the given year', async () => {
      const res = await request(app)
        .post(testRoute('2022'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject({
        year: 2022,
        status: 'InProgress',
      });

      await expect(
        ProgrammingPlans().where('year', 2022).first()
      ).resolves.toMatchObject({
        year: 2022,
        status: 'InProgress',
      });

      await expect(
        Prescriptions()
          .where('programmingPlanId', res.body.id)
          .andWhere('context', 'Control')
      ).resolves.toHaveLength(controlPrescription2021.length);
      await expect(
        Prescriptions()
          .where('programmingPlanId', res.body.id)
          .andWhere('context', 'Surveillance')
      ).resolves.toHaveLength(surveillancePrescription2021.length);

      //Cleanup
      await Prescriptions()
        .where('programmingPlanId', res.body.id)
        .andWhere('context', 'Control')
        .delete();
      await Prescriptions()
        .where('programmingPlanId', res.body.id)
        .andWhere('context', 'Surveillance')
        .delete();
      await ProgrammingPlans().where('year', 2022).delete();
    });
  });

  describe('PUT /programming-plans/:year', () => {
    const programmingPlanUpdate = {
      status: 'Validated',
    };

    const testRoute = (programmingPlanId: string) =>
      `/api/programming-plans/${programmingPlanId}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute(programmingPlan2020.id))
        .send(programmingPlanUpdate)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should fail if the user is not authorized', async () => {
      await request(app)
        .put(testRoute(programmingPlan2020.id))
        .send(programmingPlanUpdate)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the programming plan does not exist', async () => {
      await request(app)
        .put(testRoute(uuidv4()))
        .send(programmingPlanUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .put(testRoute(programmingPlan2020.id))
          .send({ ...programmingPlanUpdate, ...payload })
          .use(tokenProvider(NationalCoordinator))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest({ status: undefined });
      await badRequestTest({ status: 'Invalid' });
    });

    it('should update the programming plan for the given year', async () => {
      const res = await request(app)
        .put(testRoute(programmingPlan2020.id))
        .send(programmingPlanUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...programmingPlan2020,
        status: 'Validated',
        createdAt: programmingPlan2020.createdAt.toISOString(),
      });

      await expect(
        ProgrammingPlans().where('year', 2020).first()
      ).resolves.toMatchObject({
        ...programmingPlan2020,
        status: 'Validated',
      });

      //Cleanup
      await ProgrammingPlans()
        .where('year', 2020)
        .update({ status: 'InProgress' });
    });
  });
});
