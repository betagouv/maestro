import { constants } from 'http2';
import fp from 'lodash/fp';
import randomstring from 'randomstring';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import {
  NationalCoordinator,
  RegionalCoordinator,
} from '../../../database/seeds/test/001-users';
import { MatrixList } from '../../../shared/referential/Matrix/Matrix';
import { Region, RegionList } from '../../../shared/referential/Region';
import { StageList } from '../../../shared/referential/Stage';
import { ProgrammingPlanStatus } from '../../../shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { RegionalPrescription } from '../../../shared/schema/RegionalPrescription/RegionalPrescription';
import { RegionalPrescriptionComment } from '../../../shared/schema/RegionalPrescription/RegionalPrescriptionComment';
import {
  genPrescription,
  genRegionalPrescription,
} from '../../../shared/test/prescriptionFixtures';
import { genProgrammingPlan } from '../../../shared/test/programmingPlanFixtures';
import { genLaboratory, oneOf } from '../../../shared/test/testFixtures';
import { Laboratories } from '../../repositories/laboratoryRepository';
import { Prescriptions } from '../../repositories/prescriptionRepository';
import { ProgrammingPlans } from '../../repositories/programmingPlanRepository';
import { RegionalPrescriptionComments } from '../../repositories/regionalPrescriptionCommentRepository';
import { RegionalPrescriptions } from '../../repositories/regionalPrescriptionRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Regional prescriptions router', () => {
  const { app } = createServer();

  const programmingPlanValidated = genProgrammingPlan({
    createdBy: NationalCoordinator.id,
    status: 'Validated' as ProgrammingPlanStatus,
    year: 1920,
  });
  const programmingPlanSubmitted = genProgrammingPlan({
    createdBy: NationalCoordinator.id,
    status: 'Submitted' as ProgrammingPlanStatus,
    year: 1921,
  });
  const laboratory = genLaboratory();
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
  const validatedControlRegionalPrescriptions: RegionalPrescription[] =
    RegionList.map((region) => ({
      ...genRegionalPrescription({
        prescriptionId: validatedControlPrescription.id,
        region,
        laboratoryId: laboratory.id,
      }),
    }));
  const submittedControlRegionalPrescriptions: RegionalPrescription[] =
    RegionList.map((region) => ({
      ...genRegionalPrescription({
        prescriptionId: submittedControlPrescription.id,
        region,
        laboratoryId: laboratory.id,
      }),
    }));
  const validatedControlPrescriptionComment: RegionalPrescriptionComment = {
    id: uuidv4(),
    prescriptionId: validatedControlPrescription.id,
    region: RegionalCoordinator.region as Region,
    comment: randomstring.generate(),
    createdBy: RegionalCoordinator.id,
    createdAt: new Date(),
  };

  beforeAll(async () => {
    await ProgrammingPlans().insert([
      programmingPlanValidated,
      programmingPlanSubmitted,
    ]);
    await Laboratories().insert(laboratory);
    await Prescriptions().insert([
      validatedControlPrescription,
      submittedControlPrescription,
    ]);
    await RegionalPrescriptions().insert(
      [
        ...validatedControlRegionalPrescriptions,
        ...submittedControlRegionalPrescriptions,
      ].map((_) => fp.omit('realizedSampleCount')(_)),
    );
    await RegionalPrescriptionComments().insert([
      validatedControlPrescriptionComment,
    ]);
  });

  afterAll(async () => {
    await Prescriptions()
      .delete()
      .where('programmingPlanId', 'in', [
        programmingPlanValidated.id,
        programmingPlanSubmitted.id,
      ]);
    await Laboratories().delete().where('id', laboratory.id);
    await ProgrammingPlans()
      .delete()
      .where('id', 'in', [
        programmingPlanValidated.id,
        programmingPlanSubmitted.id,
      ]);
  });

  describe('GET /prescriptions/regions', () => {
    const testRoute = '/api/prescriptions/regions';

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute)
        .query({
          programmingPlanId: programmingPlanValidated.id,
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
          programmingPlanId: programmingPlanValidated.id,
          context: 'invalid',
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should find all the regional prescriptions for a national role', async () => {
      const res = await request(app)
        .get(testRoute)
        .query({
          programmingPlanId: programmingPlanValidated.id,
          context: 'Control',
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        expect.arrayContaining(
          validatedControlRegionalPrescriptions.map(
            fp.omit('realizedSampleCount'),
          ),
        ),
      );
      expect(res.body).not.toMatchObject(
        expect.arrayContaining(
          submittedControlRegionalPrescriptions.map(
            fp.omit('realizedSampleCount'),
          ),
        ),
      );
    });

    it('should find the regional prescriptions of the programmingPlan with Control context for a regional role', async () => {
      const res = await request(app)
        .get(testRoute)
        .query({
          programmingPlanId: programmingPlanValidated.id,
          context: 'Control',
        })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual(
        validatedControlRegionalPrescriptions
          .filter(({ region }) => region === RegionalCoordinator.region)
          .map(fp.omit('realizedSampleCount')),
      );
    });

    it('should retrieve the comments of the prescriptions and sent samples count if requested', async () => {
      const res = await request(app)
        .get(testRoute)
        .query({
          programmingPlanId: programmingPlanValidated.id,
          context: 'Control',
          includes: 'comments,realizedSampleCount',
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual(
        expect.arrayContaining(
          validatedControlRegionalPrescriptions.map((regionalPrescription) => ({
            ...regionalPrescription,
            comments:
              regionalPrescription.prescriptionId ===
                validatedControlPrescriptionComment.prescriptionId &&
              regionalPrescription.region ===
                validatedControlPrescriptionComment.region
                ? [
                    {
                      id: validatedControlPrescriptionComment.id,
                      comment: validatedControlPrescriptionComment.comment,
                      createdBy: validatedControlPrescriptionComment.createdBy,
                      createdAt:
                        validatedControlPrescriptionComment.createdAt.toISOString(),
                    },
                  ]
                : [],
            realizedSampleCount: 0,
          })),
        ),
      );
    });
  });

  // describe('GET /prescriptions/export', () => {
  //   const testRoute = (programmingPlanId: string, context: string) =>
  //     `/api/prescriptions/export?programmingPlanId=${programmingPlanId}&context=${context}`;
  //
  //   it('should fail if the user is not authenticated', async () => {
  //     await request(app)
  //       .get(testRoute(programmingPlanInProgress.id, 'Control'))
  //       .expect(constants.HTTP_STATUS_UNAUTHORIZED);
  //   });
  //
  //   it('should get a valid programmingPlan id', async () => {
  //     await request(app)
  //       .get(`${testRoute(randomstring.generate(), 'Control')}`)
  //       .use(tokenProvider(NationalCoordinator))
  //       .expect(constants.HTTP_STATUS_BAD_REQUEST);
  //   });
  //
  //   it('should get a valid context', async () => {
  //     await request(app)
  //       .get(testRoute(programmingPlanInProgress.id, 'invalid'))
  //       .use(tokenProvider(NationalCoordinator))
  //       .expect(constants.HTTP_STATUS_BAD_REQUEST);
  //   });
  //
  //   it('should export the prescriptions of the programmingPlan with Control context', async () => {
  //     await request(app)
  //       .get(testRoute(programmingPlanInProgress.id, 'Control'))
  //       .use(tokenProvider(NationalCoordinator))
  //       .expect(constants.HTTP_STATUS_OK);
  //   });
  // });
  //
  // describe('POST /prescriptions', () => {
  //   const prescriptionsToCreate = {
  //     programmingPlanId: programmingPlanInProgress.id,
  //     context: 'Control',
  //     prescriptions: genPrescriptions({
  //       programmingPlanId: programmingPlanInProgress.id,
  //     }).map((prescription) =>
  //       fp.pick(['region', 'matrix', 'stages', 'sampleCount'])(prescription)
  //     ),
  //   };
  //   const testRoute = '/api/prescriptions';
  //
  //   it('should fail if the user is not authenticated', async () => {
  //     await request(app)
  //       .post(testRoute)
  //       .send(prescriptionsToCreate)
  //       .expect(constants.HTTP_STATUS_UNAUTHORIZED);
  //   });
  //
  //   it('should receive a valid programmingPlanId', async () => {
  //     await request(app)
  //       .post(testRoute)
  //       .send({
  //         ...prescriptionsToCreate,
  //         programmingPlanId: randomstring.generate(),
  //       })
  //       .use(tokenProvider(NationalCoordinator))
  //       .expect(constants.HTTP_STATUS_BAD_REQUEST);
  //   });
  //
  //   it('should receive a valid context', async () => {
  //     await request(app)
  //       .post(testRoute)
  //       .send({
  //         ...prescriptionsToCreate,
  //         context: 'invalid',
  //       })
  //       .use(tokenProvider(NationalCoordinator))
  //       .expect(constants.HTTP_STATUS_BAD_REQUEST);
  //   });
  //
  //   it('should receive valid prescriptions', async () => {
  //     await request(app)
  //       .post(testRoute)
  //       .send({
  //         ...prescriptionsToCreate,
  //         prescriptions: [
  //           ...prescriptionsToCreate.prescriptions,
  //           {
  //             ...prescriptionsToCreate.prescriptions[0],
  //             sampleCount: 'invalid',
  //           },
  //         ],
  //       })
  //       .use(tokenProvider(NationalCoordinator))
  //       .expect(constants.HTTP_STATUS_BAD_REQUEST);
  //   });
  //
  //   it('should fail if the user does not have the permission to create prescriptions', async () => {
  //     await request(app)
  //       .post(testRoute)
  //       .send(prescriptionsToCreate)
  //       .use(tokenProvider(RegionalCoordinator))
  //       .expect(constants.HTTP_STATUS_FORBIDDEN);
  //   });
  //
  //   it('should fail if the programming plan is validated', async () => {
  //     await request(app)
  //       .post(testRoute)
  //       .send({
  //         ...prescriptionsToCreate,
  //         programmingPlanId: programmingPlanValidated.id,
  //       })
  //       .use(tokenProvider(NationalCoordinator))
  //       .expect(constants.HTTP_STATUS_FORBIDDEN);
  //   });
  //
  //   it('should create the prescriptions', async () => {
  //     const res = await request(app)
  //       .post(testRoute)
  //       .send(prescriptionsToCreate)
  //       .use(tokenProvider(NationalCoordinator))
  //       .expect(constants.HTTP_STATUS_CREATED);
  //
  //     expect(res.body).toMatchObject(
  //       prescriptionsToCreate.prescriptions.map((prescription) => ({
  //         ...prescription,
  //         programmingPlanId: prescriptionsToCreate.programmingPlanId,
  //         context: prescriptionsToCreate.context,
  //         id: expect.any(String),
  //       }))
  //     );
  //
  //     //Cleanup
  //     await Prescriptions()
  //       .whereIn(
  //         'id',
  //         (res.body as Prescription[]).map(({ id }) => id)
  //       )
  //       .delete();
  //   });
  // });
  //
  // describe('PUT /prescriptions/{prescriptionId}', () => {
  //   const prescriptionUpdate: PrescriptionUpdate = {
  //     programmingPlanId: programmingPlanInProgress.id,
  //     context: 'Control',
  //     sampleCount: genNumber(4),
  //     laboratoryId: laboratory.id,
  //   };
  //   const testRoute = (
  //     prescriptionId: string = inProgressControlPrescription[0].id
  //   ) => `/api/prescriptions/${prescriptionId}`;
  //
  //   it('should fail if the user is not authenticated', async () => {
  //     await request(app)
  //       .put(testRoute())
  //       .send(prescriptionUpdate)
  //       .expect(constants.HTTP_STATUS_UNAUTHORIZED);
  //   });
  //
  //   it('should receive valid programmingPlanId and prescriptionId', async () => {
  //     await request(app)
  //       .put(testRoute())
  //       .send({
  //         ...prescriptionUpdate,
  //         programmingPlanId: randomstring.generate(),
  //       })
  //       .use(tokenProvider(NationalCoordinator))
  //       .expect(constants.HTTP_STATUS_BAD_REQUEST);
  //
  //     await request(app)
  //       .put(testRoute(randomstring.generate()))
  //       .send(prescriptionUpdate)
  //       .use(tokenProvider(NationalCoordinator))
  //       .expect(constants.HTTP_STATUS_BAD_REQUEST);
  //   });
  //
  //   it('should fail if the prescription does not exist', async () => {
  //     await request(app)
  //       .put(testRoute(uuidv4()))
  //       .send(prescriptionUpdate)
  //       .use(tokenProvider(NationalCoordinator))
  //       .expect(constants.HTTP_STATUS_NOT_FOUND);
  //   });
  //
  //   it('should fail if the prescription does not belong to the programmingPlan', async () => {
  //     await request(app)
  //       .put(testRoute())
  //       .send({
  //         ...prescriptionUpdate,
  //         programmingPlanId: programmingPlanValidated.id,
  //       })
  //       .use(tokenProvider(NationalCoordinator))
  //       .expect(constants.HTTP_STATUS_FORBIDDEN);
  //   });
  //
  //   it('should fail if the user does not have the permission to update prescriptions', async () => {
  //     await request(app)
  //       .put(testRoute())
  //       .send(prescriptionUpdate)
  //       .use(tokenProvider(Sampler1Fixture))
  //       .expect(constants.HTTP_STATUS_FORBIDDEN);
  //   });
  //
  //   it('should fail if the programming plan is validated', async () => {
  //     await request(app)
  //       .put(testRoute())
  //       .send({
  //         ...prescriptionUpdate,
  //         programmingPlanId: programmingPlanValidated.id,
  //       })
  //       .use(tokenProvider(NationalCoordinator))
  //       .expect(constants.HTTP_STATUS_FORBIDDEN);
  //   });
  //
  //   it('should update the sample count of the prescription for a national coordinator', async () => {
  //     const res = await request(app)
  //       .put(testRoute())
  //       .send(prescriptionUpdate)
  //       .use(tokenProvider(NationalCoordinator))
  //       .expect(constants.HTTP_STATUS_OK);
  //
  //     expect(res.body).toMatchObject({
  //       ...inProgressControlPrescription[0],
  //       sampleCount: prescriptionUpdate.sampleCount,
  //     });
  //   });
  //
  //   it('should update the laboratory of the prescription for a regional coordinator', async () => {
  //     const res = await request(app)
  //       .put(testRoute(inProgressControlPrescription[1].id))
  //       .send(prescriptionUpdate)
  //       .use(tokenProvider(RegionalCoordinator))
  //       .expect(constants.HTTP_STATUS_OK);
  //
  //     expect(res.body).toMatchObject({
  //       ...inProgressControlPrescription[1],
  //       laboratoryId: prescriptionUpdate.laboratoryId,
  //     });
  //   });
  // });
  //
  // describe('POST /prescriptions/{prescriptionId}/comments', () => {
  //   const validComment: PrescriptionCommentToCreate = {
  //     programmingPlanId: programmingPlanSubmitted.id,
  //     comment: randomstring.generate(),
  //   };
  //
  //   const regionalPrescription =
  //     submittedControlPrescription[
  //       RegionList.indexOf(RegionalCoordinator.region as Region)
  //     ];
  //
  //   const testRoute = (prescriptionId: string = regionalPrescription.id) =>
  //     `/api/prescriptions/${prescriptionId}/comments`;
  //
  //   it('should fail if the user is not authenticated', async () => {
  //     await request(app)
  //       .post(testRoute())
  //       .send(validComment)
  //       .expect(constants.HTTP_STATUS_UNAUTHORIZED);
  //   });
  //
  //   it('should fail if the prescription does not exist', async () => {
  //     await request(app)
  //       .post(testRoute(uuidv4()))
  //       .send(validComment)
  //       .use(tokenProvider(RegionalCoordinator))
  //       .expect(constants.HTTP_STATUS_NOT_FOUND);
  //   });
  //
  //   it('should get a valid body', async () => {
  //     const badRequestTest = async (payload?: Record<string, unknown>) =>
  //       request(app)
  //         .post(testRoute())
  //         .send(payload)
  //         .use(tokenProvider(RegionalCoordinator))
  //         .expect(constants.HTTP_STATUS_BAD_REQUEST);
  //
  //     await badRequestTest();
  //     await badRequestTest({ programmingPlanId: undefined });
  //     await badRequestTest({ programmingPlanId: randomstring.generate() });
  //     await badRequestTest({ comment: undefined });
  //     await badRequestTest({ comment: '' });
  //     await badRequestTest({ comment: 123 });
  //   });
  //
  //   it('should fail if the user does not have the permission to comment prescriptions', async () => {
  //     await request(app)
  //       .post(testRoute())
  //       .send(validComment)
  //       .use(tokenProvider(Sampler1Fixture))
  //       .expect(constants.HTTP_STATUS_FORBIDDEN);
  //   });
  //
  //   it('should fail if the prescription does not belong to the user region', async () => {
  //     await request(app)
  //       .post(testRoute(submittedControlPrescription[0].id))
  //       .send(validComment)
  //       .use(tokenProvider(RegionalCoordinator))
  //       .expect(constants.HTTP_STATUS_FORBIDDEN);
  //   });
  //
  //   it('should fail if the programming plan is validated', async () => {
  //     await request(app)
  //       .post(testRoute())
  //       .send({
  //         ...validComment,
  //         programmingPlanId: programmingPlanValidated.id,
  //       })
  //       .use(tokenProvider(RegionalCoordinator))
  //       .expect(constants.HTTP_STATUS_FORBIDDEN);
  //   });
  //
  //   it('should add a comment to the prescription', async () => {
  //     const res = await request(app)
  //       .post(testRoute())
  //       .send(validComment)
  //       .use(tokenProvider(RegionalCoordinator))
  //       .expect(constants.HTTP_STATUS_CREATED);
  //
  //     expect(res.body).toMatchObject({
  //       id: expect.any(String),
  //       prescriptionId: regionalPrescription.id,
  //       comment: validComment.comment,
  //       createdBy: RegionalCoordinator.id,
  //       createdAt: expect.any(String),
  //     });
  //
  //     await expect(
  //       PrescriptionComments()
  //         .where({ prescriptionId: regionalPrescription.id })
  //         .first()
  //     ).resolves.toMatchObject({
  //       id: res.body.id,
  //       prescriptionId: regionalPrescription.id,
  //       comment: validComment.comment,
  //       createdBy: RegionalCoordinator.id,
  //     });
  //   });
  // });
});
