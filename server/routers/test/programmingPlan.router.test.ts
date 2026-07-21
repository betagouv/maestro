import { constants } from 'node:http2';
import { type Region, RegionList } from 'maestro-shared/referential/Region';
import type { ProgrammingPlanStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  genLocalPrescription,
  genPrescription,
  genPrescriptionSubstance
} from 'maestro-shared/test/prescriptionFixtures';
import {
  DAOAInProgressProgrammingPlanFixture,
  DAOAValidatedProgrammingPlanFixture,
  PPVClosedProgrammingPlanFixture,
  PPVInProgressProgrammingPlanFixture,
  PPVSubmittedProgrammingPlanFixture,
  PPVSubmittedSubPlanFixture,
  PPVValidatedDromProgrammingPlanFixture,
  PPVValidatedProgrammingPlanFixture,
  PPVValidatedSubPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import { oneOf } from 'maestro-shared/test/testFixtures';
import {
  AdminFixture,
  NationalCoordinator,
  RegionalCoordinator,
  RegionalDromCoordinator,
  Sampler1Fixture,
  SamplerDromFixture
} from 'maestro-shared/test/userFixtures';
import { withISOStringDates } from 'maestro-shared/utils/date';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { describe, expect, test } from 'vitest';
import {
  formatLocalPrescription,
  LocalPrescriptions
} from '../../repositories/localPrescriptionRepository';
import { Prescriptions } from '../../repositories/prescriptionRepository';
import { PrescriptionSubstances } from '../../repositories/prescriptionSubstanceRepository';
import { ProgrammingPlans } from '../../repositories/programmingPlanRepository';
import { ProgrammingSubPlanLocalStatus } from '../../repositories/programmingSubPlanRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('ProgrammingPlan router', () => {
  const { app } = createServer();

  const programmingPlansMatch = (programmingPlans: ProgrammingPlanChecked[]) =>
    expect.arrayContaining(
      programmingPlans.map((programmingPlan) => ({
        ...withISOStringDates({ ...programmingPlan, subPlans: undefined }),
        subPlans: expect.arrayContaining(
          programmingPlan.subPlans.map((subPlan) => ({
            ...subPlan,
            regionalStatus: expect.arrayContaining(subPlan.regionalStatus),
            departmentalStatus: expect.arrayContaining(
              subPlan.departmentalStatus
            )
          }))
        )
      }))
    );

  const expectedBody = (
    body: any,
    programmingPlans: ProgrammingPlanChecked[],
    region?: Region | null
  ) => {
    const regionalProgrammingPlans = programmingPlans.map(
      (programmingPlan) => ({
        ...programmingPlan,
        subPlans: programmingPlan.subPlans.map((subPlan) => ({
          ...subPlan,
          regionalStatus: subPlan.regionalStatus.filter((regionalStatus) =>
            region ? regionalStatus.region === region : true
          )
        }))
      })
    );
    expect(withISOStringDates(body)).toMatchObject(
      programmingPlansMatch(regionalProgrammingPlans)
    );
  };

  const notExpectedBody = (
    body: any,
    programmingPlans: ProgrammingPlanChecked[],
    region?: Region | null
  ) => {
    const regionalProgrammingPlans = programmingPlans.map(
      (programmingPlan) => ({
        ...programmingPlan,
        subPlans: programmingPlan.subPlans.map((subPlan) => ({
          ...subPlan,
          regionalStatus: subPlan.regionalStatus.filter((regionalStatus) =>
            region ? regionalStatus.region === region : true
          )
        }))
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
        PPVValidatedProgrammingPlanFixture,
        PPVValidatedDromProgrammingPlanFixture,
        PPVSubmittedProgrammingPlanFixture,
        PPVInProgressProgrammingPlanFixture,
        PPVClosedProgrammingPlanFixture
      ]);
    });

    test('should find all the programmingPlans for the administrator', async () => {
      const res = await request(app)
        .get(testRoute())
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expectedBody(res.body, [
        PPVValidatedProgrammingPlanFixture,
        PPVValidatedDromProgrammingPlanFixture,
        PPVSubmittedProgrammingPlanFixture,
        PPVInProgressProgrammingPlanFixture,
        PPVClosedProgrammingPlanFixture,
        DAOAInProgressProgrammingPlanFixture,
        DAOAValidatedProgrammingPlanFixture
      ]);
    });

    test('can filter the programmingPlans by subPlanIds for the administrator', async () => {
      const res = await request(app)
        .get(
          testRoute({
            subPlanIds: DAOAInProgressProgrammingPlanFixture.subPlans[0].id
          })
        )
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body[0]).toMatchObject({
        id: DAOAInProgressProgrammingPlanFixture.id,
        subPlans: expect.arrayContaining([
          expect.objectContaining({
            id: DAOAInProgressProgrammingPlanFixture.subPlans[0].id
          })
        ])
      });
    });

    test('should find regional submitted and validated programming plans for a regional coordinator', async () => {
      const res1 = await request(app)
        .get(testRoute())
        .use(tokenProvider(RegionalDromCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expectedBody(
        res1.body,
        [
          PPVValidatedDromProgrammingPlanFixture,
          PPVSubmittedProgrammingPlanFixture
        ],
        RegionalDromCoordinator.region
      );
      notExpectedBody(
        res1.body,
        [PPVInProgressProgrammingPlanFixture],
        RegionalDromCoordinator.region
      );

      const res2 = await request(app)
        .get(testRoute())
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expectedBody(
        res2.body,
        [
          PPVValidatedProgrammingPlanFixture,
          PPVSubmittedProgrammingPlanFixture
        ],
        RegionalCoordinator.region
      );
      notExpectedBody(
        res2.body,
        [
          PPVValidatedDromProgrammingPlanFixture,
          PPVInProgressProgrammingPlanFixture
        ],
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
        [PPVValidatedDromProgrammingPlanFixture],
        SamplerDromFixture.region
      );
      notExpectedBody(
        res1.body,
        [
          PPVValidatedProgrammingPlanFixture,
          PPVSubmittedProgrammingPlanFixture,
          PPVInProgressProgrammingPlanFixture
        ],
        SamplerDromFixture.region
      );

      const res2 = await request(app)
        .get(testRoute())
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expectedBody(
        res2.body,
        [PPVValidatedProgrammingPlanFixture],
        Sampler1Fixture.region
      );
      notExpectedBody(
        res2.body,
        [
          PPVValidatedDromProgrammingPlanFixture,
          PPVInProgressProgrammingPlanFixture,
          PPVSubmittedProgrammingPlanFixture
        ],
        Sampler1Fixture.region
      );
    });

    test('should filter programming plans by status and user authorization', async () => {
      const res = await request(app)
        .get(testRoute({ status: 'SubmittedToRegion' }))
        .use(tokenProvider(RegionalDromCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expectedBody(
        res.body,
        [PPVSubmittedProgrammingPlanFixture],
        RegionalDromCoordinator.region
      );
      notExpectedBody(
        res.body,
        [
          PPVValidatedDromProgrammingPlanFixture,
          PPVValidatedProgrammingPlanFixture,
          PPVInProgressProgrammingPlanFixture
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
        .get(testRoute(PPVInProgressProgrammingPlanFixture.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);

      await request(app)
        .get(testRoute(PPVValidatedDromProgrammingPlanFixture.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);

      await request(app)
        .get(testRoute(PPVValidatedDromProgrammingPlanFixture.id))
        .use(tokenProvider(SamplerDromFixture))
        .expect(constants.HTTP_STATUS_OK);
    });

    test('should find the programmingPlan', async () => {
      const res = await request(app)
        .get(testRoute(PPVValidatedProgrammingPlanFixture.id))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...PPVValidatedProgrammingPlanFixture,
        createdAt: PPVValidatedProgrammingPlanFixture.createdAt.toISOString()
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
      const controlPrescription = genPrescription({
        programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
        context: 'Control',
        matrixKind: 'A00RT'
      });
      const surveillancePrescription = genPrescription({
        programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
        context: 'Surveillance'
      });
      const localPrescription = genLocalPrescription({
        prescriptionId: controlPrescription.id
      });
      const prescriptionSubstance = genPrescriptionSubstance({
        prescriptionId: controlPrescription.id
      });

      await Prescriptions().insert([
        controlPrescription,
        surveillancePrescription
      ]);
      await LocalPrescriptions().insert(
        formatLocalPrescription(localPrescription)
      );
      await PrescriptionSubstances().insert(prescriptionSubstance);

      const year = PPVValidatedProgrammingPlanFixture.year + 1;
      const res = await request(app)
        .post(testRoute(year.toString()))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject({
        year,
        subPlans: expect.arrayContaining([
          expect.objectContaining({
            regionalStatus: expect.arrayContaining(
              RegionList.map((region) => ({
                region,
                status: 'InProgress' as const
              }))
            )
          })
        ])
      });

      await expect(
        ProgrammingPlans().where('year', year).first()
      ).resolves.toMatchObject({
        year
      });

      await expect(
        ProgrammingSubPlanLocalStatus().whereIn(
          'programmingSubPlanId',
          res.body.subPlans.map((subPlan: { id: string }) => subPlan.id)
        )
      ).resolves.toMatchObject(
        expect.arrayContaining(
          res.body.subPlans.flatMap((subPlan: { id: string }) =>
            RegionList.map((region) => ({
              programmingSubPlanId: subPlan.id,
              region,
              status: 'InProgress',
              department: 'None'
            }))
          )
        )
      );

      const newControlPrescription = await Prescriptions()
        .where('programmingPlanId', res.body.id)
        .andWhere('context', 'Control')
        .andWhere('matrixKind', controlPrescription.matrixKind)
        .first();

      expect(newControlPrescription).toMatchObject({
        id: expect.any(String),
        context: 'Control',
        programmingPlanId: res.body.id,
        matrixKind: controlPrescription.matrixKind,
        matrix: null,
        stages: controlPrescription.stages,
        programmingSubPlanId: controlPrescription.programmingSubPlanId,
        programmingInstruction:
          controlPrescription.programmingInstruction ?? null,
        notes: controlPrescription.notes ?? null
      });

      const newSurveillancePrescription = await Prescriptions()
        .where('programmingPlanId', res.body.id)
        .andWhere('context', 'Surveillance')
        .first();

      expect(newSurveillancePrescription).toMatchObject({
        id: expect.any(String),
        context: 'Surveillance',
        programmingPlanId: res.body.id,
        matrixKind: surveillancePrescription.matrixKind,
        matrix: null,
        stages: surveillancePrescription.stages,
        programmingSubPlanId: controlPrescription.programmingSubPlanId,
        programmingInstruction:
          controlPrescription.programmingInstruction ?? null,
        notes: controlPrescription.notes ?? null
      });

      const controlLocalPrescriptions = await LocalPrescriptions().where(
        'prescriptionId',
        controlPrescription?.id
      );

      expect(controlLocalPrescriptions.length).toBe(1);
      expect(controlLocalPrescriptions[0]).toMatchObject({
        prescriptionId: controlPrescription?.id,
        region: localPrescription.region,
        department: localPrescription.department ?? 'None',
        sampleCount: localPrescription.sampleCount
      });

      const newPrescriptionSubstances = await PrescriptionSubstances().where(
        'prescriptionId',
        newControlPrescription?.id
      );

      expect(newPrescriptionSubstances.length).toBe(1);
      expect(newPrescriptionSubstances[0]).toMatchObject({
        ...prescriptionSubstance,
        prescriptionId: newControlPrescription?.id
      });

      //Cleanup
      await PrescriptionSubstances()
        .whereIn('prescriptionId', [
          controlPrescription?.id,
          surveillancePrescription?.id,
          newControlPrescription?.id,
          newSurveillancePrescription?.id
        ] as string[])
        .delete();
      await LocalPrescriptions()
        .whereIn('prescriptionId', [
          controlPrescription?.id,
          surveillancePrescription?.id,
          newControlPrescription?.id,
          newSurveillancePrescription?.id
        ] as string[])
        .delete();
      await Prescriptions()
        .whereIn('id', [
          controlPrescription?.id,
          surveillancePrescription?.id,
          newControlPrescription?.id,
          newSurveillancePrescription?.id
        ] as string[])
        .delete();
    });
  });

  describe('PUT /programming-plans/:programmingPlanId', () => {
    const testRoute = (programmingPlanId: string) =>
      `/api/programming-plans/${programmingPlanId}`;

    const validBody = {
      status: 'Closed' as const
    };

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute(PPVValidatedProgrammingPlanFixture.id))
        .send(validBody)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user is not authorized', async () => {
      await request(app)
        .put(testRoute(PPVValidatedProgrammingPlanFixture.id))
        .send(validBody)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the programming plan does not exist', async () => {
      await request(app)
        .put(testRoute(uuidv4()))
        .send(validBody)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .put(testRoute(PPVValidatedProgrammingPlanFixture.id))
          .send({ ...validBody, ...payload })
          .use(tokenProvider(NationalCoordinator))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest({
        status: 'Invalid'
      });
    });

    test('should fail if the status update is forbidden', async () => {
      const badRequestTest = async (
        programmingPlan: ProgrammingPlanChecked,
        status: ProgrammingPlanStatus
      ) =>
        request(app)
          .put(testRoute(programmingPlan.id))
          .send({ status })
          .use(tokenProvider(NationalCoordinator))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest(PPVInProgressProgrammingPlanFixture, 'InProgress');
      await badRequestTest(
        PPVInProgressProgrammingPlanFixture,
        'ApprovedByRegion'
      );
      await badRequestTest(PPVInProgressProgrammingPlanFixture, 'Validated');
      await badRequestTest(PPVInProgressProgrammingPlanFixture, 'Closed');
      await badRequestTest(
        PPVSubmittedProgrammingPlanFixture,
        'SubmittedToRegion'
      );
      await badRequestTest(PPVSubmittedProgrammingPlanFixture, 'InProgress');
      await badRequestTest(PPVSubmittedProgrammingPlanFixture, 'Validated');
      await badRequestTest(PPVSubmittedProgrammingPlanFixture, 'Closed');
      await badRequestTest(PPVValidatedProgrammingPlanFixture, 'InProgress');
      await badRequestTest(
        PPVValidatedProgrammingPlanFixture,
        'SubmittedToRegion'
      );
      await badRequestTest(PPVValidatedProgrammingPlanFixture, 'Validated');
      await badRequestTest(
        PPVValidatedProgrammingPlanFixture,
        'ApprovedByRegion'
      );
    });

    test('should update a validated programming plan to closed', async () => {
      const res = await request(app)
        .put(testRoute(PPVValidatedProgrammingPlanFixture.id))
        .send(validBody)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        withISOStringDates({
          ...PPVValidatedProgrammingPlanFixture,
          closedAt: expect.any(String),
          closedBy: NationalCoordinator.id,
          subPlans: expect.arrayContaining([
            expect.objectContaining({
              id: PPVValidatedSubPlanFixture.id,
              regionalStatus: expect.arrayContaining(
                RegionList.map((region) => ({
                  region,
                  status: 'Closed' as const
                }))
              )
            })
          ])
        })
      );

      await expect(
        ProgrammingSubPlanLocalStatus().where({
          programmingSubPlanId: PPVValidatedSubPlanFixture.id
        })
      ).resolves.toMatchObject(
        expect.arrayContaining(
          RegionList.map((region) => ({
            programmingSubPlanId: PPVValidatedSubPlanFixture.id,
            region,
            status: 'Closed',
            department: 'None'
          }))
        )
      );
      await expect(
        ProgrammingPlans()
          .where('id', PPVValidatedProgrammingPlanFixture.id)
          .first()
      ).resolves.toMatchObject({
        id: PPVValidatedProgrammingPlanFixture.id,
        closedAt: expect.any(Date),
        closedBy: NationalCoordinator.id
      });

      //Cleanup
      await ProgrammingSubPlanLocalStatus()
        .where('programmingSubPlanId', PPVSubmittedSubPlanFixture.id)
        .update({ status: 'SubmittedToRegion' });
    });
  });

  describe('PUT /programming-plans/:programmingPlanId/local-status', () => {
    const programmingPlanLocalStatusList = [
      {
        status: 'ApprovedByRegion' as const,
        region: oneOf(RegionList),
        programmingSubPlanId: PPVSubmittedSubPlanFixture.id
      }
    ];

    const testRoute = (programmingPlanId: string) =>
      `/api/programming-plans/${programmingPlanId}/local-status`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute(PPVValidatedProgrammingPlanFixture.id))
        .send(programmingPlanLocalStatusList)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user is not authorized', async () => {
      await request(app)
        .put(testRoute(PPVValidatedProgrammingPlanFixture.id))
        .send({ programmingPlanLocalStatusList })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the programming plan does not exist', async () => {
      await request(app)
        .put(testRoute(uuidv4()))
        .send({ programmingPlanLocalStatusList })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .put(testRoute(PPVValidatedProgrammingPlanFixture.id))
          .send({ programmingPlanLocalStatusList: [payload] })
          .use(tokenProvider(NationalCoordinator))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest({
        status: 'Invalid'
      });
    });

    test('should fail if the status update is forbidden', async () => {
      const badRequestTest = async (
        programmingPlan: ProgrammingPlanChecked,
        status: ProgrammingPlanStatus
      ) =>
        request(app)
          .put(testRoute(programmingPlan.id))
          .send({ status })
          .use(tokenProvider(NationalCoordinator))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest(PPVInProgressProgrammingPlanFixture, 'InProgress');
      await badRequestTest(
        PPVInProgressProgrammingPlanFixture,
        'ApprovedByRegion'
      );
      await badRequestTest(PPVInProgressProgrammingPlanFixture, 'Validated');
      await badRequestTest(
        PPVSubmittedProgrammingPlanFixture,
        'SubmittedToRegion'
      );
      await badRequestTest(PPVSubmittedProgrammingPlanFixture, 'InProgress');
      await badRequestTest(PPVSubmittedProgrammingPlanFixture, 'Validated');
      await badRequestTest(PPVValidatedProgrammingPlanFixture, 'InProgress');
      await badRequestTest(
        PPVValidatedProgrammingPlanFixture,
        'SubmittedToRegion'
      );
      await badRequestTest(PPVValidatedProgrammingPlanFixture, 'Validated');
      await badRequestTest(
        PPVValidatedProgrammingPlanFixture,
        'ApprovedByRegion'
      );
    });

    test('should update a Submitted programming plan to Approved', async () => {
      const res = await request(app)
        .put(testRoute(PPVSubmittedProgrammingPlanFixture.id))
        .send({ programmingPlanLocalStatusList })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        withISOStringDates({
          ...PPVSubmittedProgrammingPlanFixture,
          subPlans: expect.arrayContaining([
            expect.objectContaining({
              id: PPVSubmittedSubPlanFixture.id,
              regionalStatus: expect.arrayContaining(
                PPVSubmittedSubPlanFixture.regionalStatus.map(
                  (regionalStatus) =>
                    regionalStatus.region ===
                    programmingPlanLocalStatusList[0].region
                      ? {
                          region: regionalStatus.region,
                          status: programmingPlanLocalStatusList[0].status
                        }
                      : regionalStatus
                )
              )
            })
          ])
        })
      );

      await expect(
        ProgrammingSubPlanLocalStatus()
          .where({
            programmingSubPlanId: PPVSubmittedSubPlanFixture.id,
            region: programmingPlanLocalStatusList[0].region
          })
          .first()
      ).resolves.toMatchObject({
        region: programmingPlanLocalStatusList[0].region,
        status: 'ApprovedByRegion'
      });

      //Cleanup
      await ProgrammingSubPlanLocalStatus()
        .where('programmingSubPlanId', PPVSubmittedSubPlanFixture.id)
        .update({ status: 'SubmittedToRegion' });
    });

    test('should validate a programming plan', async () => {
      const res = await request(app)
        .put(testRoute(PPVSubmittedProgrammingPlanFixture.id))
        .send({ programmingPlanLocalStatusList })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        withISOStringDates({
          ...PPVSubmittedProgrammingPlanFixture,
          subPlans: expect.arrayContaining([
            expect.objectContaining({
              id: PPVSubmittedSubPlanFixture.id,
              regionalStatus: expect.arrayContaining(
                PPVSubmittedSubPlanFixture.regionalStatus.map(
                  (regionalStatus) =>
                    regionalStatus.region ===
                    programmingPlanLocalStatusList[0].region
                      ? {
                          region: regionalStatus.region,
                          status: programmingPlanLocalStatusList[0].status
                        }
                      : regionalStatus
                )
              )
            })
          ])
        })
      );

      await expect(
        ProgrammingSubPlanLocalStatus()
          .where({
            programmingSubPlanId: PPVSubmittedSubPlanFixture.id,
            region: programmingPlanLocalStatusList[0].region
          })
          .first()
      ).resolves.toMatchObject({
        region: programmingPlanLocalStatusList[0].region,
        status: 'ApprovedByRegion'
      });

      //Cleanup
      await ProgrammingSubPlanLocalStatus()
        .where('programmingSubPlanId', PPVSubmittedSubPlanFixture.id)
        .update({ status: 'SubmittedToRegion' });
    });
  });
});
