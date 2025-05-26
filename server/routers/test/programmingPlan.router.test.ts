import { constants } from 'http2';
import {
  isDromRegion,
  Region,
  RegionList
} from 'maestro-shared/referential/Region';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingPlanStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { genPrescription } from 'maestro-shared/test/prescriptionFixtures';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import { oneOf } from 'maestro-shared/test/testFixtures';
import {
  NationalCoordinator,
  RegionalCoordinator,
  RegionalDromCoordinator,
  Sampler1Fixture,
  SamplerDromFixture
} from 'maestro-shared/test/userFixtures';
import { withISOStringDates } from 'maestro-shared/utils/utils';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { Prescriptions } from '../../repositories/prescriptionRepository';
import {
  formatProgrammingPlan,
  ProgrammingPlanRegionalStatus,
  ProgrammingPlans
} from '../../repositories/programmingPlanRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';
describe('ProgrammingPlan router', () => {
  const { app } = createServer();

  const validatedDromProgrammingPlan = genProgrammingPlan({
    id: 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
    createdBy: NationalCoordinator.id,
    year: 2018,
    regionalStatus: RegionList.map((region) => ({
      region,
      status: isDromRegion(region) ? 'Validated' : 'Submitted'
    }))
  });
  const validatedProgrammingPlan = genProgrammingPlan({
    id: 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1',
    createdBy: NationalCoordinator.id,
    year: 2019,
    regionalStatus: RegionList.toSorted().map((region) => ({
      region,
      status: 'Validated'
    }))
  });
  const submittedProgrammingPlan = genProgrammingPlan({
    id: 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
    createdBy: NationalCoordinator.id,
    year: 2021,
    regionalStatus: RegionList.map((region) => ({
      region,
      status: 'Submitted'
    }))
  });
  const inProgressProgrammingPlan = genProgrammingPlan({
    id: 'b3b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3',
    createdBy: NationalCoordinator.id,
    year: 2022,
    regionalStatus: RegionList.map((region) => ({
      region,
      status: 'InProgress'
    }))
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
    await ProgrammingPlans().insert(
      [
        validatedDromProgrammingPlan,
        validatedProgrammingPlan,
        submittedProgrammingPlan,
        inProgressProgrammingPlan
      ].map(formatProgrammingPlan)
    );
    await ProgrammingPlanRegionalStatus().insert(
      [
        validatedDromProgrammingPlan,
        validatedProgrammingPlan,
        submittedProgrammingPlan,
        inProgressProgrammingPlan
      ].flatMap((programmingPlan) =>
        programmingPlan.regionalStatus.map((regionalStatus) => ({
          ...regionalStatus,
          programmingPlanId: programmingPlan.id
        }))
      )
    );
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
        submittedProgrammingPlan.id,
        inProgressProgrammingPlan.id
      ])
      .delete();
    await ProgrammingPlans()
      .delete()
      .where('id', 'in', [
        validatedDromProgrammingPlan.id,
        validatedProgrammingPlan.id,
        submittedProgrammingPlan.id,
        inProgressProgrammingPlan.id
      ]);
  });

  const programmingPlansMatch = (programmingPlans: ProgrammingPlan[]) =>
    expect.arrayContaining(
      programmingPlans.map((programmingPlan) =>
        withISOStringDates({
          ...programmingPlan,
          regionalStatus: expect.arrayContaining(programmingPlan.regionalStatus)
        })
      )
    );

  const expectedBody = (
    body: any,
    programmingPlans: ProgrammingPlan[],
    region?: Region | null
  ) => {
    const regionalProgrammingPlans = programmingPlans.map(
      (programmingPlan) => ({
        ...programmingPlan,
        regionalStatus: programmingPlan.regionalStatus.filter(
          (regionalStatus) => (region ? regionalStatus.region === region : true)
        )
      })
    );
    expect(withISOStringDates(body)).toMatchObject(
      programmingPlansMatch(regionalProgrammingPlans)
    );
  };

  const notExpectedBody = (
    body: any,
    programmingPlans: ProgrammingPlan[],
    region?: Region | null
  ) => {
    const regionalProgrammingPlans = programmingPlans.map(
      (programmingPlan) => ({
        ...programmingPlan,
        regionalStatus: programmingPlan.regionalStatus.filter(
          (regionalStatus) => (region ? regionalStatus.region === region : true)
        )
      })
    );
    expect(body).not.toMatchObject(
      programmingPlansMatch(regionalProgrammingPlans)
    );
  };

  describe('GET /programming-plans', () => {
    const testRoute = (params?: Record<string, string>) =>
      `/api/programming-plans?${new URLSearchParams(params).toString()}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute())
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should find all the programmingPlans for the national coordinator', async () => {
      const res = await request(app)
        .get(testRoute())
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expectedBody(res.body, [
        validatedDromProgrammingPlan,
        validatedProgrammingPlan,
        submittedProgrammingPlan,
        inProgressProgrammingPlan
      ]);
    });

    test('should find regional submitted and validated programming plans for a regional coordinator', async () => {
      const res1 = await request(app)
        .get(testRoute())
        .use(tokenProvider(RegionalDromCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expectedBody(
        res1.body,
        [
          validatedDromProgrammingPlan,
          validatedProgrammingPlan,
          submittedProgrammingPlan
        ],
        RegionalDromCoordinator.region
      );
      notExpectedBody(
        res1.body,
        [inProgressProgrammingPlan],
        RegionalDromCoordinator.region
      );

      const res2 = await request(app)
        .get(testRoute())
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expectedBody(
        res2.body,
        [validatedProgrammingPlan, submittedProgrammingPlan],
        RegionalCoordinator.region
      );
      notExpectedBody(
        res2.body,
        [validatedDromProgrammingPlan, inProgressProgrammingPlan],
        RegionalCoordinator.region
      );
    });

    test('should find regional validated programming plans for a sampler', async () => {
      const res1 = await request(app)
        .get(testRoute())
        .use(tokenProvider(SamplerDromFixture))
        .expect(constants.HTTP_STATUS_OK);

      expectedBody(
        res1.body,
        [validatedDromProgrammingPlan],
        SamplerDromFixture.region
      );
      notExpectedBody(
        res1.body,
        [
          validatedProgrammingPlan,
          inProgressProgrammingPlan,
          submittedProgrammingPlan
        ],
        SamplerDromFixture.region
      );

      const res2 = await request(app)
        .get(testRoute())
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expectedBody(
        res2.body,
        [validatedProgrammingPlan],
        Sampler1Fixture.region
      );
      notExpectedBody(
        res2.body,
        [
          validatedDromProgrammingPlan,
          inProgressProgrammingPlan,
          submittedProgrammingPlan
        ],
        Sampler1Fixture.region
      );
    });

    test('should filter programming plans by status and user authorization', async () => {
      const res = await request(app)
        .get(testRoute({ status: 'Submitted' }))
        .use(tokenProvider(RegionalDromCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expectedBody(
        res.body,
        [submittedProgrammingPlan],
        RegionalDromCoordinator.region
      );
      notExpectedBody(
        res.body,
        [
          validatedDromProgrammingPlan,
          validatedProgrammingPlan,
          inProgressProgrammingPlan
        ],
        RegionalDromCoordinator.region
      );
    });
  });

  describe('GET /programming-plans/:programmingPlanId', () => {
    const testRoute = (programmingPlanId: string) =>
      `/api/programming-plans/${programmingPlanId}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute('2025'))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid programming plan id', async () => {
      await request(app)
        .get(testRoute('invalid'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the programmingPlan does not exist', async () => {
      await request(app)
        .get(testRoute(uuidv4()))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should fail if the user is not authorized to access the programming plan regarding the regional status', async () => {
      await request(app)
        .get(testRoute(inProgressProgrammingPlan.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);

      await request(app)
        .get(testRoute(validatedDromProgrammingPlan.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);

      await request(app)
        .get(testRoute(validatedDromProgrammingPlan.id))
        .use(tokenProvider(SamplerDromFixture))
        .expect(constants.HTTP_STATUS_OK);
    });

    test('should find the programmingPlan', async () => {
      const res = await request(app)
        .get(testRoute(validatedProgrammingPlan.id))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...validatedProgrammingPlan,
        createdAt: validatedProgrammingPlan.createdAt.toISOString()
      });
    });
  });

  describe('GET /programming-plans/years/:year', () => {
    const testRoute = (year: string) => `/api/programming-plans/years/${year}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute('2025'))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid year', async () => {
      await request(app)
        .get(testRoute('invalid'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the programmingPlan does not exist', async () => {
      await request(app)
        .get(testRoute('2025'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should fail if the user is not authorized to access the programming plan regarding the regional status', async () => {
      await request(app)
        .get(testRoute(inProgressProgrammingPlan.year.toString()))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);

      await request(app)
        .get(testRoute(validatedDromProgrammingPlan.year.toString()))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);

      await request(app)
        .get(testRoute(validatedDromProgrammingPlan.year.toString()))
        .use(tokenProvider(SamplerDromFixture))
        .expect(constants.HTTP_STATUS_OK);
    });

    test('should find the programmingPlan for the given year', async () => {
      const res = await request(app)
        .get(testRoute(validatedProgrammingPlan.year.toString()))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual({
        ...validatedProgrammingPlan,
        createdAt: validatedProgrammingPlan.createdAt.toISOString(),
        regionalStatus: expect.arrayContaining(
          validatedProgrammingPlan.regionalStatus
        )
      });
    });
  });

  describe('POST /programming-plans/years/:year', () => {
    const testRoute = (year: string) => `/api/programming-plans/years/${year}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute('2020'))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user is not authorized', async () => {
      await request(app)
        .post(testRoute('2020'))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the previous programming plan does not exist', async () => {
      await request(app)
        .post(testRoute('2000'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should fail if the previous programming plan is not validated', async () => {
      await request(app)
        .post(testRoute('2023'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should create a new programming plan for the given year', async () => {
      const res = await request(app)
        .post(testRoute('2020'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject({
        year: 2020,
        regionalStatus: RegionList.map((region) => ({
          region,
          status: 'InProgress' as const
        }))
      });

      await expect(
        ProgrammingPlans().where('year', 2020).first()
      ).resolves.toMatchObject({
        year: 2020
      });

      await expect(
        ProgrammingPlanRegionalStatus().where('programmingPlanId', res.body.id)
      ).resolves.toMatchObject(
        expect.arrayContaining(
          RegionList.map((region) => ({
            programmingPlanId: res.body.id,
            region,
            status: 'InProgress'
          }))
        )
      );

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
            matrixKind: controlPrescriptionValidatedPlan.matrixKind,
            stages: controlPrescriptionValidatedPlan.stages,
            programmingPlanKind:
              controlPrescriptionValidatedPlan.programmingPlanKind,
            notes: null
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
            matrixKind: surveillancePrescriptionValidatedPlan.matrixKind,
            stages: surveillancePrescriptionValidatedPlan.stages,
            programmingPlanKind:
              controlPrescriptionValidatedPlan.programmingPlanKind,
            notes: null
          }
        ])
      );

      //TODO check substances duplication

      //Cleanup
      await Prescriptions().where('programmingPlanId', res.body.id).delete();
      await ProgrammingPlans().where('id', res.body.id).delete();
    });
  });

  describe('PUT /programming-plans/:programmingPlanId/regional-status', () => {
    const programmingPlanRegionalStatusList = [
      {
        status: 'Approved' as const,
        region: oneOf(RegionList)
      }
    ];

    const testRoute = (programmingPlanId: string) =>
      `/api/programming-plans/${programmingPlanId}/regional-status`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute(validatedProgrammingPlan.id))
        .send(programmingPlanRegionalStatusList)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user is not authorized', async () => {
      await request(app)
        .put(testRoute(validatedProgrammingPlan.id))
        .send(programmingPlanRegionalStatusList)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the programming plan does not exist', async () => {
      await request(app)
        .put(testRoute(uuidv4()))
        .send(programmingPlanRegionalStatusList)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .put(testRoute(validatedProgrammingPlan.id))
          .send({ ...programmingPlanRegionalStatusList, ...payload })
          .use(tokenProvider(NationalCoordinator))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest({
        status: 'Invalid'
      });
    });

    test('should fail if the status update is forbidden', async () => {
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
      await badRequestTest(inProgressProgrammingPlan, 'Approved');
      await badRequestTest(inProgressProgrammingPlan, 'Validated');
      await badRequestTest(submittedProgrammingPlan, 'Submitted');
      await badRequestTest(submittedProgrammingPlan, 'InProgress');
      await badRequestTest(submittedProgrammingPlan, 'Validated');
      await badRequestTest(validatedProgrammingPlan, 'InProgress');
      await badRequestTest(validatedProgrammingPlan, 'Submitted');
      await badRequestTest(validatedProgrammingPlan, 'Validated');
      await badRequestTest(validatedProgrammingPlan, 'Approved');
    });

    test('should update a Submitted programming plan to Approved', async () => {
      const res = await request(app)
        .put(testRoute(submittedProgrammingPlan.id))
        .send(programmingPlanRegionalStatusList)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        withISOStringDates({
          ...submittedProgrammingPlan,
          regionalStatus: expect.arrayContaining(
            submittedProgrammingPlan.regionalStatus.map((regionalStatus) =>
              regionalStatus.region ===
              programmingPlanRegionalStatusList[0].region
                ? programmingPlanRegionalStatusList[0]
                : regionalStatus
            )
          )
        })
      );

      await expect(
        ProgrammingPlanRegionalStatus()
          .where({
            programmingPlanId: submittedProgrammingPlan.id,
            region: programmingPlanRegionalStatusList[0].region
          })
          .first()
      ).resolves.toMatchObject({
        region: programmingPlanRegionalStatusList[0].region,
        status: 'Approved'
      });

      //Cleanup
      await ProgrammingPlanRegionalStatus()
        .where('programmingPlanId', submittedProgrammingPlan.id)
        .update({ status: 'Submitted' });
    });
  });
});
