import { fakerFR } from '@faker-js/faker';
import { constants } from 'http2';
import { isEqual, omit } from 'lodash-es';
import { MatrixKindEffective } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region, RegionList } from 'maestro-shared/referential/Region';
import {
  LocalPrescription,
  LocalPrescriptionUpdate
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import {
  LocalPrescriptionComment,
  LocalPrescriptionCommentToCreate
} from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionComment';
import { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import { UserRefined } from 'maestro-shared/schema/User/User';
import { SlaughterhouseCompanyFixture1 } from 'maestro-shared/test/companyFixtures';
import { genLaboratory } from 'maestro-shared/test/laboratoryFixtures';
import {
  genLocalPrescription,
  genPrescription
} from 'maestro-shared/test/prescriptionFixtures';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import { genCreatedPartialSample } from 'maestro-shared/test/sampleFixtures';
import { oneOf } from 'maestro-shared/test/testFixtures';
import {
  AdminFixture,
  DepartmentalCoordinator,
  NationalCoordinator,
  NationalObserver,
  Region2Fixture,
  RegionalCoordinator,
  RegionalObserver,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import { expectArrayToContainElements } from 'maestro-shared/test/utils';
import { withISOStringDates } from 'maestro-shared/utils/date';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { Laboratories } from '../../repositories/laboratoryRepository';
import { LocalPrescriptionComments } from '../../repositories/localPrescriptionCommentRepository';
import {
  formatLocalPrescription,
  LocalPrescriptions
} from '../../repositories/localPrescriptionRepository';
import { LocalPrescriptionSubstanceKindsLaboratories } from '../../repositories/localPrescriptionSubstanceKindLaboratoryRepository';
import { Prescriptions } from '../../repositories/prescriptionRepository';
import {
  formatProgrammingPlan,
  ProgrammingPlanLocalStatus,
  ProgrammingPlans
} from '../../repositories/programmingPlanRepository';
import {
  formatPartialSample,
  Samples
} from '../../repositories/sampleRepository';
import { createServer } from '../../server';
import { mockSendNotification } from '../../test/setupTests';
import { tokenProvider } from '../../test/testUtils';

describe('Local prescriptions router', () => {
  const { app } = createServer();

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
      status: 'SubmittedToRegion'
    })),
    year: 1921
  });
  const laboratory = genLaboratory();
  const substanceKindsLaboratories = [
    {
      substanceKind: 'Any' as const,
      laboratoryId: laboratory.id
    }
  ];
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
  const closedControlLocalPrescriptions: LocalPrescription[] = RegionList.map(
    (region) => ({
      ...genLocalPrescription({
        prescriptionId: closedControlPrescription.id,
        region
      })
    })
  );
  const validatedControlLocalPrescriptions: LocalPrescription[] =
    RegionList.map((region) => ({
      ...genLocalPrescription({
        prescriptionId: validatedControlPrescription.id,
        region,
        substanceKindsLaboratories
      })
    }));
  const submittedControlLocalPrescriptions1: LocalPrescription[] =
    RegionList.map((region) => ({
      ...genLocalPrescription({
        prescriptionId: submittedControlPrescription1.id,
        region,
        substanceKindsLaboratories
      })
    }));
  const submittedControlLocalPrescriptions2: LocalPrescription[] =
    RegionList.map((region) => ({
      ...genLocalPrescription({
        prescriptionId: submittedControlPrescription2.id,
        region,
        substanceKindsLaboratories,
        sampleCount: 0
      })
    }));
  const closedControlPrescriptionComment1: LocalPrescriptionComment = {
    id: uuidv4(),
    prescriptionId: closedControlPrescription.id,
    region: RegionalCoordinator.region as Region,
    comment: fakerFR.string.alphanumeric(32),
    createdBy: RegionalCoordinator.id,
    createdAt: new Date()
  };
  const closedControlPrescriptionComment2: LocalPrescriptionComment = {
    id: uuidv4(),
    prescriptionId: closedControlPrescription.id,
    region: RegionalCoordinator.region as Region,
    comment: fakerFR.string.alphanumeric(32),
    createdBy: NationalCoordinator.id,
    createdAt: new Date()
  };
  const sample = genCreatedPartialSample({
    programmingPlanId: programmingPlanClosed.id,
    prescriptionId: closedControlPrescription.id,
    region: Sampler1Fixture.region as Region,
    company: SlaughterhouseCompanyFixture1,
    sampler: Sampler1Fixture,
    status: 'Sent',
    specificData: {
      programmingPlanKind: 'PPV'
    }
  });
  const submittedControlLocalPrescriptionWithCompany: LocalPrescription =
    genLocalPrescription({
      prescriptionId: submittedControlPrescription1.id,
      region: RegionalCoordinator.region as Region,
      department: '01',
      companySiret: SlaughterhouseCompanyFixture1.siret,
      substanceKindsLaboratories
    });

  beforeAll(async () => {
    await ProgrammingPlans().insert(
      [
        programmingPlanClosed,
        programmingPlanValidated,
        programmingPlanSubmitted
      ].map(formatProgrammingPlan)
    );
    await ProgrammingPlanLocalStatus().insert(
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
    await LocalPrescriptions().insert(
      [
        ...closedControlLocalPrescriptions,
        ...validatedControlLocalPrescriptions,
        ...submittedControlLocalPrescriptions1,
        ...submittedControlLocalPrescriptions2,
        submittedControlLocalPrescriptionWithCompany
      ].map((_) =>
        omit(formatLocalPrescription(_), [
          'substanceKindsLaboratories',
          'realizedSampleCount',
          'inProgressSampleCount'
        ])
      )
    );
    await LocalPrescriptionSubstanceKindsLaboratories().insert(
      [
        ...closedControlLocalPrescriptions,
        ...validatedControlLocalPrescriptions,
        ...submittedControlLocalPrescriptions1,
        ...submittedControlLocalPrescriptions2,
        submittedControlLocalPrescriptionWithCompany
      ].flatMap((localPrescription) =>
        (localPrescription.substanceKindsLaboratories ?? []).map(
          (substanceKindLaboratory) => ({
            prescriptionId: localPrescription.prescriptionId,
            region: localPrescription.region,
            department: localPrescription.department ?? 'None',
            substanceKind: substanceKindLaboratory.substanceKind,
            laboratoryId: substanceKindLaboratory.laboratoryId
          })
        )
      )
    );
    await LocalPrescriptionComments().insert([
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

  describe('GET /prescriptions/regions', () => {
    const testRoute = '/api/prescriptions/regions';

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

    test('should find all the local prescriptions for a national role', async () => {
      const successRequestTest = async (user: UserRefined) => {
        const res = await request(app)
          .get(testRoute)
          .query({
            programmingPlanId: programmingPlanSubmitted.id,
            contexts: 'Control'
          })
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_OK);

        const expectLocalPrescriptions = [
          ...submittedControlLocalPrescriptions1,
          ...submittedControlLocalPrescriptions2
        ].map((_) =>
          omit(_, [
            'realizedSampleCount',
            'inProgressSampleCount',
            'substanceKindsLaboratories'
          ])
        );

        expect(res.body).toHaveLength(expectLocalPrescriptions.length);
        expectArrayToContainElements(res.body, expectLocalPrescriptions);
      };

      await successRequestTest(NationalCoordinator);
      await successRequestTest(NationalObserver);
      await successRequestTest(AdminFixture);
    });

    test('should find the non empty local prescriptions with laboratories of the programmingPlan with Control context for a regional role', async () => {
      const successRequestTest = async (user: UserRefined) => {
        const res = await request(app)
          .get(testRoute)
          .query({
            programmingPlanId: programmingPlanSubmitted.id,
            contexts: 'Control',
            includes: 'laboratories'
          })
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_OK);

        expect(res.body).toEqual(
          submittedControlLocalPrescriptions1
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

      expectArrayToContainElements(
        res.body,
        closedControlLocalPrescriptions.map((localPrescription) => ({
          ...localPrescription,
          comments: isEqual(
            LocalPrescriptionKey.parse(localPrescription),
            LocalPrescriptionKey.parse(closedControlPrescriptionComment1)
          )
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
            LocalPrescriptionKey.parse(localPrescription),
            LocalPrescriptionKey.parse(sample)
          )
            ? 1
            : 0,
          inProgressSampleCount: 0,
          notAdmissibleSampleCount: 0
        }))
      );
    });
  });

  describe('PUT /{prescriptionId}/regions/{region}', () => {
    const submittedLocalPrescriptionUpdate: LocalPrescriptionUpdate = {
      programmingPlanId: programmingPlanSubmitted.id,
      key: 'sampleCount',
      sampleCount: 10
    };
    const submittedLocalPrescription = submittedControlLocalPrescriptions1.find(
      (localPrescription) =>
        isEqual(
          LocalPrescriptionKey.parse(localPrescription),
          LocalPrescriptionKey.parse({
            prescriptionId: submittedControlPrescription1.id,
            region: RegionalCoordinator.region as Region
          })
        )
    ) as LocalPrescription;
    const testRoute = (
      prescriptionId: string = submittedLocalPrescription.prescriptionId,
      region: string = submittedLocalPrescription.region
    ) => `/api/prescriptions/${prescriptionId}/regions/${region}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute())
        .send(submittedLocalPrescriptionUpdate)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });
    test('should receive valid prescriptionId and region', async () => {
      await request(app)
        .put(testRoute(fakerFR.string.alphanumeric(32)))
        .send(submittedLocalPrescriptionUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await request(app)
        .put(testRoute(submittedControlPrescription1.id, 'invalid'))
        .send(submittedLocalPrescriptionUpdate)
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
        .send(submittedLocalPrescriptionUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should fail if the prescription does not belong to the programmingPlan', async () => {
      await request(app)
        .put(testRoute())
        .send({
          ...submittedLocalPrescriptionUpdate,
          programmingPlanId: programmingPlanClosed.id
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the user does not have the permission to update prescriptions', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .put(testRoute())
          .send(submittedLocalPrescriptionUpdate)
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
        .put(
          testRoute(
            closedControlPrescription.id,
            RegionalCoordinator.region as string
          )
        )
        .send({
          ...submittedLocalPrescriptionUpdate,
          programmingPlanId: programmingPlanClosed.id
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should update the sample count of the prescription for a national coordinator', async () => {
      const res = await request(app)
        .put(testRoute())
        .send(submittedLocalPrescriptionUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual({
        ...submittedLocalPrescription,
        sampleCount: submittedLocalPrescriptionUpdate.sampleCount,
        substanceKindsLaboratories: undefined
      });

      await expect(
        LocalPrescriptions()
          .where('prescription_id', submittedLocalPrescription.prescriptionId)
          .andWhere('region', submittedLocalPrescription.region)
          .andWhere('department', 'None')
          .andWhere('company_siret', 'None')
          .first()
      ).resolves.toEqual({
        ...submittedLocalPrescription,
        department: 'None',
        companySiret: 'None',
        sampleCount: submittedLocalPrescriptionUpdate.sampleCount,
        substanceKindsLaboratories: undefined
      });

      const res1 = await request(app)
        .put(testRoute())
        .send({
          ...submittedLocalPrescriptionUpdate,
          sampleCount: 0
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res1.body).toEqual({
        ...submittedLocalPrescription,
        sampleCount: 0,
        substanceKindsLaboratories: undefined
      });

      await expect(
        LocalPrescriptions()
          .where('prescription_id', submittedLocalPrescription.prescriptionId)
          .andWhere('region', submittedLocalPrescription.region)
          .andWhere('department', 'None')
          .andWhere('company_siret', 'None')
          .first()
      ).resolves.toEqual({
        ...submittedLocalPrescription,
        department: 'None',
        companySiret: 'None',
        sampleCount: 0,
        substanceKindsLaboratories: undefined
      });

      //Restore the initial value
      await LocalPrescriptions()
        .where('prescription_id', submittedLocalPrescription.prescriptionId)
        .andWhere('region', submittedLocalPrescription.region)
        .andWhere('department', 'None')
        .andWhere('company_siret', 'None')
        .update({ sampleCount: submittedLocalPrescription.sampleCount });
    });

    test('should update the substances laboratories of the prescription for a regional coordinator', async () => {
      const validatedLocalPrescription =
        validatedControlLocalPrescriptions.find((localPrescription) =>
          isEqual(
            LocalPrescriptionKey.parse(localPrescription),
            LocalPrescriptionKey.parse({
              prescriptionId: validatedControlPrescription.id,
              region: RegionalCoordinator.region as Region
            })
          )
        ) as LocalPrescription;

      await request(app)
        .put(
          testRoute(
            validatedLocalPrescription.prescriptionId,
            validatedLocalPrescription.region
          )
        )
        .send({
          programmingPlanId: programmingPlanValidated.id,
          key: 'laboratories',
          substanceKindsLaboratories: []
        })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      await expect(
        LocalPrescriptionSubstanceKindsLaboratories().where(
          LocalPrescriptionKey.parse(validatedLocalPrescription)
        )
      ).resolves.toEqual([]);

      await request(app)
        .put(
          testRoute(
            validatedLocalPrescription.prescriptionId,
            validatedLocalPrescription.region
          )
        )
        .send({
          programmingPlanId: programmingPlanValidated.id,
          key: 'laboratories',
          substanceKindsLaboratories
        })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      await expect(
        LocalPrescriptionSubstanceKindsLaboratories().where(
          LocalPrescriptionKey.parse(validatedLocalPrescription)
        )
      ).resolves.toEqual([
        {
          prescriptionId: validatedLocalPrescription.prescriptionId,
          region: validatedLocalPrescription.region,
          department: 'None',
          substanceKind: 'Any',
          laboratoryId: laboratory.id
        }
      ]);
    });
  });

  //TODO
  // describe('PUT /{prescriptionId}/regions/{region}/departments/{department}', () => {
  //   const submittedLocalPrescriptionUpdate: LocalPrescriptionUpdate = {
  //     programmingPlanId: programmingPlanSubmitted.id,
  //     key: 'sampleCount',
  //     sampleCount: 10
  //   };
  //   const submittedLocalPrescription = submittedControlLocalPrescriptions1.find(
  //     (localPrescription) =>
  //       isEqual(
  //         LocalPrescriptionKey.parse(localPrescription),
  //         LocalPrescriptionKey.parse({
  //           prescriptionId: submittedControlPrescription1.id,
  //           region: RegionalCoordinator.region as Region
  //         })
  //       )
  //   ) as LocalPrescription;
  //   const testRoute = (
  //     prescriptionId: string = submittedLocalPrescription.prescriptionId,
  //     region: string = submittedLocalPrescription.region
  //   ) => `/api/prescriptions/${prescriptionId}/regions/${region}`;
  //
  //   test('should fail if the user is not authenticated', async () => {
  //     await request(app)
  //       .put(testRoute())
  //       .send(submittedLocalPrescriptionUpdate)
  //       .expect(constants.HTTP_STATUS_UNAUTHORIZED);
  //   });
  //
  //   test('should receive valid prescriptionId and region', async () => {
  //     await request(app)
  //       .put(testRoute(fakerFR.string.alphanumeric(32)))
  //       .send(submittedLocalPrescriptionUpdate)
  //       .use(tokenProvider(NationalCoordinator))
  //       .expect(constants.HTTP_STATUS_BAD_REQUEST);
  //
  //     await request(app)
  //       .put(testRoute(submittedControlPrescription1.id, 'invalid'))
  //       .send(submittedLocalPrescriptionUpdate)
  //       .use(tokenProvider(NationalCoordinator))
  //       .expect(constants.HTTP_STATUS_BAD_REQUEST);
  //   });
  //
  //   test('should get a valid body', async () => {
  //     const badRequestTest = async (payload?: Record<string, unknown>) =>
  //       request(app)
  //         .put(testRoute())
  //         .send(payload)
  //         .use(tokenProvider(NationalCoordinator))
  //         .expect(constants.HTTP_STATUS_BAD_REQUEST);
  //
  //     await badRequestTest();
  //     await badRequestTest({ programmingPlanId: undefined });
  //     await badRequestTest({
  //       programmingPlanId: fakerFR.string.alphanumeric(32)
  //     });
  //     await badRequestTest({ sampleCount: undefined });
  //     await badRequestTest({ sampleCount: '' });
  //     await badRequestTest({ sampleCount: 123 });
  //   });
  //
  //   test('should fail if the prescription does not exist', async () => {
  //     await request(app)
  //       .put(testRoute(uuidv4()))
  //       .send(submittedLocalPrescriptionUpdate)
  //       .use(tokenProvider(NationalCoordinator))
  //       .expect(constants.HTTP_STATUS_NOT_FOUND);
  //   });
  //
  //   test('should fail if the prescription does not belong to the programmingPlan', async () => {
  //     await request(app)
  //       .put(testRoute())
  //       .send({
  //         ...submittedLocalPrescriptionUpdate,
  //         programmingPlanId: programmingPlanClosed.id
  //       })
  //       .use(tokenProvider(NationalCoordinator))
  //       .expect(constants.HTTP_STATUS_FORBIDDEN);
  //   });
  //
  //   test('should fail if the user does not have the permission to update prescriptions', async () => {
  //     const forbiddenRequestTest = async (user: User) =>
  //       request(app)
  //         .put(testRoute())
  //         .send(submittedLocalPrescriptionUpdate)
  //         .use(tokenProvider(user))
  //         .expect(constants.HTTP_STATUS_FORBIDDEN);
  //
  //     await forbiddenRequestTest(Sampler1Fixture);
  //     await forbiddenRequestTest(RegionalObserver);
  //     await forbiddenRequestTest(RegionalCoordinator);
  //     await forbiddenRequestTest(NationalObserver);
  //     await forbiddenRequestTest(SamplerAndNationalObserver);
  //     await forbiddenRequestTest(AdminFixture);
  //   });
  //
  //   test('should fail if the programming plan is closed', async () => {
  //     await request(app)
  //       .put(
  //         testRoute(
  //           closedControlPrescription.id,
  //           RegionalCoordinator.region as string
  //         )
  //       )
  //       .send({
  //         ...submittedLocalPrescriptionUpdate,
  //         programmingPlanId: programmingPlanClosed.id
  //       })
  //       .use(tokenProvider(NationalCoordinator))
  //       .expect(constants.HTTP_STATUS_FORBIDDEN);
  //   });
  //
  //   test('should update the sample count of the prescription for a national coordinator', async () => {
  //     const res = await request(app)
  //       .put(testRoute())
  //       .send(submittedLocalPrescriptionUpdate)
  //       .use(tokenProvider(NationalCoordinator))
  //       .expect(constants.HTTP_STATUS_OK);
  //
  //     expect(res.body).toEqual({
  //       ...submittedLocalPrescription,
  //       sampleCount: submittedLocalPrescriptionUpdate.sampleCount
  //     });
  //
  //     await expect(
  //       LocalPrescriptions().where(LocalPrescriptionKey.parse(res.body)).first()
  //     ).resolves.toEqual({
  //       ...submittedLocalPrescription,
  //       department: 'None',
  //       sampleCount: submittedLocalPrescriptionUpdate.sampleCount
  //     });
  //
  //     const res1 = await request(app)
  //       .put(testRoute())
  //       .send({
  //         ...submittedLocalPrescriptionUpdate,
  //         sampleCount: 0
  //       })
  //       .use(tokenProvider(NationalCoordinator))
  //       .expect(constants.HTTP_STATUS_OK);
  //
  //     expect(res1.body).toEqual({
  //       ...submittedLocalPrescription,
  //       sampleCount: 0
  //     });
  //
  //     await expect(
  //       LocalPrescriptions().where(LocalPrescriptionKey.parse(res.body)).first()
  //     ).resolves.toEqual({
  //       ...submittedLocalPrescription,
  //       department: 'None',
  //       sampleCount: 0
  //     });
  //
  //     //Restore the initial value
  //     await LocalPrescriptions()
  //       .where(LocalPrescriptionKey.parse(res.body))
  //       .update({ sampleCount: submittedLocalPrescription.sampleCount });
  //   });
  //
  //   test('should update the laboratory of the prescription for a regional coordinator', async () => {
  //     const validatedLocalPrescriptionUpdate: LocalPrescriptionUpdate = {
  //       programmingPlanId: programmingPlanValidated.id,
  //       key: 'laboratory',
  //       laboratoryId: laboratory.id
  //     };
  //     const validatedLocalPrescription =
  //       validatedControlLocalPrescriptions.find((localPrescription) =>
  //         isEqual(
  //           LocalPrescriptionKey.parse(localPrescription),
  //           LocalPrescriptionKey.parse({
  //             prescriptionId: validatedControlPrescription.id,
  //             region: RegionalCoordinator.region as Region
  //           })
  //         )
  //       ) as LocalPrescription;
  //
  //     const res = await request(app)
  //       .put(
  //         testRoute(
  //           validatedLocalPrescription.prescriptionId,
  //           validatedLocalPrescription.region
  //         )
  //       )
  //       .send(validatedLocalPrescriptionUpdate)
  //       .use(tokenProvider(RegionalCoordinator))
  //       .expect(constants.HTTP_STATUS_OK);
  //
  //     expect(res.body).toEqual({
  //       ...validatedLocalPrescription,
  //       laboratoryId: validatedLocalPrescriptionUpdate.laboratoryId
  //     });
  //   });
  // });

  describe('POST /{prescriptionId}/regions/{region}/comments', () => {
    const validComment: LocalPrescriptionCommentToCreate = {
      programmingPlanId: programmingPlanSubmitted.id,
      comment: fakerFR.string.alphanumeric(32)
    };

    const getLocalPrescription = (
      regionalPrescriptions: LocalPrescription[],
      prescriptionId: string,
      region: Region
    ) =>
      regionalPrescriptions.find((localPrescription) =>
        isEqual(
          LocalPrescriptionKey.parse(localPrescription),
          LocalPrescriptionKey.parse({
            prescriptionId,
            region
          })
        )
      ) as LocalPrescription;

    const regionalSubmittedPrescription = getLocalPrescription(
      submittedControlLocalPrescriptions1,
      submittedControlPrescription1.id,
      RegionalCoordinator.region as Region
    );

    const testRoute = (
      prescriptionId: string = regionalSubmittedPrescription.prescriptionId,
      region: string = regionalSubmittedPrescription.region
    ) => `/api/prescriptions/${prescriptionId}/regions/${region}/comments`;

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

      await badRequestTest();
      await badRequestTest({ programmingPlanId: undefined });
      await badRequestTest({
        programmingPlanId: fakerFR.string.alphanumeric(32)
      });
      await badRequestTest({ comment: undefined });
      await badRequestTest({ comment: '' });
      await badRequestTest({ comment: 123 });
    });

    test('should fail if the user does not have the permission to comment prescriptions', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        await request(app)
          .post(testRoute())
          .send(validComment)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(AdminFixture);
    });

    test('should fail if the prescription does not belong to the user region', async () => {
      await request(app)
        .post(
          testRoute(
            getLocalPrescription(
              submittedControlLocalPrescriptions1,
              submittedControlPrescription1.id,
              Region2Fixture
            ).prescriptionId,
            Region2Fixture
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
            getLocalPrescription(
              validatedControlLocalPrescriptions,
              validatedControlPrescription.id,
              RegionalCoordinator.region as Region
            ).prescriptionId
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
        prescriptionId: regionalSubmittedPrescription.prescriptionId,
        region: regionalSubmittedPrescription.region,
        comment: validComment.comment,
        createdBy: RegionalCoordinator.id,
        createdAt: expect.any(String)
      });

      await expect(
        LocalPrescriptionComments()
          .where(LocalPrescriptionKey.parse(regionalSubmittedPrescription))
          .first()
      ).resolves.toMatchObject({
        id: res.body.id,
        prescriptionId: res.body.prescriptionId,
        region: res.body.region,
        comment: validComment.comment,
        createdBy: RegionalCoordinator.id
      });
    });

    test('should send notification when adding a comment', async () => {
      mockSendNotification.mockClear();

      await request(app)
        .post(testRoute())
        .send(validComment)
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(mockSendNotification).toHaveBeenCalledTimes(1);

      const [notificationData, recipients, params] =
        mockSendNotification.mock.calls[0];

      expect(recipients).toHaveLength(1);
      expect(recipients[0]).toMatchObject({
        id: NationalCoordinator.id,
        roles: ['NationalCoordinator']
      });

      expect(notificationData).toMatchObject({
        category: submittedControlPrescription1.context,
        author: RegionalCoordinator,
        link: expect.stringContaining(submittedControlPrescription1.id)
      });

      expect(params).toMatchObject({
        comment: validComment.comment,
        author: RegionalCoordinator.name
      });
    });
  });

  describe('POST /{prescriptionId}/regions/{region}/departments/{department}/comments', () => {
    const validComment: LocalPrescriptionCommentToCreate = {
      programmingPlanId: programmingPlanSubmitted.id,
      comment: fakerFR.string.alphanumeric(32)
    };

    const departmentalPrescription = genLocalPrescription({
      prescriptionId: submittedControlPrescription1.id,
      region: DepartmentalCoordinator.region as Region,
      department: DepartmentalCoordinator.department,
      substanceKindsLaboratories
    });

    const testRoute = (
      prescriptionId: string = departmentalPrescription.prescriptionId,
      region: string = departmentalPrescription.region,
      department: string = departmentalPrescription.department as string
    ) =>
      `/api/prescriptions/${prescriptionId}/regions/${region}/departments/${department}/comments`;

    test('should send notification when adding a departmental comment as DepartmentalCoordinator', async () => {
      await LocalPrescriptions().insert(
        omit(formatLocalPrescription(departmentalPrescription), [
          'substanceKindsLaboratories',
          'realizedSampleCount',
          'inProgressSampleCount'
        ])
      );

      mockSendNotification.mockClear();

      await request(app)
        .post(testRoute())
        .send(validComment)
        .use(tokenProvider(DepartmentalCoordinator))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(mockSendNotification).toHaveBeenCalledTimes(1);

      const [notificationData, recipients, params] =
        mockSendNotification.mock.calls[0];

      expect(recipients).toHaveLength(1);
      expect(recipients[0]).toMatchObject({
        id: RegionalCoordinator.id,
        roles: ['RegionalCoordinator']
      });

      expect(notificationData).toMatchObject({
        category: submittedControlPrescription1.context,
        author: DepartmentalCoordinator,
        link: expect.stringContaining(submittedControlPrescription1.id)
      });

      expect(params).toMatchObject({
        comment: validComment.comment,
        author: DepartmentalCoordinator.name
      });

      await LocalPrescriptionComments()
        .where('prescription_id', departmentalPrescription.prescriptionId)
        .andWhere('region', departmentalPrescription.region)
        .andWhere('department', departmentalPrescription.department)
        .delete();

      await LocalPrescriptions()
        .where('prescription_id', departmentalPrescription.prescriptionId)
        .andWhere('region', departmentalPrescription.region)
        .andWhere('department', departmentalPrescription.department)
        .andWhere('company_siret', 'None')
        .delete();
    });
  });

  describe('GET /prescriptions/:prescriptionId/regions/:region', () => {
    const submittedLocalPrescription = submittedControlLocalPrescriptions1.find(
      (localPrescription) =>
        isEqual(
          LocalPrescriptionKey.parse(localPrescription),
          LocalPrescriptionKey.parse({
            prescriptionId: submittedControlPrescription1.id,
            region: RegionalCoordinator.region as Region
          })
        )
    ) as LocalPrescription;

    const testRoute = (
      prescriptionId: string = submittedLocalPrescription.prescriptionId,
      region: string = submittedLocalPrescription.region
    ) => `/api/prescriptions/${prescriptionId}/regions/${region}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute())
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should receive valid prescriptionId and region', async () => {
      await request(app)
        .get(testRoute(fakerFR.string.alphanumeric(32)))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await request(app)
        .get(testRoute(submittedControlPrescription1.id, 'invalid'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the prescription does not exist', async () => {
      await request(app)
        .get(testRoute(uuidv4()))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should get the regional prescription for a national role', async () => {
      const successRequestTest = async (user: UserRefined) => {
        const res = await request(app)
          .get(testRoute())
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_OK);

        expect(res.body).toEqual({
          ...submittedLocalPrescription,
          substanceKindsLaboratories: undefined
        });
      };

      await successRequestTest(NationalCoordinator);
      await successRequestTest(NationalObserver);
      await successRequestTest(AdminFixture);
    });

    test('should get the regional prescription with laboratories when requested', async () => {
      const validatedLocalPrescription =
        validatedControlLocalPrescriptions.find((localPrescription) =>
          isEqual(
            LocalPrescriptionKey.parse(localPrescription),
            LocalPrescriptionKey.parse({
              prescriptionId: validatedControlPrescription.id,
              region: RegionalCoordinator.region as Region
            })
          )
        ) as LocalPrescription;

      const res = await request(app)
        .get(
          testRoute(
            validatedLocalPrescription.prescriptionId,
            validatedLocalPrescription.region
          )
        )
        .query({ includes: 'laboratories' })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual(validatedLocalPrescription);
    });
  });

  describe('GET /prescriptions/:prescriptionId/regions/:region/departments/:department/companies/:companySiret', () => {
    const submittedLocalPrescription = submittedControlLocalPrescriptions1.find(
      (localPrescription) =>
        isEqual(
          LocalPrescriptionKey.parse(localPrescription),
          LocalPrescriptionKey.parse({
            prescriptionId: submittedControlPrescription1.id,
            region: RegionalCoordinator.region as Region
          })
        )
    ) as LocalPrescription;

    const testRoute = (
      prescriptionId: string = submittedLocalPrescription.prescriptionId,
      region: string = submittedLocalPrescription.region,
      department: string = '01',
      companySiret: string = SlaughterhouseCompanyFixture1.siret
    ) =>
      `/api/prescriptions/${prescriptionId}/regions/${region}/departments/${department}/companies/${companySiret}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute())
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should receive valid prescriptionId, region, department and companySiret', async () => {
      await request(app)
        .get(
          testRoute(
            fakerFR.string.alphanumeric(32),
            RegionalCoordinator.region as string,
            '01',
            SlaughterhouseCompanyFixture1.siret
          )
        )
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await request(app)
        .get(
          testRoute(
            submittedControlPrescription1.id,
            'invalid',
            '01',
            SlaughterhouseCompanyFixture1.siret
          )
        )
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await request(app)
        .get(
          testRoute(
            submittedControlPrescription1.id,
            RegionalCoordinator.region as string,
            'invalid',
            SlaughterhouseCompanyFixture1.siret
          )
        )
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the prescription does not exist', async () => {
      await request(app)
        .get(
          testRoute(
            uuidv4(),
            RegionalCoordinator.region as string,
            '01',
            SlaughterhouseCompanyFixture1.siret
          )
        )
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should get the local prescription for a company', async () => {
      const successRequestTest = async (user: UserRefined) => {
        const res = await request(app)
          .get(testRoute())
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_OK);

        expect(res.body).toMatchObject({
          prescriptionId: submittedLocalPrescription.prescriptionId,
          region: submittedLocalPrescription.region,
          department: '01',
          companySiret: SlaughterhouseCompanyFixture1.siret
        });
      };

      await successRequestTest(NationalCoordinator);
      await successRequestTest(AdminFixture);
    });

    test('should get the company prescription with laboratories when requested', async () => {
      const res = await request(app)
        .get(testRoute())
        .query({ includes: 'laboratories' })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        prescriptionId: submittedLocalPrescription.prescriptionId,
        region: submittedLocalPrescription.region,
        department: '01',
        companySiret: SlaughterhouseCompanyFixture1.siret
      });
    });
  });
});
