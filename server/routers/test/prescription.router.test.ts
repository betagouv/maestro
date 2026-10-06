import { constants } from 'node:http2';
import { fakerFR } from '@faker-js/faker';
import { RegionList } from 'maestro-shared/referential/Region';
import type { PrescriptionUpdate } from 'maestro-shared/schema/Prescription/Prescription';
import type { UserRefined } from 'maestro-shared/schema/User/User';
import {
  genPrescription,
  genPrescriptionSubstance
} from 'maestro-shared/test/prescriptionFixtures';
import {
  genProgrammingPlan,
  genProgrammingPlanDomain,
  genProgrammingSubPlan
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  AdminFixture,
  LaboratoryOfficeUserFixture,
  LaboratoryUserFixture,
  NationalCoordinator,
  NationalObserver,
  RegionalCoordinator,
  RegionalObserver,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { kysely } from '../../repositories/kysely';
import { LocalPrescriptionChanges } from '../../repositories/localPrescriptionChangeRepository';
import { LocalPrescriptions } from '../../repositories/localPrescriptionRepository';
import { PrescriptionChanges } from '../../repositories/prescriptionChangeRepository';
import { Prescriptions } from '../../repositories/prescriptionRepository';
import { PrescriptionSubstances } from '../../repositories/prescriptionSubstanceRepository';
import {
  formatProgrammingPlan,
  ProgrammingPlanLocalStatus,
  ProgrammingPlans
} from '../../repositories/programmingPlanRepository';
import { toProgrammingPlanSettingsRow } from '../../repositories/programmingPlanSettingsRow';
import { ProgrammingSubPlansRaw } from '../../repositories/programmingSubPlanRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Prescriptions router', () => {
  const { app } = createServer();

  const closedDomain = genProgrammingPlanDomain({ year: 1820 });
  const submittedDomain = genProgrammingPlanDomain({ year: 1821 });
  const inProgressDomain = genProgrammingPlanDomain({ year: 1822 });

  const programmingPlanClosed = genProgrammingPlan({
    createdBy: NationalCoordinator.id,
    domainId: closedDomain.id,
    regionalStatus: RegionList.map((region) => ({
      region,
      status: 'Closed'
    })),
    year: 1820
  });
  const programmingPlanSubmitted = genProgrammingPlan({
    createdBy: NationalCoordinator.id,
    domainId: submittedDomain.id,
    regionalStatus: RegionList.map((region) => ({
      region,
      status: 'SubmittedToRegion'
    })),
    year: 1821
  });
  const programmingPlanInProgress = genProgrammingPlan({
    createdBy: NationalCoordinator.id,
    domainId: inProgressDomain.id,
    regionalStatus: RegionList.map((region) => ({
      region,
      status: 'InProgress'
    })),
    year: 1822
  });
  const inProgressSurveillanceSubPlan = genProgrammingSubPlan({
    programmingPlanId: programmingPlanInProgress.id,
    subPlanNumber: 'TEST2',
    context: 'Surveillance'
  });
  const inProgressSubPlanWithoutPrescription = genProgrammingSubPlan({
    programmingPlanId: programmingPlanInProgress.id,
    subPlanNumber: 'TEST3'
  });
  const closedControlPrescription = genPrescription({
    programmingSubPlanId: programmingPlanClosed.subPlans[0].id
  });
  const submittedControlPrescription = genPrescription({
    programmingSubPlanId: programmingPlanSubmitted.subPlans[0].id
  });
  const inProgressControlPrescription = genPrescription({
    programmingSubPlanId: programmingPlanInProgress.subPlans[0].id
  });
  const inProgressControlPrescriptionSubstance = genPrescriptionSubstance({
    prescriptionId: inProgressControlPrescription.id,
    analysisMethod: 'Mono'
  });
  const inProgressSurveillancePrescription = genPrescription({
    programmingSubPlanId: inProgressSurveillanceSubPlan.id
  });

  beforeAll(async () => {
    await kysely
      .insertInto('programmingPlanDomains')
      .values([closedDomain, submittedDomain, inProgressDomain])
      .execute();
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
      ].flatMap((programmingPlan) => [
        {
          ...programmingPlan.nationalStatus,
          programmingPlanId: programmingPlan.id,
          region: 'None',
          department: 'None'
        },
        ...programmingPlan.regionalStatus.map((regionalStatus) => ({
          ...regionalStatus,
          programmingPlanId: programmingPlan.id
        }))
      ])
    );
    await ProgrammingSubPlansRaw().insert(
      [
        programmingPlanSubmitted,
        programmingPlanInProgress,
        programmingPlanClosed
      ]
        .flatMap((plan) =>
          plan.subPlans.map((sp) => ({
            ...toProgrammingPlanSettingsRow(sp),
            programmingPlanId: plan.id
          }))
        )
        .concat(
          [
            inProgressSurveillanceSubPlan,
            inProgressSubPlanWithoutPrescription
          ].map(toProgrammingPlanSettingsRow)
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
      .where('id', 'in', [
        closedControlPrescription.id,
        submittedControlPrescription.id,
        inProgressControlPrescription.id,
        inProgressSurveillancePrescription.id
      ]);
    await ProgrammingPlans()
      .delete()
      .where('id', 'in', [
        programmingPlanInProgress.id,
        programmingPlanSubmitted.id,
        programmingPlanClosed.id
      ]);
    await kysely
      .deleteFrom('programmingPlanDomains')
      .where('id', 'in', [
        closedDomain.id,
        submittedDomain.id,
        inProgressDomain.id
      ])
      .execute();
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

    test('hould export the prescriptions of the programmingPlan with Control context', async () => {
      await request(app)
        .get(testRoute(programmingPlanInProgress.id, 'Control'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);
    });
  });

  describe('POST /prescriptions', () => {
    const validBody = genPrescription({
      programmingSubPlanId: inProgressSubPlanWithoutPrescription.id
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
      await badRequestTest({ ...validBody, programmingSubPlanId: undefined });
      await badRequestTest({ ...validBody, programmingSubPlanId: uuidv4() });
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
      await forbiddenRequestTest(LaboratoryUserFixture);
      await forbiddenRequestTest(LaboratoryOfficeUserFixture);
    });

    test('should fail if the programming plan is closed', async () => {
      await request(app)
        .post(testRoute)
        .send({
          ...validBody,
          programmingSubPlanId: programmingPlanClosed.subPlans[0].id
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

      const changes = await LocalPrescriptionChanges().where({
        prescriptionId: res.body.id
      });
      expect(changes).toHaveLength(RegionList.length);
      expect(
        changes.every(
          (change) =>
            change.previousSampleCount === null &&
            change.changesViewedAt === null
        )
      ).toBe(true);

      //Cleanup
      await Prescriptions().where({ id: res.body.id }).delete();
    });
  });

  describe('PUT /prescriptions/{prescriptionId}', () => {
    const prescriptionUpdate: PrescriptionUpdate = {
      programmingPlanId: programmingPlanInProgress.id,
      sampleCount: 42
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
      await forbiddenRequestTest(LaboratoryUserFixture);
      await forbiddenRequestTest(LaboratoryOfficeUserFixture);
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
        sampleCount: 42
      });

      await expect(
        PrescriptionChanges()
          .where({ prescriptionId: inProgressControlPrescription.id })
          .first()
      ).resolves.toMatchObject({
        sampleCount: 42,
        previousSampleCount: inProgressControlPrescription.sampleCount
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
      await forbiddenRequestTest(LaboratoryUserFixture);
      await forbiddenRequestTest(LaboratoryOfficeUserFixture);
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
