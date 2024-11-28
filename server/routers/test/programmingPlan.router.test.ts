import { constants } from 'http2';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import {
  NationalCoordinator,
  RegionalCoordinator,
  RegionalDromCoordinator,
  Sampler1Fixture,
  SamplerDromFixture
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

  const validatedDromProgrammingPlan = genProgrammingPlan({
    id: 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
    createdBy: NationalCoordinator.id,
    year: 2018,
    status: 'Submitted',
    statusDrom: 'Validated'
  });
  const validatedProgrammingPlan = genProgrammingPlan({
    id: 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1',
    createdBy: NationalCoordinator.id,
    year: 2019,
    status: 'Validated',
    statusDrom: 'Validated'
  });
  const submittedDromProgrammingPlan = genProgrammingPlan({
    id: 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
    createdBy: NationalCoordinator.id,
    year: 2021,
    status: 'Submitted',
    statusDrom: 'Submitted'
  });
  const inProgressProgrammingPlan = genProgrammingPlan({
    id: 'b3b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3',
    createdBy: NationalCoordinator.id,
    year: 2022,
    status: 'InProgress',
    statusDrom: 'InProgress'
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
      validatedDromProgrammingPlan,
      validatedProgrammingPlan,
      submittedDromProgrammingPlan,
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
        validatedDromProgrammingPlan.id,
        validatedProgrammingPlan.id,
        submittedDromProgrammingPlan.id,
        inProgressProgrammingPlan.id
      ])
      .delete();
    await ProgrammingPlans()
      .delete()
      .where('id', 'in', [
        validatedDromProgrammingPlan.id,
        validatedProgrammingPlan.id,
        submittedDromProgrammingPlan.id,
        inProgressProgrammingPlan.id
      ]);
  });

  const programmingPlansMatch = (programmingPlans: ProgrammingPlan[]) =>
    expect.arrayContaining(
      programmingPlans.map((programmingPlan) => ({
        ...programmingPlan,
        createdAt: programmingPlan.createdAt.toISOString()
      }))
    );

  const expectedBody = (body: any, programmingPlans: ProgrammingPlan[]) =>
    expect(body).toMatchObject(programmingPlansMatch(programmingPlans));

  const notExpectedBody = (body: any, programmingPlans: ProgrammingPlan[]) =>
    expect(body).not.toMatchObject(programmingPlansMatch(programmingPlans));

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

      expectedBody(res.body, [
        validatedDromProgrammingPlan,
        validatedProgrammingPlan,
        submittedDromProgrammingPlan,
        inProgressProgrammingPlan
      ]);
    });

    it('should find drom submitted and validated programming plans for a regional coordinator from drom', async () => {
      const res = await request(app)
        .get(testRoute())
        .use(tokenProvider(RegionalDromCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expectedBody(res.body, [
        validatedDromProgrammingPlan,
        validatedProgrammingPlan,
        submittedDromProgrammingPlan
      ]);
      notExpectedBody(res.body, [inProgressProgrammingPlan]);
    });

    it('should find validated programming plans for a regional coordinator outside drom', async () => {
      const res = await request(app)
        .get(testRoute())
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expectedBody(res.body, [
        validatedProgrammingPlan,
        submittedDromProgrammingPlan
      ]);
      notExpectedBody(res.body, [
        validatedDromProgrammingPlan,
        inProgressProgrammingPlan
      ]);
    });

    it('should find drom validated programming plans for a sampler from Drom', async () => {
      const res = await request(app)
        .get(testRoute())
        .use(tokenProvider(SamplerDromFixture))
        .expect(constants.HTTP_STATUS_OK);

      expectedBody(res.body, [
        validatedDromProgrammingPlan,
        validatedProgrammingPlan
      ]);
      notExpectedBody(res.body, [
        inProgressProgrammingPlan,
        submittedDromProgrammingPlan
      ]);
    });

    it('should find no programming plans for a sampler outside Drom', async () => {
      const res = await request(app)
        .get(testRoute())
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expectedBody(res.body, [validatedProgrammingPlan]);
      notExpectedBody(res.body, [
        validatedDromProgrammingPlan,
        inProgressProgrammingPlan,
        submittedDromProgrammingPlan
      ]);
    });

    it('should filter programming plans by status and user authorization', async () => {
      const res = await request(app)
        .get(testRoute({ status: 'Submitted' }))
        .use(tokenProvider(RegionalDromCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expectedBody(res.body, [submittedDromProgrammingPlan]);
      notExpectedBody(res.body, [
        validatedDromProgrammingPlan,
        validatedProgrammingPlan,
        inProgressProgrammingPlan
      ]);
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
      await badRequestTest(submittedDromProgrammingPlan, 'Submitted');
      await badRequestTest(submittedDromProgrammingPlan, 'InProgress');
      await badRequestTest(validatedProgrammingPlan, 'InProgress');
      await badRequestTest(validatedProgrammingPlan, 'Submitted');
      await badRequestTest(validatedProgrammingPlan, 'Validated');
    });

    it('should update a Submitted programming plan to Validated', async () => {
      const res = await request(app)
        .put(testRoute(submittedDromProgrammingPlan.id))
        .send(programmingPlanUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...submittedDromProgrammingPlan,
        status: 'Validated',
        createdAt: submittedDromProgrammingPlan.createdAt.toISOString()
      });

      await expect(
        ProgrammingPlans().where('id', submittedDromProgrammingPlan.id).first()
      ).resolves.toMatchObject({
        ...submittedDromProgrammingPlan,
        status: 'Validated'
      });

      //Cleanup
      await ProgrammingPlans()
        .where('id', submittedDromProgrammingPlan.id)
        .update({ status: 'Submitted' });
    });
  });
});
