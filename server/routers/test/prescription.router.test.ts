import { constants } from 'http2';
import randomstring from 'randomstring';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import {
  NationalCoordinator,
  RegionalCoordinator,
  Sampler1Fixture,
} from '../../../database/seeds/test/001-users';
import { MatrixList } from '../../../shared/referential/Matrix/Matrix';
import { StageList } from '../../../shared/referential/Stage';
import { PrescriptionUpdate } from '../../../shared/schema/Prescription/Prescription';
import { ProgrammingPlanStatus } from '../../../shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { genPrescription } from '../../../shared/test/prescriptionFixtures';
import { genProgrammingPlan } from '../../../shared/test/programmingPlanFixtures';
import { oneOf } from '../../../shared/test/testFixtures';
import { Prescriptions } from '../../repositories/prescriptionRepository';
import { ProgrammingPlans } from '../../repositories/programmingPlanRepository';
import { RegionalPrescriptions } from '../../repositories/regionalPrescriptionRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';
describe('Prescriptions router', () => {
  const { app } = createServer();

  const programmingPlanValidated = genProgrammingPlan({
    createdBy: NationalCoordinator.id,
    status: 'Validated' as ProgrammingPlanStatus,
    year: 2020,
  });
  const programmingPlanSubmitted = genProgrammingPlan({
    createdBy: NationalCoordinator.id,
    status: 'Submitted' as ProgrammingPlanStatus,
    year: 2021,
  });
  const programmingPlanInProgress = genProgrammingPlan({
    createdBy: NationalCoordinator.id,
    status: 'InProgress' as ProgrammingPlanStatus,
    year: 2022,
  });
  const validatedControlPrescription = genPrescription({
    programmingPlanId: programmingPlanValidated.id,
    context: 'Control',
    matrix: oneOf(MatrixList),
    stages: [oneOf(StageList)],
  });
  const submittedControlPrescription = genPrescription({
    programmingPlanId: programmingPlanSubmitted.id,
    context: 'Control',
    matrix: oneOf(MatrixList),
    stages: [oneOf(StageList)],
  });
  const inProgressControlPrescription = genPrescription({
    programmingPlanId: programmingPlanInProgress.id,
    context: 'Control',
    matrix: oneOf(MatrixList),
    stages: [oneOf(StageList)],
  });
  const inProgressSurveillancePrescription = genPrescription({
    programmingPlanId: programmingPlanInProgress.id,
    context: 'Surveillance',
    matrix: oneOf(MatrixList),
    stages: [oneOf(StageList)],
  });

  beforeAll(async () => {
    await ProgrammingPlans().insert([
      programmingPlanValidated,
      programmingPlanSubmitted,
      programmingPlanInProgress,
    ]);
    await Prescriptions().insert([
      submittedControlPrescription,
      validatedControlPrescription,
      inProgressControlPrescription,
      inProgressSurveillancePrescription,
    ]);
  });

  afterAll(async () => {
    await Prescriptions()
      .delete()
      .where('programmingPlanId', 'in', [
        programmingPlanInProgress.id,
        programmingPlanSubmitted.id,
        programmingPlanValidated.id,
      ]);
    await ProgrammingPlans()
      .delete()
      .where('id', 'in', [
        programmingPlanInProgress.id,
        programmingPlanSubmitted.id,
        programmingPlanValidated.id,
      ]);
  });

  describe('GET /prescriptions', () => {
    const testRoute = '/api/prescriptions';

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute)
        .query({
          programmingPlanId: programmingPlanInProgress.id,
          context: 'Control',
        })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid programmingPlan id', async () => {
      await request(app)
        .get(testRoute)
        .query({
          programmingPlanId: randomstring.generate(),
          context: 'Control',
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should get a valid context', async () => {
      await request(app)
        .get(testRoute)
        .query({
          programmingPlanId: programmingPlanInProgress.id,
          context: 'invalid',
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should find all the prescriptions of the programmingPlan with Control context', async () => {
      const res = await request(app)
        .get(testRoute)
        .query({
          programmingPlanId: programmingPlanInProgress.id,
          context: 'Control',
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual([inProgressControlPrescription]);
      expect(res.body).not.toMatchObject([inProgressSurveillancePrescription]);
      expect(res.body).not.toMatchObject([validatedControlPrescription]);
    });
  });

  describe('GET /prescriptions/export', () => {
    const testRoute = (programmingPlanId: string, context: string) =>
      `/api/prescriptions/export?programmingPlanId=${programmingPlanId}&context=${context}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(programmingPlanInProgress.id, 'Control'))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid programmingPlan id', async () => {
      await request(app)
        .get(`${testRoute(randomstring.generate(), 'Control')}`)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should get a valid context', async () => {
      await request(app)
        .get(testRoute(programmingPlanInProgress.id, 'invalid'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should export the prescriptions of the programmingPlan with Control context', async () => {
      await request(app)
        .get(testRoute(programmingPlanInProgress.id, 'Control'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);
    });
  });

  describe('POST /prescriptions', () => {
    const validBody = genPrescription({
      programmingPlanId: programmingPlanInProgress.id,
      context: 'Control',
    });
    const testRoute = '/api/prescriptions';

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .send(validBody)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .post(testRoute)
          .send(payload)
          .use(tokenProvider(NationalCoordinator))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest({ ...validBody, programmingPlanId: undefined });
      await badRequestTest({
        ...validBody,
        programmingPlanId: randomstring.generate(),
      });
      await badRequestTest({ ...validBody, context: undefined });
      await badRequestTest({ ...validBody, context: 'invalid' });
      await badRequestTest({ ...validBody, matrix: undefined });
      await badRequestTest({ ...validBody, matrix: 'invalid' });
      await badRequestTest({ ...validBody, stages: undefined });
      await badRequestTest({ ...validBody, stages: 'invalid' });
    });

    it('should fail if the user does not have the permission to create prescriptions', async () => {
      await request(app)
        .post(testRoute)
        .send(validBody)
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the programming plan is validated', async () => {
      await request(app)
        .post(testRoute)
        .send({
          ...validBody,
          programmingPlanId: programmingPlanValidated.id,
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should create the prescription and regional prescriptions', async () => {
      const res = await request(app)
        .post(testRoute)
        .send(validBody)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject({
        ...validBody,
        id: expect.any(String),
      });

      await expect(
        Prescriptions().where({ id: res.body.id }).first()
      ).resolves.toMatchObject({
        ...validBody,
        id: res.body.id,
      });

      await expect(
        RegionalPrescriptions()
          .where({ prescriptionId: res.body.id })
          .count()
          .first()
      ).resolves.toMatchObject({ count: '18' });

      //Cleanup
      await Prescriptions().where({ id: res.body.id }).delete();
    });
  });

  describe('PUT /prescriptions/{prescriptionId}', () => {
    const prescriptionUpdate: PrescriptionUpdate = {
      programmingPlanId: programmingPlanInProgress.id,
      stages: [oneOf(StageList)],
    };
    const testRoute = (
      prescriptionId: string = inProgressControlPrescription.id
    ) => `/api/prescriptions/${prescriptionId}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute())
        .send(prescriptionUpdate)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should receive valid programmingPlanId and prescriptionId', async () => {
      await request(app)
        .put(testRoute())
        .send({
          ...prescriptionUpdate,
          programmingPlanId: randomstring.generate(),
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await request(app)
        .put(testRoute(randomstring.generate()))
        .send(prescriptionUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the prescription does not exist', async () => {
      await request(app)
        .put(testRoute(uuidv4()))
        .send(prescriptionUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the prescription does not belong to the programmingPlan', async () => {
      await request(app)
        .put(testRoute())
        .send({
          ...prescriptionUpdate,
          programmingPlanId: programmingPlanValidated.id,
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the user does not have the permission to update prescriptions', async () => {
      await request(app)
        .put(testRoute())
        .send(prescriptionUpdate)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the programming plan is validated', async () => {
      await request(app)
        .put(testRoute())
        .send({
          ...prescriptionUpdate,
          programmingPlanId: programmingPlanValidated.id,
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should update the stages of the prescription', async () => {
      const res = await request(app)
        .put(testRoute())
        .send(prescriptionUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...inProgressControlPrescription,
        stages: prescriptionUpdate.stages,
      });

      await expect(
        Prescriptions().where({ id: inProgressControlPrescription.id }).first()
      ).resolves.toMatchObject({
        ...inProgressControlPrescription,
        stages: prescriptionUpdate.stages,
      });
    });
  });

  describe('DELETE /prescriptions', () => {
    const testRoute = (prescriptionId: string) =>
      `/api/prescriptions/${prescriptionId}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .delete(testRoute(inProgressControlPrescription.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should fail if the prescription does not exist', async () => {
      await request(app)
        .delete(testRoute(uuidv4()))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the user does not have the permission to delete prescriptions', async () => {
      await request(app)
        .delete(testRoute(inProgressControlPrescription.id))
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the programming plan is validated', async () => {
      await request(app)
        .delete(testRoute(validatedControlPrescription.id))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should delete the prescription', async () => {
      await request(app)
        .delete(testRoute(inProgressControlPrescription.id))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      await expect(
        Prescriptions().where({ id: inProgressControlPrescription.id }).first()
      ).resolves.toBeUndefined();

      await expect(
        RegionalPrescriptions()
          .where({ prescriptionId: inProgressControlPrescription.id })
          .count()
          .first()
      ).resolves.toMatchObject({ count: '0' });
    });
  });
});
