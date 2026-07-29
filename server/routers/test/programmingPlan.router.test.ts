import { constants } from 'node:http2';
import type { Department } from 'maestro-shared/referential/Department';
import {
  type Region,
  RegionList,
  Regions
} from 'maestro-shared/referential/Region';
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
  PPVValidatedDromProgrammingPlanFixture,
  PPVValidatedProgrammingPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import { oneOf } from 'maestro-shared/test/testFixtures';
import {
  AdminFixture,
  DepartmentalCoordinator,
  NationalCoordinator,
  RegionalCoordinator,
  RegionalDaoaCoordinator,
  RegionalDromCoordinator,
  Sampler1Fixture,
  SamplerDromFixture
} from 'maestro-shared/test/userFixtures';
import { withISOStringDates } from 'maestro-shared/utils/date';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { describe, expect, test } from 'vitest';
import { LocalPrescriptionChanges } from '../../repositories/localPrescriptionChangeRepository';
import {
  formatLocalPrescription,
  LocalPrescriptions
} from '../../repositories/localPrescriptionRepository';
import { PrescriptionChanges } from '../../repositories/prescriptionChangeRepository';
import { Prescriptions } from '../../repositories/prescriptionRepository';
import { PrescriptionSubstances } from '../../repositories/prescriptionSubstanceRepository';
import {
  ProgrammingPlanLocalStatus,
  ProgrammingPlans
} from '../../repositories/programmingPlanRepository';
import { createServer } from '../../server';
import prescriptionDiffusionService from '../../services/prescriptionDiffusionService';
import { mockSendNotification } from '../../test/setupTests';
import { tokenProvider } from '../../test/testUtils';

describe('ProgrammingPlan router', () => {
  const { app } = createServer();

  const programmingPlansMatch = (programmingPlans: ProgrammingPlanChecked[]) =>
    expect.arrayContaining(
      programmingPlans.map((programmingPlan) =>
        expect.objectContaining({
          ...withISOStringDates(programmingPlan),
          regionalStatus: expect.arrayContaining(
            programmingPlan.regionalStatus.map((regionalStatus) =>
              expect.objectContaining(regionalStatus)
            )
          )
        })
      )
    );

  const expectedBody = (
    body: any,
    programmingPlans: ProgrammingPlanChecked[],
    region?: Region | null
  ) => {
    for (const programmingPlan of programmingPlans) {
      const actual = body.find((_: any) => _.id === programmingPlan.id);
      expect(
        actual,
        `expected plan ${programmingPlan.id} in body`
      ).toBeDefined();

      const expectedRegionalStatus = programmingPlan.regionalStatus.filter(
        (regionalStatus) => (region ? regionalStatus.region === region : true)
      );
      expect(withISOStringDates(actual)).toMatchObject({
        ...withISOStringDates(programmingPlan),
        regionalStatus: expect.arrayContaining(
          expectedRegionalStatus.map((regionalStatus) =>
            expect.objectContaining(regionalStatus)
          )
        ),
        departmentalStatus: []
      });
    }
  };

  const notExpectedBody = (
    body: any,
    programmingPlans: ProgrammingPlanChecked[],
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

    test('a pending National edit targeting one region stays invisible to everyone but National itself; the region it targets is unaffected', async () => {
      const targetRegion = RegionalCoordinator.region as Region;
      const modifiedPrescription = genPrescription({
        programmingPlanId: PPVSubmittedProgrammingPlanFixture.id
      });
      await Prescriptions().insert(modifiedPrescription);
      await LocalPrescriptionChanges().insert({
        prescriptionId: modifiedPrescription.id,
        region: targetRegion,
        department: 'None',
        companySiret: 'None',
        echelon: 'National',
        kind: 'sampleCount',
        sampleCount: modifiedPrescription.sampleCount + 1,
        previousSampleCount: modifiedPrescription.sampleCount,
        changedAt: new Date()
      });

      const nationalRes = await request(app)
        .get(testRoute(PPVSubmittedProgrammingPlanFixture.id))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);
      expect(nationalRes.body.nationalStatus).toMatchObject({
        hasPendingChange: true
      });

      expect(
        nationalRes.body.regionalStatus.find(
          (_: any) => _.region === targetRegion
        )
      ).toMatchObject({ hasPendingChange: false });

      const adminRes = await request(app)
        .get(testRoute(PPVSubmittedProgrammingPlanFixture.id))
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);
      expect(adminRes.body.nationalStatus).toMatchObject({
        hasPendingChange: false
      });
      expect(
        adminRes.body.regionalStatus.find((_: any) => _.region === targetRegion)
      ).toMatchObject({ hasPendingChange: false });

      const regionRes = await request(app)
        .get(testRoute(PPVSubmittedProgrammingPlanFixture.id))
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);
      expect(
        regionRes.body.regionalStatus.find(
          (_: any) => _.region === targetRegion
        )
      ).toMatchObject({ hasPendingChange: false });

      await Prescriptions().where({ id: modifiedPrescription.id }).delete();
    });

    test('once diffused, a region whose live data outran its own sentAt shows needsResend to everyone, but only the region itself gets folded into hasPendingChange', async () => {
      const targetRegion = RegionalCoordinator.region as Region;
      const originalSentAt = new Date('2020-01-01');
      await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
          region: targetRegion
        })
        .update({ sentAt: originalSentAt });

      const modifiedPrescription = genPrescription({
        programmingPlanId: PPVValidatedProgrammingPlanFixture.id
      });
      await Prescriptions().insert(modifiedPrescription);
      await LocalPrescriptionChanges().insert({
        prescriptionId: modifiedPrescription.id,
        region: targetRegion,
        department: 'None',
        companySiret: 'None',
        echelon: 'National',
        kind: 'sampleCount',
        sampleCount: modifiedPrescription.sampleCount + 1,
        previousSampleCount: modifiedPrescription.sampleCount,
        changedAt: new Date()
      });
      await prescriptionDiffusionService.commitPendingNationalChanges(
        PPVValidatedProgrammingPlanFixture.id
      );

      const nationalRes = await request(app)
        .get(testRoute(PPVValidatedProgrammingPlanFixture.id))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);
      expect(
        nationalRes.body.regionalStatus.find(
          (_: any) => _.region === targetRegion
        )
      ).toMatchObject({ needsResend: true, hasPendingChange: false });

      const adminRes = await request(app)
        .get(testRoute(PPVValidatedProgrammingPlanFixture.id))
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);
      expect(
        adminRes.body.regionalStatus.find((_: any) => _.region === targetRegion)
      ).toMatchObject({ needsResend: true, hasPendingChange: false });

      const regionRes = await request(app)
        .get(testRoute(PPVValidatedProgrammingPlanFixture.id))
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);
      expect(
        regionRes.body.regionalStatus.find(
          (_: any) => _.region === targetRegion
        )
      ).toMatchObject({ needsResend: true, hasPendingChange: true });

      // Cleanup
      await Prescriptions().where({ id: modifiedPrescription.id }).delete();
      await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
          region: targetRegion
        })
        .update({ sentAt: null });
    });

    test('SLAUGHTERHOUSE: a Regional-authored pending edit for one department stays invisible everywhere but the region aggregate — department itself unaffected until Regional sends', async () => {
      const region = RegionalDaoaCoordinator.region as Region;
      const department = Regions[region].departments[0] as Department;

      await ProgrammingPlanLocalStatus().insert(
        Regions[region].departments.map((dept) => ({
          programmingPlanId: DAOAValidatedProgrammingPlanFixture.id,
          region,
          department: dept,
          status: 'Validated' as const,
          sentAt: new Date('2020-01-01')
        }))
      );

      const modifiedPrescription = genPrescription({
        programmingPlanId: DAOAValidatedProgrammingPlanFixture.id
      });
      await Prescriptions().insert(modifiedPrescription);
      await LocalPrescriptionChanges().insert({
        prescriptionId: modifiedPrescription.id,
        region,
        department,
        companySiret: 'None',
        echelon: 'Regional',
        kind: 'sampleCount',
        sampleCount: modifiedPrescription.sampleCount + 1,
        previousSampleCount: modifiedPrescription.sampleCount,
        changedAt: new Date()
      });

      const regionRes = await request(app)
        .get(testRoute(DAOAValidatedProgrammingPlanFixture.id))
        .use(tokenProvider(RegionalDaoaCoordinator))
        .expect(constants.HTTP_STATUS_OK);
      expect(
        regionRes.body.regionalStatus.find((_: any) => _.region === region)
      ).toMatchObject({ hasPendingChange: true });
      expect(
        regionRes.body.departmentalStatus.find(
          (_: any) => _.region === region && _.department === department
        )
      ).toMatchObject({ status: 'Validated', hasPendingChange: false });

      const departmentalRes = await request(app)
        .get(testRoute(DAOAValidatedProgrammingPlanFixture.id))
        .use(tokenProvider(DepartmentalCoordinator))
        .expect(constants.HTTP_STATUS_OK);
      expect(
        departmentalRes.body.departmentalStatus.find(
          (_: any) => _.region === region && _.department === department
        )
      ).toMatchObject({ status: 'Validated', hasPendingChange: false });

      // Cleanup
      await Prescriptions().where({ id: modifiedPrescription.id }).delete();
      await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: DAOAValidatedProgrammingPlanFixture.id,
          region
        })
        .andWhere('department', '!=', 'None')
        .delete();
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
        regionalStatus: RegionList.map((region) => ({
          region,
          status: 'InProgress' as const
        }))
      });

      await expect(
        ProgrammingPlans().where('year', year).first()
      ).resolves.toMatchObject({
        year
      });

      await expect(
        ProgrammingPlanLocalStatus().where('programmingPlanId', res.body.id)
      ).resolves.toMatchObject(
        expect.arrayContaining(
          RegionList.map((region) =>
            expect.objectContaining({
              programmingPlanId: res.body.id,
              region,
              status: 'InProgress',
              department: 'None'
            })
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
          regionalStatus: expect.arrayContaining(
            RegionList.map((region) =>
              expect.objectContaining({
                region,
                status: 'Closed' as const
              })
            )
          )
        })
      );

      await expect(
        ProgrammingPlanLocalStatus().where({
          programmingPlanId: PPVValidatedProgrammingPlanFixture.id
        })
      ).resolves.toMatchObject(
        expect.arrayContaining(
          RegionList.map((region) =>
            expect.objectContaining({
              programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
              region,
              status: 'Closed',
              department: 'None'
            })
          )
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
      await ProgrammingPlanLocalStatus()
        .where('programmingPlanId', PPVValidatedProgrammingPlanFixture.id)
        .update({ status: 'Validated' });
      await ProgrammingPlans()
        .where('id', PPVValidatedProgrammingPlanFixture.id)
        .update({ closedAt: null, closedBy: null });
    });
  });

  describe('PUT /programming-plans/:programmingPlanId/local-status', () => {
    const programmingPlanLocalStatusList = [
      {
        status: 'Validated' as const,
        region: oneOf(RegionList)
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
          regionalStatus: expect.arrayContaining(
            PPVSubmittedProgrammingPlanFixture.regionalStatus.map(
              (regionalStatus) =>
                expect.objectContaining(
                  regionalStatus.region ===
                    programmingPlanLocalStatusList[0].region
                    ? programmingPlanLocalStatusList[0]
                    : regionalStatus
                )
            )
          )
        })
      );

      await expect(
        ProgrammingPlanLocalStatus()
          .where({
            programmingPlanId: PPVSubmittedProgrammingPlanFixture.id,
            region: programmingPlanLocalStatusList[0].region
          })
          .first()
      ).resolves.toMatchObject({
        region: programmingPlanLocalStatusList[0].region,
        status: 'Validated'
      });

      //Cleanup
      await ProgrammingPlanLocalStatus()
        .where('programmingPlanId', PPVSubmittedProgrammingPlanFixture.id)
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
          regionalStatus: expect.arrayContaining(
            PPVSubmittedProgrammingPlanFixture.regionalStatus.map(
              (regionalStatus) =>
                expect.objectContaining(
                  regionalStatus.region ===
                    programmingPlanLocalStatusList[0].region
                    ? programmingPlanLocalStatusList[0]
                    : regionalStatus
                )
            )
          )
        })
      );

      await expect(
        ProgrammingPlanLocalStatus()
          .where({
            programmingPlanId: PPVSubmittedProgrammingPlanFixture.id,
            region: programmingPlanLocalStatusList[0].region
          })
          .first()
      ).resolves.toMatchObject({
        region: programmingPlanLocalStatusList[0].region,
        status: 'Validated'
      });

      //Cleanup
      await ProgrammingPlanLocalStatus()
        .where('programmingPlanId', PPVSubmittedProgrammingPlanFixture.id)
        .update({ status: 'SubmittedToRegion' });
    });

    test('departmental re-diffusion (Lancer la campagne) persists the sentAt bump', async () => {
      const region = DepartmentalCoordinator.region as Region;
      const department = DepartmentalCoordinator.department as Department;

      await ProgrammingPlanLocalStatus().insert(
        Regions[region].departments.map((dept) => ({
          programmingPlanId: DAOAValidatedProgrammingPlanFixture.id,
          region,
          department: dept,
          status: 'Validated' as const,
          sentAt: new Date('2020-01-01')
        }))
      );

      await request(app)
        .put(testRoute(DAOAValidatedProgrammingPlanFixture.id))
        .send({
          programmingPlanLocalStatusList: [
            { region, department, status: 'Validated' as const }
          ]
        })
        .use(tokenProvider(DepartmentalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      const after = await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: DAOAValidatedProgrammingPlanFixture.id,
          region,
          department
        })
        .first();
      expect(
        new Date(after?.sentAt as unknown as string).getTime()
      ).toBeGreaterThan(new Date('2020-01-01').getTime());

      // Cleanup
      await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: DAOAValidatedProgrammingPlanFixture.id,
          region
        })
        .andWhere('department', '!=', 'None')
        .delete();
    });
  });

  describe('POST /programming-plans/send-to-regions', () => {
    const testRoute = '/api/programming-plans/send-to-regions';

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .send({ programmingPlanIds: [PPVInProgressProgrammingPlanFixture.id] })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user is not authorized', async () => {
      await request(app)
        .post(testRoute)
        .send({ programmingPlanIds: [PPVInProgressProgrammingPlanFixture.id] })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('admin: first send cascades every region and sets the national sentAt', async () => {
      await request(app)
        .post(testRoute)
        .send({ programmingPlanIds: [PPVInProgressProgrammingPlanFixture.id] })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      mockSendNotification.mockClear();

      const res = await request(app)
        .post(testRoute)
        .send({ programmingPlanIds: [PPVInProgressProgrammingPlanFixture.id] })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body[0]).toMatchObject({
        id: PPVInProgressProgrammingPlanFixture.id,
        nationalStatus: expect.objectContaining({
          status: 'SubmittedToRegion'
        })
      });

      await expect(
        ProgrammingPlanLocalStatus()
          .where({
            programmingPlanId: PPVInProgressProgrammingPlanFixture.id,
            region: 'None'
          })
          .first()
      ).resolves.toMatchObject({
        status: 'SubmittedToRegion',
        sentAt: expect.any(Date)
      });

      const regionalRows = await ProgrammingPlanLocalStatus()
        .where('programmingPlanId', PPVInProgressProgrammingPlanFixture.id)
        .andWhere('region', '!=', 'None');
      expect(
        regionalRows.every((row) => row.status === 'SubmittedToRegion')
      ).toBe(true);

      expect(mockSendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'ProgrammingPlanSubmittedToRegion'
        }),
        expect.anything(),
        expect.anything()
      );

      //Cleanup
      await ProgrammingPlanLocalStatus()
        .where('programmingPlanId', PPVInProgressProgrammingPlanFixture.id)
        .update({ status: 'InProgress', sentAt: null });
    });

    test('admin: sending a plan the national coordinator has not submitted yet is a no-op', async () => {
      mockSendNotification.mockClear();

      const res = await request(app)
        .post(testRoute)
        .send({ programmingPlanIds: [PPVInProgressProgrammingPlanFixture.id] })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body[0]).toMatchObject({
        id: PPVInProgressProgrammingPlanFixture.id,
        nationalStatus: expect.objectContaining({
          status: 'InProgress',
          sentAt: null
        })
      });

      const regionalRows = await ProgrammingPlanLocalStatus()
        .where('programmingPlanId', PPVInProgressProgrammingPlanFixture.id)
        .andWhere('region', '!=', 'None');
      expect(
        regionalRows.every(
          (row) => row.status === 'InProgress' && row.sentAt === null
        )
      ).toBe(true);

      expect(mockSendNotification).not.toHaveBeenCalled();
    });

    test('national: first send marks the plan SubmittedToAdmin and notifies administrators, regions untouched', async () => {
      mockSendNotification.mockClear();

      const res = await request(app)
        .post(testRoute)
        .send({ programmingPlanIds: [PPVInProgressProgrammingPlanFixture.id] })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body[0]).toMatchObject({
        id: PPVInProgressProgrammingPlanFixture.id,
        nationalStatus: expect.objectContaining({
          status: 'SubmittedToAdmin',
          sentAt: expect.any(String)
        })
      });

      const regionalRows = await ProgrammingPlanLocalStatus()
        .where('programmingPlanId', PPVInProgressProgrammingPlanFixture.id)
        .andWhere('region', '!=', 'None');
      expect(
        regionalRows.every(
          (row) => row.status === 'InProgress' && row.sentAt === null
        )
      ).toBe(true);

      expect(mockSendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'ProgrammingPlanReadyForAdminReview'
        }),
        expect.anything(),
        expect.anything()
      );

      //Cleanup
      await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: PPVInProgressProgrammingPlanFixture.id,
          region: 'None'
        })
        .update({ status: 'InProgress', sentAt: null });
    });

    test('admin: resend after modification is a no-op, only the national coordinator can do it', async () => {
      const modifiedRegion =
        PPVSubmittedProgrammingPlanFixture.regionalStatus[0].region;
      const previousSentAt = new Date('2020-01-01');

      await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: PPVSubmittedProgrammingPlanFixture.id,
          region: 'None'
        })
        .update({
          sentAt: previousSentAt,
          lastModifiedAt: new Date('2020-06-01')
        });
      await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: PPVSubmittedProgrammingPlanFixture.id,
          region: modifiedRegion
        })
        .update({ lastModifiedAt: new Date('2020-06-01') });

      mockSendNotification.mockClear();

      await request(app)
        .post(testRoute)
        .send({ programmingPlanIds: [PPVSubmittedProgrammingPlanFixture.id] })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      const updatedNational = await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: PPVSubmittedProgrammingPlanFixture.id,
          region: 'None'
        })
        .first();
      expect(updatedNational?.status).toBe('SubmittedToRegion');
      expect(
        new Date(updatedNational?.sentAt as unknown as string).getTime()
      ).toBe(previousSentAt.getTime());

      const regionalRows = await ProgrammingPlanLocalStatus()
        .where('programmingPlanId', PPVSubmittedProgrammingPlanFixture.id)
        .andWhere('region', '!=', 'None');
      expect(
        regionalRows.every((row) => row.status === 'SubmittedToRegion')
      ).toBe(true);

      expect(mockSendNotification).not.toHaveBeenCalled();

      //Cleanup
      await ProgrammingPlanLocalStatus()
        .where('programmingPlanId', PPVSubmittedProgrammingPlanFixture.id)
        .update({ sentAt: null, lastModifiedAt: null });
    });

    test('national: a single call branches per plan (never sent vs already sent)', async () => {
      const modifiedRegion =
        PPVSubmittedProgrammingPlanFixture.regionalStatus[0].region;
      const previousSentAt = new Date('2020-01-01');

      const modifiedPrescription = genPrescription({
        programmingPlanId: PPVSubmittedProgrammingPlanFixture.id
      });
      await Prescriptions().insert(modifiedPrescription);
      await PrescriptionChanges().insert({
        prescriptionId: modifiedPrescription.id,
        sampleCount: modifiedPrescription.sampleCount + 1,
        previousSampleCount: modifiedPrescription.sampleCount,
        changedAt: new Date('2020-06-01')
      });

      await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: PPVSubmittedProgrammingPlanFixture.id,
          region: 'None'
        })
        .update({
          sentAt: previousSentAt,
          lastModifiedAt: new Date('2020-06-01')
        });
      await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: PPVSubmittedProgrammingPlanFixture.id,
          region: modifiedRegion
        })
        .update({ lastModifiedAt: new Date('2020-06-01') });

      mockSendNotification.mockClear();

      await request(app)
        .post(testRoute)
        .send({
          programmingPlanIds: [
            PPVInProgressProgrammingPlanFixture.id,
            PPVSubmittedProgrammingPlanFixture.id
          ]
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      const inProgressRegionalRows = await ProgrammingPlanLocalStatus()
        .where('programmingPlanId', PPVInProgressProgrammingPlanFixture.id)
        .andWhere('region', '!=', 'None');
      expect(
        inProgressRegionalRows.every(
          (row) => row.status === 'InProgress' && row.sentAt === null
        )
      ).toBe(true);

      const inProgressNationalRow = await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: PPVInProgressProgrammingPlanFixture.id,
          region: 'None'
        })
        .first();
      expect(inProgressNationalRow).toMatchObject({
        status: 'SubmittedToAdmin',
        sentAt: expect.any(Date)
      });

      const updatedNational = await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: PPVSubmittedProgrammingPlanFixture.id,
          region: 'None'
        })
        .first();
      expect(
        new Date(updatedNational?.sentAt as unknown as string).getTime()
      ).toBeGreaterThan(previousSentAt.getTime());

      expect(mockSendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'ProgrammingPlanReadyForAdminReview'
        }),
        expect.anything(),
        expect.anything()
      );
      expect(mockSendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'ProgrammingPlanModifiedAfterSubmission'
        }),
        expect.anything(),
        expect.anything()
      );

      //Cleanup
      await ProgrammingPlanLocalStatus()
        .where('programmingPlanId', PPVSubmittedProgrammingPlanFixture.id)
        .update({ sentAt: null, lastModifiedAt: null });
      await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: PPVInProgressProgrammingPlanFixture.id,
          region: 'None'
        })
        .update({ status: 'InProgress', sentAt: null });
      await Prescriptions().where({ id: modifiedPrescription.id }).delete();
    });
  });

  describe('POST /programming-plans/send-to-departments', () => {
    const testRoute = '/api/programming-plans/send-to-departments';

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .send({
          programmingPlanIds: [DAOAInProgressProgrammingPlanFixture.id]
        })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user is not authorized', async () => {
      await request(app)
        .post(testRoute)
        .send({
          programmingPlanIds: [DAOAInProgressProgrammingPlanFixture.id]
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('first send cascades every department of the region and sets the regional sentAt', async () => {
      await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: DAOAInProgressProgrammingPlanFixture.id,
          region: RegionalCoordinator.region
        })
        .update({ status: 'SubmittedToRegion' });

      mockSendNotification.mockClear();

      const res = await request(app)
        .post(testRoute)
        .send({
          programmingPlanIds: [DAOAInProgressProgrammingPlanFixture.id]
        })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body[0]).toMatchObject({
        id: DAOAInProgressProgrammingPlanFixture.id,
        regionalStatus: expect.arrayContaining([
          expect.objectContaining({
            region: RegionalCoordinator.region,
            status: 'SubmittedToDepartments'
          })
        ])
      });

      await expect(
        ProgrammingPlanLocalStatus()
          .where({
            programmingPlanId: DAOAInProgressProgrammingPlanFixture.id,
            region: RegionalCoordinator.region,
            department: 'None'
          })
          .first()
      ).resolves.toMatchObject({
        status: 'SubmittedToDepartments',
        sentAt: expect.any(Date)
      });

      const departmentRows = await ProgrammingPlanLocalStatus()
        .where('programmingPlanId', DAOAInProgressProgrammingPlanFixture.id)
        .andWhere('region', RegionalCoordinator.region)
        .andWhere('department', '!=', 'None');
      expect(departmentRows.length).toBeGreaterThan(0);
      expect(
        departmentRows.every((row) => row.status === 'SubmittedToDepartments')
      ).toBe(true);

      expect(mockSendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'ProgrammingPlanSubmittedToDepartments'
        }),
        expect.anything(),
        expect.anything()
      );

      //Cleanup
      await ProgrammingPlanLocalStatus()
        .where('programmingPlanId', DAOAInProgressProgrammingPlanFixture.id)
        .andWhere('region', RegionalCoordinator.region)
        .andWhere('department', '!=', 'None')
        .delete();
      await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: DAOAInProgressProgrammingPlanFixture.id,
          region: RegionalCoordinator.region
        })
        .update({ status: 'InProgress', sentAt: null });
    });

    test('a REGIONAL plan is silently ignored (no department cascade)', async () => {
      mockSendNotification.mockClear();

      await request(app)
        .post(testRoute)
        .send({ programmingPlanIds: [PPVInProgressProgrammingPlanFixture.id] })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(mockSendNotification).not.toHaveBeenCalled();
    });

    test('resend after modification only touches the regional sentAt and notifies the modified departments', async () => {
      const departments = Regions[RegionalCoordinator.region].departments;
      const modifiedDepartment = departments[0];
      await ProgrammingPlanLocalStatus().insert(
        departments.map((department) => ({
          programmingPlanId: DAOAValidatedProgrammingPlanFixture.id,
          region: RegionalCoordinator.region,
          department,
          status: 'Validated' as const
        }))
      );

      const modifiedPrescription = genPrescription({
        programmingPlanId: DAOAValidatedProgrammingPlanFixture.id
      });
      await Prescriptions().insert(modifiedPrescription);
      await LocalPrescriptionChanges().insert({
        prescriptionId: modifiedPrescription.id,
        region: RegionalCoordinator.region,
        department: 'None',
        companySiret: 'None',
        echelon: 'Regional',
        kind: 'sampleCount',
        sampleCount: modifiedPrescription.sampleCount + 1,
        previousSampleCount: modifiedPrescription.sampleCount,
        changedAt: new Date('2020-06-01')
      });

      const previousSentAt = new Date('2020-01-01');

      await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: DAOAValidatedProgrammingPlanFixture.id,
          region: RegionalCoordinator.region,
          department: 'None'
        })
        .update({
          sentAt: previousSentAt,
          lastModifiedAt: new Date('2020-06-01')
        });
      await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: DAOAValidatedProgrammingPlanFixture.id,
          region: RegionalCoordinator.region,
          department: modifiedDepartment
        })
        .update({ lastModifiedAt: new Date('2020-06-01') });

      mockSendNotification.mockClear();

      await request(app)
        .post(testRoute)
        .send({
          programmingPlanIds: [DAOAValidatedProgrammingPlanFixture.id]
        })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      const updatedRegional = await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: DAOAValidatedProgrammingPlanFixture.id,
          region: RegionalCoordinator.region,
          department: 'None'
        })
        .first();
      expect(
        new Date(updatedRegional?.sentAt as unknown as string).getTime()
      ).toBeGreaterThan(previousSentAt.getTime());

      const departmentRows = await ProgrammingPlanLocalStatus()
        .where('programmingPlanId', DAOAValidatedProgrammingPlanFixture.id)
        .andWhere('region', RegionalCoordinator.region)
        .andWhere('department', '!=', 'None');
      expect(departmentRows.every((row) => row.status === 'Validated')).toBe(
        true
      );

      expect(mockSendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'ProgrammingPlanModifiedAfterSubmission'
        }),
        expect.anything(),
        expect.anything()
      );

      //Cleanup
      await ProgrammingPlanLocalStatus()
        .where('programmingPlanId', DAOAValidatedProgrammingPlanFixture.id)
        .andWhere('region', RegionalCoordinator.region)
        .andWhere('department', '!=', 'None')
        .delete();
      await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: DAOAValidatedProgrammingPlanFixture.id,
          region: RegionalCoordinator.region,
          department: 'None'
        })
        .update({ sentAt: null, lastModifiedAt: null });
      await Prescriptions().where({ id: modifiedPrescription.id }).delete();
    });
  });

  describe('POST /programming-plans/send-to-samplers', () => {
    const testRoute = '/api/programming-plans/send-to-samplers';

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .send({
          programmingPlanIds: [PPVSubmittedProgrammingPlanFixture.id]
        })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user is not authorized', async () => {
      await request(app)
        .post(testRoute)
        .send({
          programmingPlanIds: [PPVSubmittedProgrammingPlanFixture.id]
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('a SLAUGHTERHOUSE plan is silently ignored', async () => {
      mockSendNotification.mockClear();

      await request(app)
        .post(testRoute)
        .send({
          programmingPlanIds: [DAOAInProgressProgrammingPlanFixture.id]
        })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(mockSendNotification).not.toHaveBeenCalled();
    });

    test('first send validates the region and notifies samplers', async () => {
      mockSendNotification.mockClear();

      const res = await request(app)
        .post(testRoute)
        .send({
          programmingPlanIds: [PPVSubmittedProgrammingPlanFixture.id]
        })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body[0]).toMatchObject({
        id: PPVSubmittedProgrammingPlanFixture.id,
        regionalStatus: expect.arrayContaining([
          expect.objectContaining({
            region: RegionalCoordinator.region,
            status: 'Validated'
          })
        ])
      });

      expect(mockSendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'ProgrammingPlanValidated'
        }),
        expect.anything(),
        expect.anything()
      );

      //Cleanup
      await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: PPVSubmittedProgrammingPlanFixture.id,
          region: RegionalCoordinator.region
        })
        .update({ status: 'SubmittedToRegion' });
    });

    test('resend after modification only notifies national coordinators and samplers', async () => {
      const previousSentAt = new Date('2020-01-01');

      const modifiedPrescription = genPrescription({
        programmingPlanId: PPVValidatedProgrammingPlanFixture.id
      });
      await Prescriptions().insert(modifiedPrescription);
      await LocalPrescriptionChanges().insert({
        prescriptionId: modifiedPrescription.id,
        region: RegionalCoordinator.region,
        department: 'None',
        companySiret: 'None',
        echelon: 'Regional',
        kind: 'sampleCount',
        sampleCount: modifiedPrescription.sampleCount + 1,
        previousSampleCount: modifiedPrescription.sampleCount,
        changedAt: new Date('2020-06-01')
      });

      await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
          region: RegionalCoordinator.region
        })
        .update({
          status: 'Validated',
          sentAt: previousSentAt,
          lastModifiedAt: new Date('2020-06-01')
        });

      mockSendNotification.mockClear();

      await request(app)
        .post(testRoute)
        .send({
          programmingPlanIds: [PPVValidatedProgrammingPlanFixture.id]
        })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(mockSendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'ProgrammingPlanModifiedAfterSubmission'
        }),
        expect.anything(),
        expect.anything()
      );

      //Cleanup
      await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
          region: RegionalCoordinator.region
        })
        .update({ status: 'Validated', sentAt: null, lastModifiedAt: null });
      await Prescriptions().where({ id: modifiedPrescription.id }).delete();
    });

    test('resend after a NATIONAL correction (not Regional-authored) still bumps sentAt and notifies', async () => {
      const previousSentAt = new Date('2020-01-01');
      await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
          region: RegionalCoordinator.region
        })
        .update({ status: 'Validated', sentAt: previousSentAt });

      const modifiedPrescription = genPrescription({
        programmingPlanId: PPVValidatedProgrammingPlanFixture.id
      });
      await Prescriptions().insert(modifiedPrescription);
      await LocalPrescriptionChanges().insert({
        prescriptionId: modifiedPrescription.id,
        region: RegionalCoordinator.region,
        department: 'None',
        companySiret: 'None',
        echelon: 'National',
        kind: 'sampleCount',
        sampleCount: modifiedPrescription.sampleCount + 1,
        previousSampleCount: modifiedPrescription.sampleCount,
        changedAt: new Date()
      });
      await prescriptionDiffusionService.commitPendingNationalChanges(
        PPVValidatedProgrammingPlanFixture.id
      );

      mockSendNotification.mockClear();

      await request(app)
        .post(testRoute)
        .send({
          programmingPlanIds: [PPVValidatedProgrammingPlanFixture.id]
        })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      const updatedRegional = await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
          region: RegionalCoordinator.region
        })
        .first();
      expect(
        new Date(updatedRegional?.sentAt as unknown as string).getTime()
      ).toBeGreaterThan(previousSentAt.getTime());

      expect(mockSendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'ProgrammingPlanModifiedAfterSubmission'
        }),
        expect.anything(),
        expect.anything()
      );

      //Cleanup
      await ProgrammingPlanLocalStatus()
        .where({
          programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
          region: RegionalCoordinator.region
        })
        .update({ status: 'Validated', sentAt: null, lastModifiedAt: null });
      await Prescriptions().where({ id: modifiedPrescription.id }).delete();
    });
  });
});
