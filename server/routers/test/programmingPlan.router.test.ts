import { constants } from 'http2';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import {
  NationalCoordinator,
  RegionalCoordinator,
  Sampler1Fixture
} from '../../../database/seeds/test/001-users';
import { ProgrammingPlan } from '../../../shared/schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingPlanStatus } from '../../../shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { genPrescription } from '../../../shared/test/prescriptionFixtures';
import { genProgrammingPlan } from '../../../shared/test/programmingPlanFixtures';
import { Prescriptions } from '../../repositories/prescriptionRepository';
import { ProgrammingPlans } from '../../repositories/programmingPlanRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';
describe('ProgrammingPlan router', () => {
  const { app } = createServer();

  const validatedProgrammingPlan = genProgrammingPlan({
    id: 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1',
    createdBy: NationalCoordinator.id,
    year: 2019,
    status: 'Validated'
  });
  const submittedProgrammingPlan = genProgrammingPlan({
    id: 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
    createdBy: NationalCoordinator.id,
    year: 2021,
    status: 'Submitted'
  });
  const inProgressProgrammingPlan = genProgrammingPlan({
    id: 'b3b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3',
    createdBy: NationalCoordinator.id,
    year: 2022,
    status: 'InProgress'
  });
  const controlPrescriptionValidatedPlan = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Control'
  });
  const surveillancePrescriptionValidatedPlan = genPrescription({
    programmingPlanId: validatedProgrammingPlan.id,
    context: 'Surveillance'
  });

  beforeAll(async () => {
    await ProgrammingPlans().insert([
      validatedProgrammingPlan,
      submittedProgrammingPlan,
      inProgressProgrammingPlan
    ]);
    await Prescriptions().insert([
      controlPrescriptionValidatedPlan,
      surveillancePrescriptionValidatedPlan
    ]);
  });

  afterAll(async () => {
    await Prescriptions()
      .whereIn('programmingPlanId', [
        validatedProgrammingPlan.id,
        submittedProgrammingPlan.id,
        inProgressProgrammingPlan.id
      ])
      .delete();
    await ProgrammingPlans()
      .delete()
      .where('id', 'in', [
        validatedProgrammingPlan.id,
        submittedProgrammingPlan.id,
        inProgressProgrammingPlan.id
      ]);
  });

  describe('GET /programming-plans', () => {
    const testRoute = (params?: Record<string, string>) =>
      `/api/programming-plans?${new URLSearchParams(params).toString()}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute())
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should find all the programmingPlans for the national coordinator', async () => {
      const res = await request(app)
        .get(testRoute())
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        expect.arrayContaining([
          {
            ...validatedProgrammingPlan,
            createdAt: validatedProgrammingPlan.createdAt.toISOString()
          },
          {
            ...submittedProgrammingPlan,
            createdAt: submittedProgrammingPlan.createdAt.toISOString()
          },
          {
            ...inProgressProgrammingPlan,
            createdAt: inProgressProgrammingPlan.createdAt.toISOString()
          }
        ])
      );
    });

    it('should find only submitted and validated programming plans for the regional coordinator', async () => {
      const res = await request(app)
        .get(testRoute())
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        expect.arrayContaining([
          {
            ...validatedProgrammingPlan,
            createdAt: validatedProgrammingPlan.createdAt.toISOString()
          },
          {
            ...submittedProgrammingPlan,
            createdAt: submittedProgrammingPlan.createdAt.toISOString()
          }
        ])
      );
      expect(res.body).not.toMatchObject(
        expect.arrayContaining([
          {
            ...inProgressProgrammingPlan,
            createdAt: inProgressProgrammingPlan.createdAt.toISOString()
          }
        ])
      );
    });

    it('should find only validated programming plans for the sampler', async () => {
      const res = await request(app)
        .get(testRoute())
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        expect.arrayContaining([
          {
            ...validatedProgrammingPlan,
            createdAt: validatedProgrammingPlan.createdAt.toISOString()
          }
        ])
      );
      expect(res.body).not.toMatchObject(
        expect.arrayContaining([
          {
            ...inProgressProgrammingPlan,
            createdAt: inProgressProgrammingPlan.createdAt.toISOString()
          },
          {
            ...submittedProgrammingPlan,
            createdAt: submittedProgrammingPlan.createdAt.toISOString()
          }
        ])
      );
    });

    it('should filter programming plans by status and user authorization', async () => {
      const res = await request(app)
        .get(testRoute({ status: 'Submitted' }))
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        expect.arrayContaining([
          {
            ...submittedProgrammingPlan,
            createdAt: submittedProgrammingPlan.createdAt.toISOString()
          }
        ])
      );
      expect(res.body).not.toMatchObject(
        expect.arrayContaining([
          {
            ...inProgressProgrammingPlan,
            createdAt: inProgressProgrammingPlan.createdAt.toISOString()
          },
          {
            ...validatedProgrammingPlan,
            createdAt: validatedProgrammingPlan.createdAt.toISOString()
          }
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
        .get(testRoute(validatedProgrammingPlan.year.toString()))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...validatedProgrammingPlan,
        createdAt: validatedProgrammingPlan.createdAt.toISOString()
      });
    });
  });

  describe('POST /programming-plans/:year', () => {
    const testRoute = (year: string) => `/api/programming-plans/${year}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute('2020'))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    //test user not authorize
    it('should fail if the user is not authorized', async () => {
      await request(app)
        .post(testRoute('2020'))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the previous programming plan does not exist', async () => {
      await request(app)
        .post(testRoute('2000'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the previous programming plan is not validated', async () => {
      await request(app)
        .post(testRoute('2023'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should create a new programming plan for the given year', async () => {
      const res = await request(app)
        .post(testRoute('2020'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject({
        year: 2020,
        status: 'InProgress'
      });

      await expect(
        ProgrammingPlans().where('year', 2020).first()
      ).resolves.toMatchObject({
        year: 2020,
        status: 'InProgress'
      });

      await expect(
        Prescriptions()
          .where('programmingPlanId', res.body.id)
          .andWhere('context', 'Control')
      ).resolves.toMatchObject(
        expect.arrayContaining([
          {
            id: expect.any(String),
            context: 'Control',
            programmingPlanId: res.body.id,
            matrix: controlPrescriptionValidatedPlan.matrix,
            stages: controlPrescriptionValidatedPlan.stages
          }
        ])
      );
      await expect(
        Prescriptions()
          .where('programmingPlanId', res.body.id)
          .andWhere('context', 'Surveillance')
      ).resolves.toMatchObject(
        expect.arrayContaining([
          {
            id: expect.any(String),
            context: 'Surveillance',
            programmingPlanId: res.body.id,
            matrix: surveillancePrescriptionValidatedPlan.matrix,
            stages: surveillancePrescriptionValidatedPlan.stages
          }
        ])
      );

      //TODO check substances duplication

      //Cleanup
      await Prescriptions()
        .where('programmingPlanId', res.body.id)
        .andWhere('context', 'Control')
        .delete();
      await Prescriptions()
        .where('programmingPlanId', res.body.id)
        .andWhere('context', 'Surveillance')
        .delete();
      await ProgrammingPlans().where('id', res.body.id).delete();
    });
  });

  describe('PUT /programming-plans/:year', () => {
    const programmingPlanUpdate = {
      status: 'Validated',
      isDrom: false
    };

    const testRoute = (programmingPlanId: string) =>
      `/api/programming-plans/${programmingPlanId}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute(validatedProgrammingPlan.id))
        .send(programmingPlanUpdate)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should fail if the user is not authorized', async () => {
      await request(app)
        .put(testRoute(validatedProgrammingPlan.id))
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
          .put(testRoute(validatedProgrammingPlan.id))
          .send({ ...programmingPlanUpdate, ...payload })
          .use(tokenProvider(NationalCoordinator))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest({
        ...programmingPlanUpdate,
        status: 'Invalid'
      });
      await badRequestTest({
        ...programmingPlanUpdate,
        isDrom: 'Invalid'
      });
    });

    it('should fail if the status update is forbidden', async () => {
      const badRequestTest = async (
        programmingPlan: ProgrammingPlan,
        status: ProgrammingPlanStatus
      ) =>
        request(app)
          .put(testRoute(programmingPlan.id))
          .send({ status })
          .use(tokenProvider(NationalCoordinator))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest(inProgressProgrammingPlan, 'InProgress');
      await badRequestTest(inProgressProgrammingPlan, 'Validated');
      await badRequestTest(submittedProgrammingPlan, 'Submitted');
      await badRequestTest(submittedProgrammingPlan, 'InProgress');
      await badRequestTest(validatedProgrammingPlan, 'InProgress');
      await badRequestTest(validatedProgrammingPlan, 'Submitted');
      await badRequestTest(validatedProgrammingPlan, 'Validated');
    });

    it('should update a Submitted programming plan to Validated', async () => {
      const res = await request(app)
        .put(testRoute(submittedProgrammingPlan.id))
        .send(programmingPlanUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...submittedProgrammingPlan,
        status: 'Validated',
        createdAt: submittedProgrammingPlan.createdAt.toISOString()
      });

      await expect(
        ProgrammingPlans().where('id', submittedProgrammingPlan.id).first()
      ).resolves.toMatchObject({
        ...submittedProgrammingPlan,
        status: 'Validated'
      });

      //Cleanup
      await ProgrammingPlans()
        .where('id', submittedProgrammingPlan.id)
        .update({ status: 'Submitted' });
    });
  });
});
