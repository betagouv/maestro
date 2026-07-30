import { constants } from 'node:http2';
import { fakerFR } from '@faker-js/faker';
import { isEqual, omit } from 'lodash-es';
import type { Department } from 'maestro-shared/referential/Department';
import { MatrixKindEffective } from 'maestro-shared/referential/Matrix/MatrixKind';
import {
  type Region,
  RegionList,
  Regions
} from 'maestro-shared/referential/Region';
import type {
  LocalPrescription,
  LocalPrescriptionUpdate
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import type {
  LocalPrescriptionComment,
  LocalPrescriptionCommentToCreate
} from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionComment';
import { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import type { UserRefined } from 'maestro-shared/schema/User/User';
import { SlaughterhouseCompanyFixture1 } from 'maestro-shared/test/companyFixtures';
import {
  genLaboratory,
  LaboratoryFixture
} from 'maestro-shared/test/laboratoryFixtures';
import {
  genLocalPrescription,
  genPrescription
} from 'maestro-shared/test/prescriptionFixtures';
import {
  genProgrammingPlan,
  PPVClosedProgrammingPlanFixture,
  PPVSubmittedProgrammingPlanFixture,
  PPVValidatedProgrammingPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  genCreatedPartialSample,
  genSampleItem
} from 'maestro-shared/test/sampleFixtures';
import { oneOf } from 'maestro-shared/test/testFixtures';
import {
  AdminFixture,
  DepartmentalCoordinator,
  LaboratoryOfficeUserFixture,
  LaboratoryUserFixture,
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
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { Laboratories } from '../../repositories/laboratoryRepository';
import { LocalPrescriptionChanges } from '../../repositories/localPrescriptionChangeRepository';
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
import { ProgrammingSubPlans } from '../../repositories/programmingSubPlanRepository';
import { SampleItems } from '../../repositories/sampleItemRepository';
import {
  formatPartialSample,
  Samples
} from '../../repositories/sampleRepository';
import { createServer } from '../../server';
import prescriptionDiffusionService from '../../services/prescriptionDiffusionService';
import { toDbRow } from '../../test/seed/002-laboratories';
import { mockSendNotification } from '../../test/setupTests';
import { tokenProvider } from '../../test/testUtils';

describe('Local prescriptions router', () => {
  const { app } = createServer();

  const laboratory = genLaboratory();
  const substanceKindsLaboratories = [
    {
      substanceKind: 'Any' as const,
      laboratoryId: laboratory.id
    }
  ];
  const closedControlPrescription = genPrescription({
    programmingPlanId: PPVClosedProgrammingPlanFixture.id,
    context: 'Control',
    matrixKind: oneOf(MatrixKindEffective.options),
    stages: ['STADE1']
  });
  const validatedControlPrescription = genPrescription({
    programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
    context: 'Control',
    matrixKind: oneOf(MatrixKindEffective.options),
    stages: ['STADE2']
  });
  const submittedControlPrescription1 = genPrescription({
    programmingPlanId: PPVSubmittedProgrammingPlanFixture.id,
    context: 'Control',
    matrixKind: oneOf(MatrixKindEffective.options),
    stages: ['STADE3', 'STADE4']
  });
  const submittedControlPrescription2 = genPrescription({
    programmingPlanId: PPVSubmittedProgrammingPlanFixture.id,
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
    programmingPlanId: PPVClosedProgrammingPlanFixture.id,
    prescriptionId: closedControlPrescription.id,
    region: Sampler1Fixture.region as Region,
    company: SlaughterhouseCompanyFixture1,
    sampler: Sampler1Fixture,
    step: 'Sent'
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
    await Laboratories().insert(toDbRow(laboratory));
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
        PPVSubmittedProgrammingPlanFixture.id
      ]);
    await ProgrammingPlans()
      .delete()
      .where('id', 'in', [PPVSubmittedProgrammingPlanFixture.id]);
    await Samples().delete().where('id', sample.id);
  });

  describe('GET /prescriptions/regions', () => {
    const testRoute = '/api/prescriptions/regions';

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute)
        .query({
          programmingPlanIds: PPVSubmittedProgrammingPlanFixture.id,
          contexts: 'Control'
        })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid programmingPlan id', async () => {
      await request(app)
        .get(testRoute)
        .query({
          programmingPlanIds: fakerFR.string.alphanumeric(32),
          contexts: 'Control'
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should get a valid context', async () => {
      await request(app)
        .get(testRoute)
        .query({
          programmingPlanIds: PPVSubmittedProgrammingPlanFixture.id,
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
            programmingPlanIds: PPVSubmittedProgrammingPlanFixture.id,
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
            programmingPlanIds: PPVSubmittedProgrammingPlanFixture.id,
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
          programmingPlanIds: PPVClosedProgrammingPlanFixture.id,
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
          notAdmissibleSampleCount: 0,
          nonCompliantSampleCount: 0,
          compliantSampleCount: 0
        }))
      );
    });
  });

  describe('PUT /{prescriptionId}/regions/{region}', () => {
    const submittedLocalPrescriptionUpdate: LocalPrescriptionUpdate = {
      programmingPlanId: PPVSubmittedProgrammingPlanFixture.id,
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
          programmingPlanId: PPVClosedProgrammingPlanFixture.id
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
      await forbiddenRequestTest(LaboratoryUserFixture);
      await forbiddenRequestTest(LaboratoryOfficeUserFixture);
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
          programmingPlanId: PPVClosedProgrammingPlanFixture.id
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
        sampleCount: submittedLocalPrescription.sampleCount,
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
        sampleCount: submittedLocalPrescription.sampleCount,
        substanceKindsLaboratories: undefined
      });

      //Cleanup the pending changes inserted by this test
      await LocalPrescriptionChanges()
        .where('prescription_id', submittedLocalPrescription.prescriptionId)
        .andWhere('region', submittedLocalPrescription.region)
        .andWhere('echelon', 'National')
        .andWhere('kind', 'sampleCount')
        .delete();
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
          programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
          key: 'laboratories',
          substanceKindsLaboratories: []
        })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      await prescriptionDiffusionService.commitPendingRegionalChanges(
        PPVValidatedProgrammingPlanFixture.id,
        validatedLocalPrescription.region
      );

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
          programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
          key: 'laboratories',
          substanceKindsLaboratories
        })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      await prescriptionDiffusionService.commitPendingRegionalChanges(
        PPVValidatedProgrammingPlanFixture.id,
        validatedLocalPrescription.region
      );

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

    describe('should update the samples laboratories of the prescription for a regional coordinator', async () => {
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

      const draftSample = genCreatedPartialSample({
        programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
        prescriptionId: validatedLocalPrescription.prescriptionId,
        region: validatedLocalPrescription.region as Region,
        company: SlaughterhouseCompanyFixture1,
        sampler: RegionalCoordinator,
        status: 'Draft',
        step: 'DraftMatrix'
      });

      const laboratoryItem = genSampleItem({
        sampleId: draftSample.id,
        itemNumber: 1,
        copyNumber: 1,
        substanceKind: 'Any',
        recipientKind: 'Laboratory',
        laboratoryId: undefined
      });

      const nonLaboratoryItem = genSampleItem({
        sampleId: draftSample.id,
        itemNumber: 2,
        copyNumber: 1,
        substanceKind: 'Any',
        recipientKind: 'Sampler',
        laboratoryId: undefined
      });

      beforeAll(async () => {
        await Samples().insert(formatPartialSample(draftSample));
        await SampleItems().insert([laboratoryItem, nonLaboratoryItem]);
      });

      afterAll(async () => {
        await SampleItems().where({ sampleId: draftSample.id }).delete();
        await Samples().where({ id: draftSample.id }).delete();
      });

      afterEach(async () => {
        await SampleItems()
          .where({ sampleId: draftSample.id })
          .update({ laboratoryId: null });
      });

      test('should update laboratoryId on sample items with recipientKind Laboratory', async () => {
        await request(app)
          .put(
            testRoute(
              validatedLocalPrescription.prescriptionId,
              validatedLocalPrescription.region
            )
          )
          .send({
            programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
            key: 'laboratories',
            substanceKindsLaboratories
          })
          .use(tokenProvider(RegionalCoordinator))
          .expect(constants.HTTP_STATUS_OK);

        // The sample-item cascade is itself data a sampler reads, so it
        // waits for diffusion just like the lab assignment it follows from.
        await prescriptionDiffusionService.commitPendingRegionalChanges(
          PPVValidatedProgrammingPlanFixture.id,
          validatedLocalPrescription.region
        );

        const updatedLaboratoryItem = await SampleItems()
          .where({ sampleId: draftSample.id, itemNumber: 1, copyNumber: 1 })
          .first();

        expect(updatedLaboratoryItem?.laboratoryId).toBe(laboratory.id);
      });

      test('should not update laboratoryId on sample items with recipientKind !== Laboratory', async () => {
        await request(app)
          .put(
            testRoute(
              validatedLocalPrescription.prescriptionId,
              validatedLocalPrescription.region
            )
          )
          .send({
            programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
            key: 'laboratories',
            substanceKindsLaboratories
          })
          .use(tokenProvider(RegionalCoordinator))
          .expect(constants.HTTP_STATUS_OK);

        const nonLabItem = await SampleItems()
          .where({ sampleId: draftSample.id, itemNumber: 2, copyNumber: 1 })
          .first();

        expect(nonLabItem?.laboratoryId).toBeNull();
      });

      test('should set laboratoryId to null when substanceKind has no matching laboratory', async () => {
        await SampleItems()
          .where({ sampleId: draftSample.id, itemNumber: 1, copyNumber: 1 })
          .update({ laboratoryId: laboratory.id });

        await request(app)
          .put(
            testRoute(
              validatedLocalPrescription.prescriptionId,
              validatedLocalPrescription.region
            )
          )
          .send({
            programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
            key: 'laboratories',
            substanceKindsLaboratories: []
          })
          .use(tokenProvider(RegionalCoordinator))
          .expect(constants.HTTP_STATUS_OK);

        await prescriptionDiffusionService.commitPendingRegionalChanges(
          PPVValidatedProgrammingPlanFixture.id,
          validatedLocalPrescription.region
        );

        const updatedItem = await SampleItems()
          .where({ sampleId: draftSample.id, itemNumber: 1, copyNumber: 1 })
          .first();

        expect(updatedItem?.laboratoryId).toBeNull();
      });

      test('should not update sample items from the same prescription but a different region', async () => {
        const otherRegion = RegionList.find(
          (r) => r !== (validatedLocalPrescription.region as Region)
        ) as Region;

        const sampleOtherRegion = genCreatedPartialSample({
          programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
          prescriptionId: validatedLocalPrescription.prescriptionId,
          region: otherRegion,
          company: SlaughterhouseCompanyFixture1,
          sampler: RegionalCoordinator,
          status: 'Draft',
          step: 'DraftMatrix'
        });
        const itemOtherRegion = genSampleItem({
          sampleId: sampleOtherRegion.id,
          itemNumber: 1,
          copyNumber: 1,
          substanceKind: 'Any',
          recipientKind: 'Laboratory',
          laboratoryId: LaboratoryFixture.id
        });

        await Samples().insert(formatPartialSample(sampleOtherRegion));
        await SampleItems().insert(itemOtherRegion);

        await request(app)
          .put(
            testRoute(
              validatedLocalPrescription.prescriptionId,
              validatedLocalPrescription.region
            )
          )
          .send({
            programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
            key: 'laboratories',
            substanceKindsLaboratories
          })
          .use(tokenProvider(RegionalCoordinator))
          .expect(constants.HTTP_STATUS_OK);

        const untouchedItem = await SampleItems()
          .where({
            sampleId: sampleOtherRegion.id,
            itemNumber: 1,
            copyNumber: 1
          })
          .first();

        expect(untouchedItem?.laboratoryId).toBe(LaboratoryFixture.id);

        await SampleItems().where({ sampleId: sampleOtherRegion.id }).delete();
        await Samples().where({ id: sampleOtherRegion.id }).delete();
      });

      test('should not update sample items from a different prescription in the same region', async () => {
        const otherPrescriptionSample = genCreatedPartialSample({
          programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
          prescriptionId: closedControlPrescription.id,
          region: validatedLocalPrescription.region as Region,
          company: SlaughterhouseCompanyFixture1,
          sampler: RegionalCoordinator,
          status: 'Draft',
          step: 'DraftMatrix'
        });
        const itemOtherPrescription = genSampleItem({
          sampleId: otherPrescriptionSample.id,
          itemNumber: 1,
          copyNumber: 1,
          substanceKind: 'Any',
          recipientKind: 'Laboratory',
          laboratoryId: LaboratoryFixture.id
        });

        await Samples().insert(formatPartialSample(otherPrescriptionSample));
        await SampleItems().insert(itemOtherPrescription);

        await request(app)
          .put(
            testRoute(
              validatedLocalPrescription.prescriptionId,
              validatedLocalPrescription.region
            )
          )
          .send({
            programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
            key: 'laboratories',
            substanceKindsLaboratories
          })
          .use(tokenProvider(RegionalCoordinator))
          .expect(constants.HTTP_STATUS_OK);

        const untouchedItem = await SampleItems()
          .where({
            sampleId: otherPrescriptionSample.id,
            itemNumber: 1,
            copyNumber: 1
          })
          .first();

        expect(untouchedItem?.laboratoryId).toBe(LaboratoryFixture.id);

        await SampleItems()
          .where({ sampleId: otherPrescriptionSample.id })
          .delete();
        await Samples().where({ id: otherPrescriptionSample.id }).delete();
      });

      test('should not update sample items from samples with status other than Draft or Submitted', async () => {
        const sentSample = genCreatedPartialSample({
          programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
          prescriptionId: validatedLocalPrescription.prescriptionId,
          region: validatedLocalPrescription.region as Region,
          company: SlaughterhouseCompanyFixture1,
          sampler: RegionalCoordinator,
          status: 'Sent',
          step: 'Sent'
        });
        const itemSentSample = genSampleItem({
          sampleId: sentSample.id,
          itemNumber: 1,
          copyNumber: 1,
          substanceKind: 'Any',
          recipientKind: 'Laboratory',
          laboratoryId: LaboratoryFixture.id
        });

        await Samples().insert(formatPartialSample(sentSample));
        await SampleItems().insert(itemSentSample);

        await request(app)
          .put(
            testRoute(
              validatedLocalPrescription.prescriptionId,
              validatedLocalPrescription.region
            )
          )
          .send({
            programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
            key: 'laboratories',
            substanceKindsLaboratories
          })
          .use(tokenProvider(RegionalCoordinator))
          .expect(constants.HTTP_STATUS_OK);

        const untouchedItem = await SampleItems()
          .where({ sampleId: sentSample.id, itemNumber: 1, copyNumber: 1 })
          .first();

        expect(untouchedItem?.laboratoryId).toBe(LaboratoryFixture.id);

        await SampleItems().where({ sampleId: sentSample.id }).delete();
        await Samples().where({ id: sentSample.id }).delete();
      });
    });
  });

  describe('PUT /{prescriptionId}/regions/{region}/departments/{department}', () => {
    const programmingPlanSlaughterhouse = genProgrammingPlan({
      createdBy: NationalCoordinator.id,
      distributionKind: 'SLAUGHTERHOUSE',
      year: 1922,
      regionalStatus: RegionList.map((region) => ({
        region,
        status: 'SubmittedToDepartments' as const
      })),
      departmentalStatus: [
        {
          region: RegionalCoordinator.region as Region,
          department: DepartmentalCoordinator.department as Department,
          status: 'Validated' as const
        }
      ]
    });

    const programmingPlanSlaughterhouseClosed = genProgrammingPlan({
      createdBy: NationalCoordinator.id,
      distributionKind: 'SLAUGHTERHOUSE',
      year: 1923,
      regionalStatus: RegionList.map((region) => ({
        region,
        status: 'Closed' as const
      })),
      departmentalStatus: []
    });

    const slaughterhousePrescription = genPrescription({
      programmingPlanId: programmingPlanSlaughterhouse.id,
      context: 'Control',
      matrixKind: oneOf(MatrixKindEffective.options)
    });

    const slaughterhousePrescriptionClosed = genPrescription({
      programmingPlanId: programmingPlanSlaughterhouseClosed.id,
      context: 'Control',
      matrixKind: oneOf(MatrixKindEffective.options)
    });

    const slaughterhouseLocalPrescriptions: LocalPrescription[] =
      RegionList.map((region) =>
        genLocalPrescription({
          prescriptionId: slaughterhousePrescription.id,
          region,
          substanceKindsLaboratories
        })
      );

    const departmentalLocalPrescription: LocalPrescription =
      genLocalPrescription({
        prescriptionId: slaughterhousePrescription.id,
        region: RegionalCoordinator.region as Region,
        department: DepartmentalCoordinator.department as Department,
        substanceKindsLaboratories
      });

    const closedDepartmentalLocalPrescription: LocalPrescription =
      genLocalPrescription({
        prescriptionId: slaughterhousePrescriptionClosed.id,
        region: RegionalCoordinator.region as Region,
        department: DepartmentalCoordinator.department as Department,
        substanceKindsLaboratories
      });

    const testRoute = (
      prescriptionId: string = departmentalLocalPrescription.prescriptionId,
      region: string = departmentalLocalPrescription.region,
      department: string = departmentalLocalPrescription.department as string
    ) =>
      `/api/prescriptions/${prescriptionId}/regions/${region}/departments/${department}`;

    const sampleCountUpdate: LocalPrescriptionUpdate = {
      programmingPlanId: programmingPlanSlaughterhouse.id,
      key: 'sampleCount',
      sampleCount: 10
    };

    const insertPlanWithStatus = async (
      plan: ReturnType<typeof genProgrammingPlan>
    ) => {
      await ProgrammingPlans().insert(formatProgrammingPlan(plan));
      await ProgrammingPlanLocalStatus().insert([
        {
          ...plan.nationalStatus,
          programmingPlanId: plan.id,
          region: 'None',
          department: 'None'
        },
        ...plan.regionalStatus.map((rs) => ({
          ...rs,
          programmingPlanId: plan.id
        })),
        ...plan.departmentalStatus.map((ds) => ({
          ...ds,
          programmingPlanId: plan.id
        }))
      ]);
      await ProgrammingSubPlans().insert(
        plan.subPlans.map((sp) => ({
          id: sp.id,
          programmingPlanId: plan.id,
          subPlanNumber: sp.subPlanNumber,
          stages: sp.stages,
          label: sp.label,
          analysisPermissionRole: sp.analysisPermissionRole ?? null,
          contactListId: sp.contactListId ?? null,
          withSacha: sp.withSacha
        }))
      );
    };

    beforeAll(async () => {
      await insertPlanWithStatus(programmingPlanSlaughterhouse);
      await insertPlanWithStatus(programmingPlanSlaughterhouseClosed);
      await Prescriptions().insert([
        slaughterhousePrescription,
        slaughterhousePrescriptionClosed
      ]);
      const allLocalPrescriptions = [
        ...slaughterhouseLocalPrescriptions,
        departmentalLocalPrescription,
        closedDepartmentalLocalPrescription
      ];
      await LocalPrescriptions().insert(
        allLocalPrescriptions.map((_) =>
          omit(formatLocalPrescription(_), [
            'substanceKindsLaboratories',
            'realizedSampleCount',
            'inProgressSampleCount'
          ])
        )
      );
      await LocalPrescriptionSubstanceKindsLaboratories().insert(
        allLocalPrescriptions.flatMap((lp) =>
          (lp.substanceKindsLaboratories ?? []).map((skl) => ({
            prescriptionId: lp.prescriptionId,
            region: lp.region,
            department: lp.department ?? 'None',
            substanceKind: skl.substanceKind,
            laboratoryId: skl.laboratoryId
          }))
        )
      );
    });

    afterAll(async () => {
      await Prescriptions()
        .delete()
        .whereIn('id', [
          slaughterhousePrescription.id,
          slaughterhousePrescriptionClosed.id
        ]);
      await ProgrammingPlans()
        .delete()
        .whereIn('id', [
          programmingPlanSlaughterhouse.id,
          programmingPlanSlaughterhouseClosed.id
        ]);
    });

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute())
        .send(sampleCountUpdate)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should receive valid prescriptionId, region and department', async () => {
      await request(app)
        .put(testRoute(fakerFR.string.alphanumeric(32)))
        .send(sampleCountUpdate)
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await request(app)
        .put(
          testRoute(
            slaughterhousePrescription.id,
            'invalid',
            DepartmentalCoordinator.department as string
          )
        )
        .send(sampleCountUpdate)
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await request(app)
        .put(
          testRoute(
            slaughterhousePrescription.id,
            RegionalCoordinator.region as string,
            'invalid'
          )
        )
        .send(sampleCountUpdate)
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .put(testRoute())
          .send(payload)
          .use(tokenProvider(RegionalCoordinator))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest({ programmingPlanId: undefined });
      await badRequestTest({
        programmingPlanId: fakerFR.string.alphanumeric(32)
      });
      await badRequestTest({
        programmingPlanId: programmingPlanSlaughterhouse.id
        // missing key
      });
    });

    test('should fail if the prescription does not exist', async () => {
      await request(app)
        .put(
          testRoute(
            uuidv4(),
            RegionalCoordinator.region as string,
            DepartmentalCoordinator.department as string
          )
        )
        .send(sampleCountUpdate)
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should fail if the prescription does not belong to the programmingPlan', async () => {
      await request(app)
        .put(testRoute())
        .send({
          ...sampleCountUpdate,
          programmingPlanId: PPVClosedProgrammingPlanFixture.id
        })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the user does not have the permission', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .put(testRoute())
          .send(sampleCountUpdate)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(NationalCoordinator);
      await forbiddenRequestTest(AdminFixture);
      await forbiddenRequestTest(LaboratoryUserFixture);
      await forbiddenRequestTest(LaboratoryOfficeUserFixture);
    });

    test('should fail if the programming plan is closed', async () => {
      await request(app)
        .put(
          testRoute(
            closedDepartmentalLocalPrescription.prescriptionId,
            closedDepartmentalLocalPrescription.region,
            closedDepartmentalLocalPrescription.department as string
          )
        )
        .send({
          ...sampleCountUpdate,
          programmingPlanId: programmingPlanSlaughterhouseClosed.id
        })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should update the sampleCount of the departmental prescription for a regional coordinator', async () => {
      const res = await request(app)
        .put(testRoute())
        .send(sampleCountUpdate)
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        prescriptionId: departmentalLocalPrescription.prescriptionId,
        region: departmentalLocalPrescription.region,
        department: departmentalLocalPrescription.department,
        sampleCount: sampleCountUpdate.sampleCount
      });

      await expect(
        LocalPrescriptions()
          .where(
            'prescription_id',
            departmentalLocalPrescription.prescriptionId
          )
          .andWhere('region', departmentalLocalPrescription.region)
          .andWhere('department', departmentalLocalPrescription.department)
          .andWhere('company_siret', 'None')
          .first()
      ).resolves.toMatchObject({
        sampleCount: departmentalLocalPrescription.sampleCount
      });

      await prescriptionDiffusionService.commitPendingRegionalChanges(
        programmingPlanSlaughterhouse.id,
        departmentalLocalPrescription.region
      );

      await expect(
        LocalPrescriptions()
          .where(
            'prescription_id',
            departmentalLocalPrescription.prescriptionId
          )
          .andWhere('region', departmentalLocalPrescription.region)
          .andWhere('department', departmentalLocalPrescription.department)
          .andWhere('company_siret', 'None')
          .first()
      ).resolves.toMatchObject({
        sampleCount: sampleCountUpdate.sampleCount
      });

      // Cleanup
      await LocalPrescriptions()
        .where('prescription_id', departmentalLocalPrescription.prescriptionId)
        .andWhere('region', departmentalLocalPrescription.region)
        .andWhere('department', departmentalLocalPrescription.department)
        .andWhere('company_siret', 'None')
        .update({ sampleCount: departmentalLocalPrescription.sampleCount });
      await LocalPrescriptionChanges()
        .where('prescription_id', departmentalLocalPrescription.prescriptionId)
        .andWhere('region', departmentalLocalPrescription.region)
        .andWhere('department', departmentalLocalPrescription.department)
        .andWhere('echelon', 'Regional')
        .andWhere('kind', 'sampleCount')
        .delete();
    });

    test("a Regional-authored, self-diffused department edit does not surface as a false 'new change' on the region's own row", async () => {
      await request(app)
        .put(testRoute())
        .send(sampleCountUpdate)
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      await prescriptionDiffusionService.commitPendingRegionalChanges(
        programmingPlanSlaughterhouse.id,
        departmentalLocalPrescription.region
      );

      const res = await request(app)
        .get('/api/prescriptions/regions')
        .query({
          programmingPlanIds: programmingPlanSlaughterhouse.id,
          region: departmentalLocalPrescription.region,
          includes: 'pendingChanges'
        })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      const regionRow = res.body.find(
        (_: { prescriptionId: string; department: string | null }) =>
          _.prescriptionId === departmentalLocalPrescription.prescriptionId &&
          !_.department
      );
      expect(regionRow.changedAt).toBeNull();
      expect(regionRow.previousSampleCount).toBeNull();

      // Cleanup
      await LocalPrescriptions()
        .where('prescription_id', departmentalLocalPrescription.prescriptionId)
        .andWhere('region', departmentalLocalPrescription.region)
        .andWhere('department', departmentalLocalPrescription.department)
        .andWhere('company_siret', 'None')
        .update({ sampleCount: departmentalLocalPrescription.sampleCount });
      await LocalPrescriptionChanges()
        .where('prescription_id', departmentalLocalPrescription.prescriptionId)
        .andWhere('region', departmentalLocalPrescription.region)
        .andWhere('department', departmentalLocalPrescription.department)
        .andWhere('echelon', 'Regional')
        .andWhere('kind', 'sampleCount')
        .delete();
    });

    test('should update the substances laboratories for a departmental coordinator', async () => {
      const seededLaboratories = [
        {
          prescriptionId: departmentalLocalPrescription.prescriptionId,
          region: departmentalLocalPrescription.region,
          department: departmentalLocalPrescription.department,
          substanceKind: 'Any',
          laboratoryId: laboratory.id
        }
      ];

      await request(app)
        .put(testRoute())
        .send({
          programmingPlanId: programmingPlanSlaughterhouse.id,
          key: 'laboratories',
          substanceKindsLaboratories: []
        })
        .use(tokenProvider(DepartmentalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      await expect(
        LocalPrescriptionSubstanceKindsLaboratories().where({
          prescriptionId: departmentalLocalPrescription.prescriptionId,
          region: departmentalLocalPrescription.region,
          department: (departmentalLocalPrescription.department ??
            'None') as Department
        })
      ).resolves.toEqual(seededLaboratories);

      await request(app)
        .put(testRoute())
        .send({
          programmingPlanId: programmingPlanSlaughterhouse.id,
          key: 'laboratories',
          substanceKindsLaboratories
        })
        .use(tokenProvider(DepartmentalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      await expect(
        LocalPrescriptionSubstanceKindsLaboratories().where({
          prescriptionId: departmentalLocalPrescription.prescriptionId,
          region: departmentalLocalPrescription.region,
          department: (departmentalLocalPrescription.department ??
            'None') as Department
        })
      ).resolves.toEqual(seededLaboratories);
    });

    describe('should update the samples laboratories of the prescription for a departmental coordinator', async () => {
      const draftSample = genCreatedPartialSample({
        programmingPlanId: programmingPlanSlaughterhouse.id,
        prescriptionId: departmentalLocalPrescription.prescriptionId,
        region: departmentalLocalPrescription.region as Region,
        department: DepartmentalCoordinator.department as Department,
        company: SlaughterhouseCompanyFixture1,
        sampler: DepartmentalCoordinator,
        status: 'Draft',
        step: 'DraftMatrix'
      });

      const laboratoryItem = genSampleItem({
        sampleId: draftSample.id,
        itemNumber: 1,
        copyNumber: 1,
        substanceKind: 'Any',
        recipientKind: 'Laboratory',
        laboratoryId: null
      });

      const nonLaboratoryItem = genSampleItem({
        sampleId: draftSample.id,
        itemNumber: 2,
        copyNumber: 1,
        substanceKind: 'Any',
        recipientKind: 'Sampler',
        laboratoryId: null
      });

      beforeAll(async () => {
        await Samples().insert(formatPartialSample(draftSample));
        await SampleItems().insert([laboratoryItem, nonLaboratoryItem]);
      });

      afterAll(async () => {
        await SampleItems().where({ sampleId: draftSample.id }).delete();
        await Samples().where({ id: draftSample.id }).delete();
      });

      afterEach(async () => {
        await SampleItems()
          .where({ sampleId: draftSample.id })
          .update({ laboratoryId: null });
      });

      test("should keep the sample item's laboratoryId untouched until diffused (Departmental-authored, Phase C)", async () => {
        await request(app)
          .put(testRoute())
          .send({
            programmingPlanId: programmingPlanSlaughterhouse.id,
            key: 'laboratories',
            substanceKindsLaboratories
          })
          .use(tokenProvider(DepartmentalCoordinator))
          .expect(constants.HTTP_STATUS_OK);

        const updatedItem = await SampleItems()
          .where({ sampleId: draftSample.id, itemNumber: 1, copyNumber: 1 })
          .first();

        expect(updatedItem?.laboratoryId).toBeNull();
      });

      test('should not update laboratoryId on sample items with recipientKind !== Laboratory', async () => {
        await request(app)
          .put(testRoute())
          .send({
            programmingPlanId: programmingPlanSlaughterhouse.id,
            key: 'laboratories',
            substanceKindsLaboratories
          })
          .use(tokenProvider(DepartmentalCoordinator))
          .expect(constants.HTTP_STATUS_OK);

        const nonLabItem = await SampleItems()
          .where({ sampleId: draftSample.id, itemNumber: 2, copyNumber: 1 })
          .first();

        expect(nonLabItem?.laboratoryId).toBeNull();
      });

      test("should not touch the sample item's laboratoryId until diffused (Departmental-authored, Phase C)", async () => {
        await SampleItems()
          .where({ sampleId: draftSample.id, itemNumber: 1, copyNumber: 1 })
          .update({ laboratoryId: laboratory.id });

        await request(app)
          .put(testRoute())
          .send({
            programmingPlanId: programmingPlanSlaughterhouse.id,
            key: 'laboratories',
            substanceKindsLaboratories: []
          })
          .use(tokenProvider(DepartmentalCoordinator))
          .expect(constants.HTTP_STATUS_OK);

        const updatedItem = await SampleItems()
          .where({ sampleId: draftSample.id, itemNumber: 1, copyNumber: 1 })
          .first();

        expect(updatedItem?.laboratoryId).toBe(laboratory.id);
      });

      test('should not update sample items from the same prescription but a different department', async () => {
        const otherDepartment = Regions[
          DepartmentalCoordinator.region
        ].departments.find(
          (d) => d !== (departmentalLocalPrescription.department as Department)
        ) as Department;

        const sampleOtherDepartment = genCreatedPartialSample({
          programmingPlanId: programmingPlanSlaughterhouse.id,
          prescriptionId: departmentalLocalPrescription.prescriptionId,
          region: DepartmentalCoordinator.region,
          department: otherDepartment,
          company: SlaughterhouseCompanyFixture1,
          sampler: DepartmentalCoordinator,
          status: 'Draft',
          step: 'DraftMatrix'
        });
        const itemOtherDepartment = genSampleItem({
          sampleId: sampleOtherDepartment.id,
          itemNumber: 1,
          copyNumber: 1,
          substanceKind: 'Any',
          recipientKind: 'Laboratory',
          laboratoryId: LaboratoryFixture.id
        });

        await Samples().insert(formatPartialSample(sampleOtherDepartment));
        await SampleItems().insert(itemOtherDepartment);

        await request(app)
          .put(testRoute())
          .send({
            programmingPlanId: programmingPlanSlaughterhouse.id,
            key: 'laboratories',
            substanceKindsLaboratories
          })
          .use(tokenProvider(DepartmentalCoordinator))
          .expect(constants.HTTP_STATUS_OK);

        const untouchedItem = await SampleItems()
          .where({
            sampleId: sampleOtherDepartment.id,
            itemNumber: 1,
            copyNumber: 1
          })
          .first();

        expect(untouchedItem?.laboratoryId).toBe(LaboratoryFixture.id);

        await SampleItems()
          .where({ sampleId: sampleOtherDepartment.id })
          .delete();
        await Samples().where({ id: sampleOtherDepartment.id }).delete();
      });

      test('should not update sample items from samples with status other than Draft or Submitted', async () => {
        const sentSample = genCreatedPartialSample({
          programmingPlanId: programmingPlanSlaughterhouse.id,
          prescriptionId: departmentalLocalPrescription.prescriptionId,
          region: departmentalLocalPrescription.region as Region,
          company: SlaughterhouseCompanyFixture1,
          sampler: DepartmentalCoordinator,
          status: 'Sent',
          step: 'Sent'
        });
        const itemSentSample = genSampleItem({
          sampleId: sentSample.id,
          itemNumber: 1,
          copyNumber: 1,
          substanceKind: 'Any',
          recipientKind: 'Laboratory',
          laboratoryId: LaboratoryFixture.id
        });

        await Samples().insert(formatPartialSample(sentSample));
        await SampleItems().insert(itemSentSample);

        await request(app)
          .put(testRoute())
          .send({
            programmingPlanId: programmingPlanSlaughterhouse.id,
            key: 'laboratories',
            substanceKindsLaboratories
          })
          .use(tokenProvider(DepartmentalCoordinator))
          .expect(constants.HTTP_STATUS_OK);

        const untouchedItem = await SampleItems()
          .where({ sampleId: sentSample.id, itemNumber: 1, copyNumber: 1 })
          .first();

        expect(untouchedItem?.laboratoryId).toBe(LaboratoryFixture.id);

        await SampleItems().where({ sampleId: sentSample.id }).delete();
        await Samples().where({ id: sentSample.id }).delete();
      });
    });

    test('should distribute to slaughterhouses for a departmental coordinator', async () => {
      const slaughterhouseSampleCounts = [
        {
          companySiret: SlaughterhouseCompanyFixture1.siret,
          sampleCount: 5
        }
      ];

      const res = await request(app)
        .put(testRoute())
        .send({
          programmingPlanId: programmingPlanSlaughterhouse.id,
          key: 'slaughterhouseSampleCounts',
          slaughterhouseSampleCounts
        })
        .use(tokenProvider(DepartmentalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        prescriptionId: departmentalLocalPrescription.prescriptionId,
        region: departmentalLocalPrescription.region,
        department: departmentalLocalPrescription.department
      });

      await expect(
        LocalPrescriptions()
          .where(
            'prescription_id',
            departmentalLocalPrescription.prescriptionId
          )
          .andWhere('region', departmentalLocalPrescription.region)
          .andWhere('department', departmentalLocalPrescription.department)
          .andWhere('company_siret', SlaughterhouseCompanyFixture1.siret)
          .first()
      ).resolves.toBeUndefined();

      await prescriptionDiffusionService.commitPendingDepartmentalChanges(
        programmingPlanSlaughterhouse.id,
        departmentalLocalPrescription.region,
        departmentalLocalPrescription.department as Department
      );

      await expect(
        LocalPrescriptions()
          .where(
            'prescription_id',
            departmentalLocalPrescription.prescriptionId
          )
          .andWhere('region', departmentalLocalPrescription.region)
          .andWhere('department', departmentalLocalPrescription.department)
          .andWhere('company_siret', SlaughterhouseCompanyFixture1.siret)
          .first()
      ).resolves.toMatchObject({
        sampleCount: 5
      });

      // Cleanup
      await LocalPrescriptions()
        .where('prescription_id', departmentalLocalPrescription.prescriptionId)
        .andWhere('region', departmentalLocalPrescription.region)
        .andWhere('department', departmentalLocalPrescription.department)
        .whereNot('company_siret', 'None')
        .delete();
    });

    test('a Departmental-authored, diffused slaughterhouse split surfaces as a "new change" for a non-authoring viewer (e.g. the Sampler)', async () => {
      const slaughterhouseSampleCounts = [
        {
          companySiret: SlaughterhouseCompanyFixture1.siret,
          sampleCount: 7
        }
      ];

      await request(app)
        .put(testRoute())
        .send({
          programmingPlanId: programmingPlanSlaughterhouse.id,
          key: 'slaughterhouseSampleCounts',
          slaughterhouseSampleCounts
        })
        .use(tokenProvider(DepartmentalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      await prescriptionDiffusionService.commitPendingDepartmentalChanges(
        programmingPlanSlaughterhouse.id,
        departmentalLocalPrescription.region,
        departmentalLocalPrescription.department as Department
      );

      const res = await request(app)
        .get('/api/prescriptions/regions')
        .query({
          programmingPlanIds: programmingPlanSlaughterhouse.id,
          region: departmentalLocalPrescription.region,
          department: departmentalLocalPrescription.department,
          includes: 'pendingChanges'
        })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      const companyRow = res.body.find(
        (_: { prescriptionId: string; companySiret: string | null }) =>
          _.prescriptionId === departmentalLocalPrescription.prescriptionId &&
          _.companySiret === SlaughterhouseCompanyFixture1.siret
      );
      expect(companyRow.changedAt).not.toBeNull();
      expect(companyRow.previousSampleCount).toBe(0);

      // Cleanup
      await LocalPrescriptions()
        .where('prescription_id', departmentalLocalPrescription.prescriptionId)
        .andWhere('region', departmentalLocalPrescription.region)
        .andWhere('department', departmentalLocalPrescription.department)
        .whereNot('company_siret', 'None')
        .delete();
      await LocalPrescriptionChanges()
        .where('prescription_id', departmentalLocalPrescription.prescriptionId)
        .andWhere('region', departmentalLocalPrescription.region)
        .andWhere('department', departmentalLocalPrescription.department)
        .andWhere('company_siret', SlaughterhouseCompanyFixture1.siret)
        .delete();
    });
  });

  describe('POST /{prescriptionId}/regions/{region}/comments', () => {
    const validComment: LocalPrescriptionCommentToCreate = {
      programmingPlanId: PPVSubmittedProgrammingPlanFixture.id,
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
      await forbiddenRequestTest(LaboratoryUserFixture);
      await forbiddenRequestTest(LaboratoryOfficeUserFixture);
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
          programmingPlanId: PPVValidatedProgrammingPlanFixture.id
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
        author: expect.objectContaining({
          id: RegionalCoordinator.id
        }),
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
      programmingPlanId: PPVSubmittedProgrammingPlanFixture.id,
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
        author: expect.objectContaining({
          id: DepartmentalCoordinator.id
        }),
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

  describe('Change history lifecycle', () => {
    const changeTrackingPrescription = genPrescription({
      programmingPlanId: PPVSubmittedProgrammingPlanFixture.id,
      context: 'Exploratory',
      matrixKind: oneOf(MatrixKindEffective.options),
      stages: ['STADE1']
    });
    const changeTrackingLocalPrescription: LocalPrescription =
      genLocalPrescription({
        prescriptionId: changeTrackingPrescription.id,
        region: RegionalCoordinator.region as Region,
        sampleCount: 50,
        substanceKindsLaboratories: []
      });
    const testRoute = () =>
      `/api/prescriptions/${changeTrackingLocalPrescription.prescriptionId}/regions/${changeTrackingLocalPrescription.region}`;

    beforeAll(async () => {
      await Prescriptions().insert(changeTrackingPrescription);
      await LocalPrescriptions().insert(
        omit(formatLocalPrescription(changeTrackingLocalPrescription), [
          'substanceKindsLaboratories',
          'realizedSampleCount',
          'inProgressSampleCount'
        ])
      );
    });

    const findChanges = () =>
      LocalPrescriptionChanges()
        .where({
          prescriptionId: changeTrackingLocalPrescription.prescriptionId,
          region: changeTrackingLocalPrescription.region
        })
        .orderBy('changedAt', 'asc');

    test('editing sampleCount appends a new row instead of overwriting, and a later edit does not touch the still-unviewed row', async () => {
      await request(app)
        .put(testRoute())
        .send({
          programmingPlanId: PPVSubmittedProgrammingPlanFixture.id,
          key: 'sampleCount',
          sampleCount: 80
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      const afterFirstEdit = await findChanges();
      expect(afterFirstEdit).toHaveLength(1);
      expect(afterFirstEdit[0]).toMatchObject({
        previousSampleCount: 50,
        changesViewedAt: null
      });

      await request(app)
        .put(testRoute())
        .send({
          programmingPlanId: PPVSubmittedProgrammingPlanFixture.id,
          key: 'sampleCount',
          sampleCount: 120
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      const afterSecondEdit = await findChanges();
      expect(afterSecondEdit).toHaveLength(2);
      expect(afterSecondEdit[0]).toMatchObject({
        previousSampleCount: 50,
        changesViewedAt: null
      });
    });

    test('assigning a laboratory marks only that laboratories-kind change as viewed, leaving still-unseen sampleCount changes untouched', async () => {
      await prescriptionDiffusionService.commitPendingNationalChanges(
        PPVSubmittedProgrammingPlanFixture.id
      );

      const laboratoryForRegion = genLaboratory();
      await Laboratories().insert(toDbRow(laboratoryForRegion));

      await request(app)
        .put(testRoute())
        .send({
          programmingPlanId: PPVSubmittedProgrammingPlanFixture.id,
          key: 'laboratories',
          substanceKindsLaboratories: [
            { substanceKind: 'Any', laboratoryId: laboratoryForRegion.id }
          ]
        })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      const rows = await findChanges();
      expect(rows.length).toBeGreaterThan(0);
      const sampleCountRows = rows.filter((row) => row.kind === 'sampleCount');
      expect(sampleCountRows.length).toBeGreaterThan(0);
      expect(sampleCountRows.every((row) => row.changesViewedAt === null)).toBe(
        true
      );

      await LocalPrescriptionChanges()
        .where({
          prescriptionId: changeTrackingLocalPrescription.prescriptionId,
          region: changeTrackingLocalPrescription.region,
          kind: 'sampleCount'
        })
        .update({
          changesViewedAt: new Date(),
          changesViewedBy: RegionalCoordinator.id
        });
    });

    test('a pending (not-yet-diffused) National edit does not surface as changedAt for the region until diffused', async () => {
      await request(app)
        .put(testRoute())
        .send({
          programmingPlanId: PPVSubmittedProgrammingPlanFixture.id,
          key: 'sampleCount',
          sampleCount: 200
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      const beforeDiffusion = await request(app)
        .get('/api/prescriptions/regions')
        .query({
          programmingPlanIds: PPVSubmittedProgrammingPlanFixture.id,
          region: changeTrackingLocalPrescription.region,
          contexts: 'Exploratory',
          includes: 'pendingChanges'
        })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      const pendingRow = beforeDiffusion.body.find(
        (_: { prescriptionId: string }) =>
          _.prescriptionId === changeTrackingLocalPrescription.prescriptionId
      );
      expect(pendingRow.changedAt).toBeNull();

      await prescriptionDiffusionService.commitPendingNationalChanges(
        PPVSubmittedProgrammingPlanFixture.id
      );

      const afterDiffusion = await request(app)
        .get('/api/prescriptions/regions')
        .query({
          programmingPlanIds: PPVSubmittedProgrammingPlanFixture.id,
          region: changeTrackingLocalPrescription.region,
          contexts: 'Exploratory',
          includes: 'pendingChanges'
        })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      const diffusedRow = afterDiffusion.body.find(
        (_: { prescriptionId: string }) =>
          _.prescriptionId === changeTrackingLocalPrescription.prescriptionId
      );
      expect(diffusedRow.changedAt).not.toBeNull();
    });
  });

  describe('PUT /prescriptions/regions/:region/changes-viewed', () => {
    const testRoute = (region: string) =>
      `/api/prescriptions/regions/${region}/changes-viewed`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute(RegionalCoordinator.region as string))
        .send({ prescriptionIds: [] })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail for a region outside the user scope', async () => {
      await request(app)
        .put(testRoute(Region2Fixture))
        .send({ prescriptionIds: [submittedControlPrescription1.id] })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should mark the requested prescriptions as viewed for that region only', async () => {
      const otherRegionPrescription = submittedControlLocalPrescriptions1.find(
        (localPrescription) =>
          localPrescription.region !== (RegionalCoordinator.region as Region)
      ) as LocalPrescription;

      await LocalPrescriptionChanges().insert([
        {
          prescriptionId: submittedControlPrescription1.id,
          region: RegionalCoordinator.region as Region,
          department: 'None',
          companySiret: 'None',
          echelon: 'Regional',
          kind: 'sampleCount',
          previousSampleCount: 1,
          changedAt: new Date(),
          diffusedAt: new Date()
        },
        {
          prescriptionId: submittedControlPrescription1.id,
          region: otherRegionPrescription.region,
          department: 'None',
          companySiret: 'None',
          echelon: 'Regional',
          kind: 'sampleCount',
          previousSampleCount: 1,
          changedAt: new Date(),
          diffusedAt: new Date()
        }
      ]);

      await request(app)
        .put(testRoute(RegionalCoordinator.region as string))
        .send({ prescriptionIds: [submittedControlPrescription1.id] })
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      const ownRegionRows = await LocalPrescriptionChanges().where({
        prescriptionId: submittedControlPrescription1.id,
        region: RegionalCoordinator.region as Region
      });
      expect(ownRegionRows.every((row) => row.changesViewedAt !== null)).toBe(
        true
      );

      const otherRegionRows = await LocalPrescriptionChanges().where({
        prescriptionId: submittedControlPrescription1.id,
        region: otherRegionPrescription.region
      });
      expect(otherRegionRows.every((row) => row.changesViewedAt === null)).toBe(
        true
      );
    });

    test('when a department is given, only marks that department’s changes as viewed, not a sibling department’s', async () => {
      const region = DepartmentalCoordinator.region as Region;
      const [ownDepartment, otherDepartment] = Regions[region].departments;

      await LocalPrescriptionChanges().insert([
        {
          prescriptionId: submittedControlPrescription1.id,
          region,
          department: ownDepartment,
          companySiret: 'None',
          echelon: 'Regional',
          kind: 'sampleCount',
          previousSampleCount: 1,
          changedAt: new Date(),
          diffusedAt: new Date()
        },
        {
          prescriptionId: submittedControlPrescription1.id,
          region,
          department: otherDepartment,
          companySiret: 'None',
          echelon: 'Regional',
          kind: 'sampleCount',
          previousSampleCount: 1,
          changedAt: new Date(),
          diffusedAt: new Date()
        }
      ]);

      await request(app)
        .put(testRoute(region))
        .send({
          prescriptionIds: [submittedControlPrescription1.id],
          department: ownDepartment
        })
        .use(tokenProvider(DepartmentalCoordinator))
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      const ownDepartmentRows = await LocalPrescriptionChanges().where({
        prescriptionId: submittedControlPrescription1.id,
        region,
        department: ownDepartment
      });
      expect(
        ownDepartmentRows.every((row) => row.changesViewedAt !== null)
      ).toBe(true);

      const otherDepartmentRows = await LocalPrescriptionChanges().where({
        prescriptionId: submittedControlPrescription1.id,
        region,
        department: otherDepartment
      });
      expect(
        otherDepartmentRows.every((row) => row.changesViewedAt === null)
      ).toBe(true);

      // Cleanup
      await LocalPrescriptionChanges()
        .where({ prescriptionId: submittedControlPrescription1.id, region })
        .whereIn('department', [ownDepartment, otherDepartment])
        .delete();
    });
  });
});
