import { fakerFR } from '@faker-js/faker';
import { constants } from 'http2';
import { MatrixKindEffective } from 'maestro-shared/referential/Matrix/MatrixKind';
import { RegionList } from 'maestro-shared/referential/Region';
import { PrescriptionUpdate } from 'maestro-shared/schema/Prescription/Prescription';
import { UserRefined } from 'maestro-shared/schema/User/User';
import {
  genPrescription,
  genPrescriptionSubstance
} from 'maestro-shared/test/prescriptionFixtures';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import { oneOf } from 'maestro-shared/test/testFixtures';
import {
  AdminFixture,
  NationalCoordinator,
  NationalObserver,
  RegionalCoordinator,
  RegionalObserver,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { LocalPrescriptions } from '../../repositories/localPrescriptionRepository';
import { Prescriptions } from '../../repositories/prescriptionRepository';
import { PrescriptionSubstances } from '../../repositories/prescriptionSubstanceRepository';
import {
  formatProgrammingPlan,
  ProgrammingPlanLocalStatus,
  ProgrammingPlans
} from '../../repositories/programmingPlanRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';
describe('Prescriptions router', () => {
  const { app } = createServer();

  const programmingPlanClosed = genProgrammingPlan({
    createdBy: NationalCoordinator.id,
    regionalStatus: RegionList.map((region) => ({
      region,
      status: 'Closed'
    })),
    year: 1820
  });
  const programmingPlanSubmitted = genProgrammingPlan({
    createdBy: NationalCoordinator.id,
    regionalStatus: RegionList.map((region) => ({
      region,
      status: 'SubmittedToRegion'
    })),
    year: 1821
  });
  const programmingPlanInProgress = genProgrammingPlan({
    createdBy: NationalCoordinator.id,
    regionalStatus: RegionList.map((region) => ({
      region,
      status: 'InProgress'
    })),
    year: 1822
  });
  const closedControlPrescription = genPrescription({
    programmingPlanId: programmingPlanClosed.id,
    context: 'Control',
    matrixKind: oneOf(MatrixKindEffective.options),
    stages: ['STADE1']
  });
  const submittedControlPrescription = genPrescription({
    programmingPlanId: programmingPlanSubmitted.id,
    context: 'Control',
    matrixKind: oneOf(MatrixKindEffective.options),
    stages: ['STADE2']
  });
  const inProgressControlPrescription = genPrescription({
    programmingPlanId: programmingPlanInProgress.id,
    context: 'Control',
    matrixKind: oneOf(MatrixKindEffective.options),
    stages: ['STADE3', 'STADE4']
  });
  const inProgressControlPrescriptionSubstance = genPrescriptionSubstance({
    prescriptionId: inProgressControlPrescription.id,
    analysisMethod: 'Mono'
  });
  const inProgressSurveillancePrescription = genPrescription({
    programmingPlanId: programmingPlanInProgress.id,
    context: 'Surveillance',
    matrixKind: oneOf(MatrixKindEffective.options),
    stages: ['STADE5', 'STADE6', 'STADE8']
  });

  beforeAll(async () => {
    await ProgrammingPlans().insert(
      [
        programmingPlanSubmitted,
        programmingPlanInProgress,
        programmingPlanClosed
      ].map(formatProgrammingPlan)
    );
    await ProgrammingPlanLocalStatus().insert(
      [
        programmingPlanSubmitted,
        programmingPlanInProgress,
        programmingPlanClosed
      ].flatMap((programmingPlan) =>
        programmingPlan.regionalStatus.map((regionalStatus) => ({
          ...regionalStatus,
          programmingPlanId: programmingPlan.id
        }))
      )
    );
    await Prescriptions().insert([
      closedControlPrescription,
      submittedControlPrescription,
      inProgressControlPrescription,
      inProgressSurveillancePrescription
    ]);
    await PrescriptionSubstances().insert(
      inProgressControlPrescriptionSubstance
    );
  });

  afterAll(async () => {
    await Prescriptions()
      .delete()
      .where('programmingPlanId', 'in', [
        programmingPlanInProgress.id,
        programmingPlanSubmitted.id,
        programmingPlanClosed.id
      ]);
    await ProgrammingPlans()
      .delete()
      .where('id', 'in', [
        programmingPlanInProgress.id,
        programmingPlanSubmitted.id,
        programmingPlanClosed.id
      ]);
  });

  describe('GET /prescriptions', () => {
    const testRoute = '/api/prescriptions';

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute)
        .query({
          programmingPlanId: programmingPlanInProgress.id,
          contexts: 'Control'
        })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid programmingPlan id', async () => {
      await request(app)
        .get(testRoute)
        .query({
          programmingPlanId: fakerFR.string.alphanumeric(32),
          contexts: 'Control'
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should get a valid context', async () => {
      await request(app)
        .get(testRoute)
        .query({
          programmingPlanId: programmingPlanInProgress.id,
          contexts: 'invalid'
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should find all the prescriptions of the programmingPlan with Control context', async () => {
      const res = await request(app)
        .get(testRoute)
        .query({
          programmingPlanId: programmingPlanInProgress.id,
          contexts: 'Control'
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual([inProgressControlPrescription]);
      expect(res.body).not.toMatchObject([inProgressSurveillancePrescription]);
    });

    test('should retrieve the prescription substances count if requested', async () => {
      const res = await request(app)
        .get(testRoute)
        .query({
          programmingPlanId: programmingPlanInProgress.id,
          contexts: 'Control',
          includes: ['substanceCount']
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual([
        {
          ...inProgressControlPrescription,
          monoAnalysisCount: 1,
          multiAnalysisCount: 0
        }
      ]);
    });
  });

  describe('GET /prescriptions/export', () => {
    const testRoute = (programmingPlanId: string, contexts: string) =>
      `/api/prescriptions/export?programmingPlanId=${programmingPlanId}&contexts=${contexts}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(programmingPlanInProgress.id, 'Control'))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid programmingPlan id', async () => {
      await request(app)
        .get(`${testRoute(fakerFR.string.alphanumeric(32), 'Control')}`)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should get a valid context', async () => {
      await request(app)
        .get(testRoute(programmingPlanInProgress.id, 'invalid'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should export the prescriptions of the programmingPlan with Control context', async () => {
      await request(app)
        .get(testRoute(programmingPlanInProgress.id, 'Control'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);
    });
  });

  describe('POST /prescriptions', () => {
    const validBody = genPrescription({
      programmingPlanId: programmingPlanInProgress.id,
      context: 'Control'
    });
    const testRoute = '/api/prescriptions';

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .send(validBody)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid body', async () => {
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
        programmingPlanId: fakerFR.string.alphanumeric(32)
      });
      await badRequestTest({ ...validBody, context: undefined });
      await badRequestTest({ ...validBody, context: 'invalid' });
      await badRequestTest({ ...validBody, matrixKind: undefined });
      await badRequestTest({ ...validBody, matrixKind: 'invalid' });
      await badRequestTest({ ...validBody, stages: undefined });
      await badRequestTest({ ...validBody, stages: 'invalid' });
    });

    test('should fail if the user does not have the permission to create prescriptions', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .post(testRoute)
          .send(validBody)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(RegionalCoordinator);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(AdminFixture);
    });

    test('should fail if the programming plan is closed', async () => {
      await request(app)
        .post(testRoute)
        .send({
          ...validBody,
          programmingPlanId: programmingPlanClosed.id
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should create the prescription and local prescriptions', async () => {
      const res = await request(app)
        .post(testRoute)
        .send(validBody)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject({
        ...validBody,
        id: expect.any(String)
      });

      await expect(
        Prescriptions().where({ id: res.body.id }).first()
      ).resolves.toMatchObject({
        ...validBody,
        id: res.body.id
      });

      await expect(
        LocalPrescriptions()
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
      stages: ['STADE7'],
      notes: fakerFR.string.alphanumeric(32),
      programmingInstruction: fakerFR.string.alphanumeric(32)
    };
    const testRoute = (
      prescriptionId: string = inProgressControlPrescription.id
    ) => `/api/prescriptions/${prescriptionId}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute())
        .send(prescriptionUpdate)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should receive valid programmingPlanId and prescriptionId', async () => {
      await request(app)
        .put(testRoute())
        .send({
          ...prescriptionUpdate,
          programmingPlanId: fakerFR.string.alphanumeric(32)
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await request(app)
        .put(testRoute(fakerFR.string.alphanumeric(32)))
        .send(prescriptionUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the prescription does not exist', async () => {
      await request(app)
        .put(testRoute(uuidv4()))
        .send(prescriptionUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should fail if the prescription does not belong to the programmingPlan', async () => {
      await request(app)
        .put(testRoute())
        .send({
          ...prescriptionUpdate,
          programmingPlanId: programmingPlanSubmitted.id
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the user does not have the permission to update prescriptions', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .put(testRoute())
          .send(prescriptionUpdate)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(RegionalCoordinator);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(AdminFixture);
    });

    test('should fail if the programming plan is closed', async () => {
      await request(app)
        .put(testRoute(closedControlPrescription.id))
        .send({
          ...prescriptionUpdate,
          programmingPlanId: programmingPlanClosed.id
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should update the prescription', async () => {
      const res = await request(app)
        .put(testRoute())
        .send(prescriptionUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...inProgressControlPrescription,
        stages: prescriptionUpdate.stages,
        notes: prescriptionUpdate.notes,
        programmingInstruction: prescriptionUpdate.programmingInstruction
      });

      await expect(
        Prescriptions().where({ id: inProgressControlPrescription.id }).first()
      ).resolves.toMatchObject({
        ...inProgressControlPrescription,
        stages: prescriptionUpdate.stages,
        notes: prescriptionUpdate.notes,
        programmingInstruction: prescriptionUpdate.programmingInstruction
      });
    });
  });

  describe('GET /prescriptions/{prescriptionId}/substances', () => {
    const testRoute = (prescriptionId: string) =>
      `/api/prescriptions/${prescriptionId}/substances`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(inProgressControlPrescription.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the prescription does not exist', async () => {
      await request(app)
        .get(testRoute(uuidv4()))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should retrieve the prescription substances', async () => {
      const res = await request(app)
        .get(testRoute(inProgressControlPrescription.id))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual([inProgressControlPrescriptionSubstance]);
    });
  });

  describe('DELETE /prescriptions', () => {
    const testRoute = (prescriptionId: string) =>
      `/api/prescriptions/${prescriptionId}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .delete(testRoute(inProgressControlPrescription.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the prescription does not exist', async () => {
      await request(app)
        .delete(testRoute(uuidv4()))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should fail if the user does not have the permission to delete prescriptions', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .delete(testRoute(inProgressControlPrescription.id))
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(RegionalCoordinator);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(AdminFixture);
    });

    test('should fail if the programming plan is closed', async () => {
      await request(app)
        .delete(testRoute(closedControlPrescription.id))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should delete the prescription', async () => {
      await request(app)
        .delete(testRoute(inProgressControlPrescription.id))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      await expect(
        Prescriptions().where({ id: inProgressControlPrescription.id }).first()
      ).resolves.toBeUndefined();

      await expect(
        LocalPrescriptions()
          .where({ prescriptionId: inProgressControlPrescription.id })
          .count()
          .first()
      ).resolves.toMatchObject({ count: '0' });
    });
  });
});
