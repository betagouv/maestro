import { constants } from 'http2';
import _ from 'lodash';
import fp from 'lodash/fp';
import randomstring from 'randomstring';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import {
  NationalCoordinator,
  RegionalCoordinator,
  Sampler1Fixture
} from '../../../database/seeds/test/001-users';
import { CompanyFixture } from '../../../database/seeds/test/003-companies';
import { LaboratoryFixture } from '../../../database/seeds/test/005-laboratories';
import { MatrixList } from '../../../shared/referential/Matrix/Matrix';
import { Region, RegionList } from '../../../shared/referential/Region';
import { StageList } from '../../../shared/referential/Stage';
import { ProgrammingPlanStatus } from '../../../shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import {
  RegionalPrescription,
  RegionalPrescriptionKey,
  RegionalPrescriptionUpdate
} from '../../../shared/schema/RegionalPrescription/RegionalPrescription';
import { RegionalPrescriptionComment } from '../../../shared/schema/RegionalPrescription/RegionalPrescriptionComment';
import { genLaboratory } from '../../../shared/test/laboratoryFixtures';
import {
  genPrescription,
  genRegionalPrescription
} from '../../../shared/test/prescriptionFixtures';
import { genProgrammingPlan } from '../../../shared/test/programmingPlanFixtures';
import { genCreatedSample } from '../../../shared/test/sampleFixtures';
import { oneOf } from '../../../shared/test/testFixtures';
import { Laboratories } from '../../repositories/laboratoryRepository';
import { Prescriptions } from '../../repositories/prescriptionRepository';
import { ProgrammingPlans } from '../../repositories/programmingPlanRepository';
import { RegionalPrescriptionComments } from '../../repositories/regionalPrescriptionCommentRepository';
import { RegionalPrescriptions } from '../../repositories/regionalPrescriptionRepository';
import {
  formatPartialSample,
  Samples
} from '../../repositories/sampleRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Regional prescriptions router', () => {
  const { app } = createServer();

  const programmingPlanValidated = genProgrammingPlan({
    createdBy: NationalCoordinator.id,
    status: 'Validated' as ProgrammingPlanStatus,
    year: 1920
  });
  const programmingPlanSubmitted = genProgrammingPlan({
    createdBy: NationalCoordinator.id,
    status: 'Submitted' as ProgrammingPlanStatus,
    year: 1921
  });
  const laboratory = genLaboratory();
  const validatedControlPrescription = genPrescription({
    programmingPlanId: programmingPlanValidated.id,
    context: 'Control',
    matrix: oneOf(MatrixList),
    stages: [oneOf(StageList)]
  });
  const submittedControlPrescription = genPrescription({
    programmingPlanId: programmingPlanSubmitted.id,
    context: 'Control',
    matrix: oneOf(MatrixList),
    stages: [oneOf(StageList)]
  });
  const validatedControlRegionalPrescriptions: RegionalPrescription[] =
    RegionList.map((region) => ({
      ...genRegionalPrescription({
        prescriptionId: validatedControlPrescription.id,
        region,
        laboratoryId: laboratory.id
      })
    }));
  const submittedControlRegionalPrescriptions: RegionalPrescription[] =
    RegionList.map((region) => ({
      ...genRegionalPrescription({
        prescriptionId: submittedControlPrescription.id,
        region,
        laboratoryId: laboratory.id
      })
    }));
  const validatedControlPrescriptionComment: RegionalPrescriptionComment = {
    id: uuidv4(),
    prescriptionId: validatedControlPrescription.id,
    region: RegionalCoordinator.region as Region,
    comment: randomstring.generate(),
    createdBy: RegionalCoordinator.id,
    createdAt: new Date()
  };
  const sample = genCreatedSample({
    programmingPlanId: programmingPlanValidated.id,
    prescriptionId: validatedControlPrescription.id,
    region: Sampler1Fixture.region as Region,
    company: CompanyFixture,
    sampler: Sampler1Fixture,
    laboratoryId: LaboratoryFixture.id
  });

  beforeAll(async () => {
    await ProgrammingPlans().insert([
      programmingPlanValidated,
      programmingPlanSubmitted
    ]);
    await Laboratories().insert(laboratory);
    await Prescriptions().insert([
      validatedControlPrescription,
      submittedControlPrescription
    ]);
    await RegionalPrescriptions().insert(
      [
        ...validatedControlRegionalPrescriptions,
        ...submittedControlRegionalPrescriptions
      ].map((_) => fp.omit('realizedSampleCount')(_))
    );
    await RegionalPrescriptionComments().insert([
      validatedControlPrescriptionComment
    ]);
    await Samples().insert(formatPartialSample(sample));
  });

  afterAll(async () => {
    await Prescriptions()
      .delete()
      .where('programmingPlanId', 'in', [
        programmingPlanValidated.id,
        programmingPlanSubmitted.id
      ]);
    await Laboratories().delete().where('id', laboratory.id);
    await ProgrammingPlans()
      .delete()
      .where('id', 'in', [
        programmingPlanValidated.id,
        programmingPlanSubmitted.id
      ]);
    await Samples().delete().where('id', sample.id);
  });

  describe('GET /prescriptions/regions', () => {
    const testRoute = '/api/prescriptions/regions';

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute)
        .query({
          programmingPlanId: programmingPlanSubmitted.id,
          context: 'Control'
        })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid programmingPlan id', async () => {
      await request(app)
        .get(testRoute)
        .query({
          programmingPlanId: randomstring.generate(),
          context: 'Control'
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should get a valid context', async () => {
      await request(app)
        .get(testRoute)
        .query({
          programmingPlanId: programmingPlanSubmitted.id,
          context: 'invalid'
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should find all the regional prescriptions for a national role', async () => {
      const res = await request(app)
        .get(testRoute)
        .query({
          programmingPlanId: programmingPlanSubmitted.id,
          context: 'Control'
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        expect.arrayContaining(
          submittedControlRegionalPrescriptions.map(
            fp.omit('realizedSampleCount')
          )
        )
      );
      expect(res.body).not.toMatchObject(
        expect.arrayContaining(
          validatedControlRegionalPrescriptions.map(
            fp.omit('realizedSampleCount')
          )
        )
      );
    });

    it('should find the regional prescriptions of the programmingPlan with Control context for a regional role', async () => {
      const res = await request(app)
        .get(testRoute)
        .query({
          programmingPlanId: programmingPlanSubmitted.id,
          context: 'Control'
        })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual(
        submittedControlRegionalPrescriptions
          .filter(({ region }) => region === RegionalCoordinator.region)
          .map(fp.omit('realizedSampleCount'))
      );
    });

    it('should retrieve the comments of the prescriptions and realized samples count if requested', async () => {
      const res = await request(app)
        .get(testRoute)
        .query({
          programmingPlanId: programmingPlanValidated.id,
          context: 'Control',
          includes: 'comments,realizedSampleCount'
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual(
        expect.arrayContaining(
          validatedControlRegionalPrescriptions.map((regionalPrescription) => ({
            ...regionalPrescription,
            comments: _.isEqual(
              RegionalPrescriptionKey.parse(regionalPrescription),
              RegionalPrescriptionKey.parse(validatedControlPrescriptionComment)
            )
              ? [
                  {
                    id: validatedControlPrescriptionComment.id,
                    comment: validatedControlPrescriptionComment.comment,
                    createdBy: validatedControlPrescriptionComment.createdBy,
                    createdAt:
                      validatedControlPrescriptionComment.createdAt.toISOString()
                  }
                ]
              : [],
            realizedSampleCount: _.isEqual(
              RegionalPrescriptionKey.parse(regionalPrescription),
              RegionalPrescriptionKey.parse(sample)
            )
              ? 1
              : 0
          }))
        )
      );
    });
  });

  describe('PUT /{prescriptionId}/regions/{region}', () => {
    const regionalPrescriptionUpdate: RegionalPrescriptionUpdate = {
      programmingPlanId: programmingPlanSubmitted.id,
      sampleCount: 10,
      laboratoryId: LaboratoryFixture.id
    };
    const regionalPrescription = submittedControlRegionalPrescriptions.find(
      (regionalPrescription) =>
        _.isEqual(
          RegionalPrescriptionKey.parse(regionalPrescription),
          RegionalPrescriptionKey.parse({
            prescriptionId: submittedControlPrescription.id,
            region: RegionalCoordinator.region as Region
          })
        )
    ) as RegionalPrescription;
    const testRoute = (
      prescriptionId: string = regionalPrescription.prescriptionId,
      region: string = regionalPrescription.region
    ) => `/api/prescriptions/${prescriptionId}/regions/${region}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute())
        .send(regionalPrescriptionUpdate)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should receive valid prescriptionId and region', async () => {
      await request(app)
        .put(testRoute(randomstring.generate()))
        .send(regionalPrescriptionUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await request(app)
        .put(testRoute(submittedControlPrescription.id, 'invalid'))
        .send(regionalPrescriptionUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .put(testRoute())
          .send(payload)
          .use(tokenProvider(NationalCoordinator))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest({ programmingPlanId: undefined });
      await badRequestTest({ programmingPlanId: randomstring.generate() });
      await badRequestTest({ sampleCount: undefined });
      await badRequestTest({ sampleCount: '' });
      await badRequestTest({ sampleCount: 123 });
    });

    it('should fail if the prescription does not exist', async () => {
      await request(app)
        .put(testRoute(uuidv4()))
        .send(regionalPrescriptionUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the prescription does not belong to the programmingPlan', async () => {
      await request(app)
        .put(testRoute())
        .send({
          ...regionalPrescriptionUpdate,
          programmingPlanId: programmingPlanValidated.id
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the user does not have the permission to update prescriptions', async () => {
      await request(app)
        .put(testRoute())
        .send(regionalPrescriptionUpdate)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the programming plan is validated', async () => {
      await request(app)
        .put(
          testRoute(
            validatedControlPrescription.id,
            RegionalCoordinator.region as string
          )
        )
        .send({
          ...regionalPrescriptionUpdate,
          programmingPlanId: programmingPlanValidated.id
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should update the sample count of the prescription for a national coordinator', async () => {
      const res = await request(app)
        .put(testRoute())
        .send(regionalPrescriptionUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual({
        ...regionalPrescription,
        sampleCount: regionalPrescriptionUpdate.sampleCount
      });

      await RegionalPrescriptions()
        .where(RegionalPrescriptionKey.parse(res.body))
        .update({ sampleCount: regionalPrescription.sampleCount });
    });

    it('should update the laboratory of the prescription for a regional coordinator', async () => {
      const res = await request(app)
        .put(testRoute())
        .send(regionalPrescriptionUpdate)
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual({
        ...regionalPrescription,
        laboratoryId: regionalPrescriptionUpdate.laboratoryId
      });
    });
  });

  // describe('POST /{prescriptionId}/regions/{region}/comments', () => {
  //   const validComment: RegionalPrescriptionCommentToCreate = {
  //     programmingPlanId: programmingPlanSubmitted.id,
  //     comment: randomstring.generate(),
  //   };
  //
  //   const getRegionalPrescription = (
  //     regionalPrescriptions: RegionalPrescription[],
  //     region: Region,
  //   ) =>
  //     regionalPrescriptions.find((regionalPrescription) =>
  //       _.isEqual(
  //         RegionalPrescriptionKey.parse(regionalPrescription),
  //         RegionalPrescriptionKey.parse({
  //           prescriptionId: submittedControlPrescription.id,
  //           region,
  //         }),
  //       ),
  //     ) as RegionalPrescription;
  //
  //   const regionalSubmittedPrescription = getRegionalPrescription(
  //     submittedControlRegionalPrescriptions,
  //     RegionalCoordinator.region as Region,
  //   );
  //
  //   const testRoute = (
  //     prescriptionId: string = regionalSubmittedPrescription.prescriptionId,
  //     region: string = regionalSubmittedPrescription.region,
  //   ) => `/api/prescriptions/${prescriptionId}/regions/${region}/comments`;
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
  //       .post(
  //         testRoute(
  //           getRegionalPrescription(
  //             submittedControlRegionalPrescriptions,
  //             Region2Fixture,
  //           ).prescriptionId,
  //           Region2Fixture,
  //         ),
  //       )
  //       .send(validComment)
  //       .use(tokenProvider(RegionalCoordinator))
  //       .expect(constants.HTTP_STATUS_FORBIDDEN);
  //   });
  //
  //   it('should fail if the programming plan is validated', async () => {
  //     await request(app)
  //       .post(
  //         testRoute(
  //           getRegionalPrescription(
  //             validatedControlRegionalPrescriptions,
  //             RegionalCoordinator.region as Region,
  //           ).prescriptionId,
  //         ),
  //       )
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
  //       prescriptionId: regionalSubmittedPrescription.prescriptionId,
  //       region: regionalSubmittedPrescription.region,
  //       comment: validComment.comment,
  //       createdBy: RegionalCoordinator.id,
  //       createdAt: expect.any(String),
  //     });
  //
  //     await expect(
  //       RegionalPrescriptionComments()
  //         .where(RegionalPrescriptionKey.parse(regionalSubmittedPrescription))
  //         .first(),
  //     ).resolves.toMatchObject({
  //       id: res.body.id,
  //       prescriptionId: res.body.prescriptionId,
  //       region: res.body.region,
  //       comment: validComment.comment,
  //       createdBy: RegionalCoordinator.id,
  //     });
  //   });
  // });
});
