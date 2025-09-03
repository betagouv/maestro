import { fakerFR } from '@faker-js/faker';
import { constants } from 'http2';
import { isEqual, omit } from 'lodash-es';
import { MatrixKindEffective } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region, RegionList } from 'maestro-shared/referential/Region';
import {
  RegionalPrescription,
  RegionalPrescriptionUniqueKey,
  RegionalPrescriptionUpdate
} from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import {
  RegionalPrescriptionComment,
  RegionalPrescriptionCommentToCreate
} from 'maestro-shared/schema/RegionalPrescription/RegionalPrescriptionComment';
import { User } from 'maestro-shared/schema/User/User';
import { CompanyFixture } from 'maestro-shared/test/companyFixtures';
import {
  genLaboratory,
  LaboratoryFixture
} from 'maestro-shared/test/laboratoryFixtures';
import {
  genPrescription,
  genRegionalPrescription
} from 'maestro-shared/test/prescriptionFixtures';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import { genCreatedPartialSample } from 'maestro-shared/test/sampleFixtures';
import { oneOf } from 'maestro-shared/test/testFixtures';
import {
  AdminFixture,
  NationalCoordinator,
  NationalObserver,
  Region2Fixture,
  RegionalCoordinator,
  RegionalObserver,
  Sampler1Fixture,
  SamplerAndNationalObserver
} from 'maestro-shared/test/userFixtures';
import { withISOStringDates } from 'maestro-shared/utils/utils';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { Laboratories } from '../../repositories/laboratoryRepository';
import { Prescriptions } from '../../repositories/prescriptionRepository';
import {
  formatProgrammingPlan,
  ProgrammingPlanRegionalStatus,
  ProgrammingPlans
} from '../../repositories/programmingPlanRepository';
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

  const getRegionalPrescription = (
    regionalPrescriptions: RegionalPrescription[],
    prescriptionId: string,
    region: Region
  ) =>
    regionalPrescriptions.find((regionalPrescription) =>
      isEqual(
        RegionalPrescriptionUniqueKey.parse(regionalPrescription),
        RegionalPrescriptionUniqueKey.parse({
          prescriptionId,
          region
        })
      )
    ) as RegionalPrescription;

  const programmingPlanClosed = genProgrammingPlan({
    createdBy: NationalCoordinator.id,
    regionalStatus: RegionList.map((region) => ({
      region,
      status: 'Closed'
    })),
    year: 1919
  });
  const programmingPlanValidated = genProgrammingPlan({
    createdBy: NationalCoordinator.id,
    regionalStatus: RegionList.map((region) => ({
      region,
      status: 'Validated'
    })),
    year: 1920
  });
  const programmingPlanSubmitted = genProgrammingPlan({
    createdBy: NationalCoordinator.id,
    regionalStatus: RegionList.map((region) => ({
      region,
      status: 'Submitted'
    })),
    year: 1921
  });
  const laboratory = genLaboratory();
  const closedControlPrescription = genPrescription({
    programmingPlanId: programmingPlanClosed.id,
    context: 'Control',
    matrixKind: oneOf(MatrixKindEffective.options),
    stages: ['STADE1']
  });
  const validatedControlPrescription = genPrescription({
    programmingPlanId: programmingPlanValidated.id,
    context: 'Control',
    matrixKind: oneOf(MatrixKindEffective.options),
    stages: ['STADE2']
  });
  const submittedControlPrescription1 = genPrescription({
    programmingPlanId: programmingPlanSubmitted.id,
    context: 'Control',
    matrixKind: oneOf(MatrixKindEffective.options),
    stages: ['STADE3', 'STADE4']
  });
  const submittedControlPrescription2 = genPrescription({
    programmingPlanId: programmingPlanSubmitted.id,
    context: 'Control',
    matrixKind: oneOf(MatrixKindEffective.options),
    stages: ['STADE5', 'STADE6', 'STADE8']
  });
  const closedControlRegionalPrescriptions: RegionalPrescription[] =
    RegionList.map((region) => ({
      ...genRegionalPrescription({
        prescriptionId: closedControlPrescription.id,
        region,
        laboratoryId: laboratory.id
      })
    }));
  const validatedControlRegionalPrescriptions: RegionalPrescription[] =
    RegionList.map((region) => ({
      ...genRegionalPrescription({
        prescriptionId: validatedControlPrescription.id,
        region,
        laboratoryId: laboratory.id
      })
    }));
  const submittedControlRegionalPrescriptions1: RegionalPrescription[] =
    RegionList.map((region) => ({
      ...genRegionalPrescription({
        prescriptionId: submittedControlPrescription1.id,
        region,
        laboratoryId: laboratory.id
      })
    }));
  const submittedControlRegionalPrescriptions2: RegionalPrescription[] =
    RegionList.map((region) => ({
      ...genRegionalPrescription({
        prescriptionId: submittedControlPrescription2.id,
        region,
        laboratoryId: laboratory.id,
        sampleCount: 0
      })
    }));
  const closedControlPrescriptionComment1: RegionalPrescriptionComment = {
    id: uuidv4(),
    regionalPrescriptionId: getRegionalPrescription(
      closedControlRegionalPrescriptions,
      closedControlPrescription.id,
      RegionalCoordinator.region as Region
    ).id,
    comment: fakerFR.string.alphanumeric(32),
    createdBy: RegionalCoordinator.id,
    createdAt: new Date()
  };
  const closedControlPrescriptionComment2: RegionalPrescriptionComment = {
    id: uuidv4(),
    regionalPrescriptionId: getRegionalPrescription(
      closedControlRegionalPrescriptions,
      closedControlPrescription.id,
      RegionalCoordinator.region as Region
    ).id,
    comment: fakerFR.string.alphanumeric(32),
    createdBy: NationalCoordinator.id,
    createdAt: new Date()
  };
  const sample = genCreatedPartialSample({
    programmingPlanId: programmingPlanClosed.id,
    prescriptionId: closedControlPrescription.id,
    region: Sampler1Fixture.region as Region,
    company: CompanyFixture,
    sampler: Sampler1Fixture,
    laboratoryId: LaboratoryFixture.id,
    status: 'Sent',
    specificData: {
      programmingPlanKind: 'PPV'
    }
  });

  beforeAll(async () => {
    await ProgrammingPlans().insert(
      [
        programmingPlanClosed,
        programmingPlanValidated,
        programmingPlanSubmitted
      ].map(formatProgrammingPlan)
    );
    await ProgrammingPlanRegionalStatus().insert(
      [
        programmingPlanClosed,
        programmingPlanValidated,
        programmingPlanSubmitted
      ].flatMap((programmingPlan) =>
        programmingPlan.regionalStatus.map((regionalStatus) => ({
          ...regionalStatus,
          programmingPlanId: programmingPlan.id
        }))
      )
    );
    await Laboratories().insert(laboratory);
    await Prescriptions().insert([
      closedControlPrescription,
      validatedControlPrescription,
      submittedControlPrescription1,
      submittedControlPrescription2
    ]);
    await RegionalPrescriptions().insert(
      [
        ...closedControlRegionalPrescriptions,
        ...validatedControlRegionalPrescriptions,
        ...submittedControlRegionalPrescriptions1,
        ...submittedControlRegionalPrescriptions2
      ].map((_) => omit(_, ['realizedSampleCount', 'inProgressSampleCount']))
    );
    await RegionalPrescriptionComments().insert([
      closedControlPrescriptionComment1,
      closedControlPrescriptionComment2
    ]);
    await Samples().insert(formatPartialSample(sample));
  });

  afterAll(async () => {
    await Samples().delete().where('id', sample.id);
    await Prescriptions()
      .delete()
      .where('programmingPlanId', 'in', [
        programmingPlanClosed.id,
        programmingPlanValidated.id,
        programmingPlanSubmitted.id
      ]);
    await Laboratories().delete().where('id', laboratory.id);
    await ProgrammingPlans()
      .delete()
      .where('id', 'in', [
        programmingPlanClosed.id,
        programmingPlanSubmitted.id
      ]);
    await Samples().delete().where('id', sample.id);
  });

  describe('GET /prescriptions/regional', () => {
    const testRoute = '/api/prescriptions/regional';

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute)
        .query({
          programmingPlanId: programmingPlanSubmitted.id,
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
          programmingPlanId: programmingPlanSubmitted.id,
          contexts: 'invalid'
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should find all the regional prescriptions for a national role', async () => {
      const successRequestTest = async (user: User) => {
        const res = await request(app)
          .get(testRoute)
          .query({
            programmingPlanId: programmingPlanSubmitted.id,
            contexts: 'Control'
          })
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_OK);

        const expectRegionalPrescriptions = [
          ...submittedControlRegionalPrescriptions1,
          ...submittedControlRegionalPrescriptions2
        ].map((_) => omit(_, ['realizedSampleCount', 'inProgressSampleCount']));

        expect(res.body).toHaveLength(expectRegionalPrescriptions.length);
        expect(res.body).toEqual(
          expect.arrayContaining(expectRegionalPrescriptions)
        );
      };

      await successRequestTest(NationalCoordinator);
      await successRequestTest(NationalObserver);
      await successRequestTest(SamplerAndNationalObserver);
      await successRequestTest(AdminFixture);
    });

    test('should find the non empty regional prescriptions of the programmingPlan with Control context for a regional role', async () => {
      const successRequestTest = async (user: User) => {
        const res = await request(app)
          .get(testRoute)
          .query({
            programmingPlanId: programmingPlanSubmitted.id,
            contexts: 'Control'
          })
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_OK);

        expect(res.body).toEqual(
          submittedControlRegionalPrescriptions1
            .filter(({ region }) => region === user.region)
            .map((_) =>
              omit(_, ['realizedSampleCount', 'inProgressSampleCount'])
            )
        );
      };

      await successRequestTest(Sampler1Fixture);
      await successRequestTest(RegionalCoordinator);
      await successRequestTest(RegionalObserver);
    });

    test('should retrieve the comments of the prescriptions and realized samples count if requested', async () => {
      const res = await request(app)
        .get(testRoute)
        .query({
          programmingPlanId: programmingPlanClosed.id,
          contexts: 'Control',
          includes: 'comments,sampleCounts'
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual(
        expect.arrayContaining(
          closedControlRegionalPrescriptions.map((regionalPrescription) => ({
            ...regionalPrescription,
            comments:
              regionalPrescription.id ===
              closedControlPrescriptionComment1.regionalPrescriptionId
                ? expect.arrayContaining(
                    [
                      {
                        id: closedControlPrescriptionComment1.id,
                        comment: closedControlPrescriptionComment1.comment,
                        createdBy: closedControlPrescriptionComment1.createdBy,
                        createdAt: closedControlPrescriptionComment1.createdAt
                      },
                      {
                        id: closedControlPrescriptionComment2.id,
                        comment: closedControlPrescriptionComment2.comment,
                        createdBy: closedControlPrescriptionComment2.createdBy,
                        createdAt: closedControlPrescriptionComment2.createdAt
                      }
                    ].map(withISOStringDates)
                  )
                : [],
            realizedSampleCount: isEqual(
              RegionalPrescriptionUniqueKey.parse(regionalPrescription),
              RegionalPrescriptionUniqueKey.parse(sample)
            )
              ? 1
              : 0,
            inProgressSampleCount: 0
          }))
        )
      );
    });
  });

  describe('PUT /prescriptions/regional', () => {
    const submittedRegionalPrescriptionUpdate: RegionalPrescriptionUpdate = {
      programmingPlanId: programmingPlanSubmitted.id,
      sampleCount: 10,
      laboratoryId: LaboratoryFixture.id
    };
    const submittedRegionalPrescription = getRegionalPrescription(
      submittedControlRegionalPrescriptions1,
      submittedControlPrescription1.id,
      RegionalCoordinator.region as Region
    );
    const testRoute = (
      regionalPrescriptionId: string = submittedRegionalPrescription.id
    ) => `/api/prescriptions/regional/${regionalPrescriptionId}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute())
        .send(submittedRegionalPrescriptionUpdate)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should receive valid regionalPrescriptionId ', async () => {
      await request(app)
        .put(testRoute(fakerFR.string.alphanumeric(32)))
        .send(submittedRegionalPrescriptionUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .put(testRoute())
          .send(payload)
          .use(tokenProvider(NationalCoordinator))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest({ programmingPlanId: undefined });
      await badRequestTest({
        programmingPlanId: fakerFR.string.alphanumeric(32)
      });
      await badRequestTest({ sampleCount: undefined });
      await badRequestTest({ sampleCount: '' });
      await badRequestTest({ sampleCount: 123 });
    });

    test('should fail if the prescription does not exist', async () => {
      await request(app)
        .put(testRoute(uuidv4()))
        .send(submittedRegionalPrescriptionUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should fail if the prescription does not belong to the programmingPlan', async () => {
      await request(app)
        .put(testRoute())
        .send({
          ...submittedRegionalPrescriptionUpdate,
          programmingPlanId: programmingPlanClosed.id
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the user does not have the permission to update prescriptions', async () => {
      const forbiddenRequestTest = async (user: User) =>
        request(app)
          .put(testRoute())
          .send(submittedRegionalPrescriptionUpdate)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(RegionalCoordinator);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(SamplerAndNationalObserver);
      await forbiddenRequestTest(AdminFixture);
    });

    test('should fail if the programming plan is closed', async () => {
      const closedRegionalPrescription = getRegionalPrescription(
        closedControlRegionalPrescriptions,
        closedControlPrescription.id,
        RegionalCoordinator.region as Region
      );

      await request(app)
        .put(testRoute(closedRegionalPrescription.id))
        .send({
          ...submittedRegionalPrescriptionUpdate,
          programmingPlanId: programmingPlanClosed.id
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should update the sample count of the prescription for a national coordinator', async () => {
      const res = await request(app)
        .put(testRoute())
        .send(submittedRegionalPrescriptionUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual({
        ...submittedRegionalPrescription,
        sampleCount: submittedRegionalPrescriptionUpdate.sampleCount
      });

      await expect(
        RegionalPrescriptions()
          .where('id', submittedRegionalPrescription.id)
          .first()
      ).resolves.toEqual({
        ...submittedRegionalPrescription,
        sampleCount: submittedRegionalPrescriptionUpdate.sampleCount,
        department: null
      });

      const res1 = await request(app)
        .put(testRoute())
        .send({
          ...submittedRegionalPrescriptionUpdate,
          sampleCount: 0
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res1.body).toEqual({
        ...submittedRegionalPrescription,
        sampleCount: 0
      });

      await expect(
        RegionalPrescriptions()
          .where('id', submittedRegionalPrescription.id)
          .first()
      ).resolves.toEqual({
        ...submittedRegionalPrescription,
        sampleCount: 0,
        department: null
      });

      //Restore the initial value
      await RegionalPrescriptions()
        .where('id', submittedRegionalPrescription.id)
        .update({ sampleCount: submittedRegionalPrescription.sampleCount });
    });

    test('should update the laboratory of the prescription for a regional coordinator', async () => {
      const validatedRegionalPrescriptionUpdate: RegionalPrescriptionUpdate = {
        programmingPlanId: programmingPlanValidated.id,
        laboratoryId: laboratory.id
      };
      const validatedRegionalPrescription =
        validatedControlRegionalPrescriptions.find((regionalPrescription) =>
          isEqual(
            RegionalPrescriptionUniqueKey.parse(regionalPrescription),
            RegionalPrescriptionUniqueKey.parse({
              prescriptionId: validatedControlPrescription.id,
              region: RegionalCoordinator.region as Region
            })
          )
        ) as RegionalPrescription;

      const res = await request(app)
        .put(testRoute(validatedRegionalPrescription.id))
        .send(validatedRegionalPrescriptionUpdate)
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual({
        ...validatedRegionalPrescription,
        laboratoryId: validatedRegionalPrescriptionUpdate.laboratoryId
      });
    });
  });

  describe('POST /prescriptions/regional/:regionalPrescriptionId/comments', () => {
    const validComment: RegionalPrescriptionCommentToCreate = {
      programmingPlanId: programmingPlanSubmitted.id,
      comment: fakerFR.string.alphanumeric(32)
    };

    const regionalSubmittedPrescription = getRegionalPrescription(
      submittedControlRegionalPrescriptions1,
      submittedControlPrescription1.id,
      RegionalCoordinator.region as Region
    );

    const testRoute = (
      regionalPrescriptionId: string = regionalSubmittedPrescription.id
    ) => `/api/prescriptions/regional/${regionalPrescriptionId}/comments`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute())
        .send(validComment)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the prescription does not exist', async () => {
      await request(app)
        .post(testRoute(uuidv4()))
        .send(validComment)
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .post(testRoute())
          .send(payload)
          .use(tokenProvider(RegionalCoordinator))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest({ programmingPlanId: undefined });
      await badRequestTest({
        programmingPlanId: fakerFR.string.alphanumeric(32)
      });
      await badRequestTest({ comment: undefined });
      await badRequestTest({ comment: '' });
      await badRequestTest({ comment: 123 });
    });

    test('should fail if the user does not have the permission to comment prescriptions', async () => {
      const forbiddenRequestTest = async (user: User) =>
        await request(app)
          .post(testRoute())
          .send(validComment)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(SamplerAndNationalObserver);
      await forbiddenRequestTest(AdminFixture);
    });

    test('should fail if the prescription does not belong to the user region', async () => {
      await request(app)
        .post(
          testRoute(
            getRegionalPrescription(
              submittedControlRegionalPrescriptions1,
              submittedControlPrescription1.id,
              Region2Fixture
            ).id
          )
        )
        .send(validComment)
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the programming plan is validated', async () => {
      await request(app)
        .post(
          testRoute(
            getRegionalPrescription(
              validatedControlRegionalPrescriptions,
              validatedControlPrescription.id,
              RegionalCoordinator.region as Region
            ).id
          )
        )
        .send({
          ...validComment,
          programmingPlanId: programmingPlanValidated.id
        })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should add a comment to the prescription', async () => {
      const res = await request(app)
        .post(testRoute())
        .send(validComment)
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        regionalPrescriptionId: regionalSubmittedPrescription.id,
        comment: validComment.comment,
        createdBy: RegionalCoordinator.id,
        createdAt: expect.any(String)
      });

      await expect(
        RegionalPrescriptionComments()
          .where('regionalPrescriptionId', regionalSubmittedPrescription.id)
          .first()
      ).resolves.toMatchObject({
        id: res.body.id,
        regionalPrescriptionId: regionalSubmittedPrescription.id,
        comment: validComment.comment,
        createdBy: RegionalCoordinator.id
      });
    });
  });
});
