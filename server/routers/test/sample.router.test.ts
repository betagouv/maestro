import { constants } from 'node:http2';
import { fakerFR } from '@faker-js/faker';
import { addDays, format } from 'date-fns';
import { omit } from 'lodash-es';
import { MatrixEffective } from 'maestro-shared/referential/Matrix/Matrix';
import { type Region, Regions } from 'maestro-shared/referential/Region';
import type { UserRefined } from 'maestro-shared/schema/User/User';
import { genPartialAnalysis } from 'maestro-shared/test/analysisFixtures';
import {
  CompanyFixture,
  SlaughterhouseCompanyFixture1
} from 'maestro-shared/test/companyFixtures';
import { genDocument } from 'maestro-shared/test/documentFixtures';
import { LaboratoryFixture } from 'maestro-shared/test/laboratoryFixtures';
import {
  DAOAInProgressProgrammingPlanFixture,
  PPVValidatedProgrammingPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  genCreatedPartialSample,
  genSampleContextData,
  genSampleItem,
  Sample2Fixture,
  Sample11Fixture,
  Sample12Fixture,
  Sample13Fixture,
  SampleDAOA1Fixture
} from 'maestro-shared/test/sampleFixtures';
import { oneOf } from 'maestro-shared/test/testFixtures';
import {
  AdminFixture,
  NationalCoordinator,
  NationalObserver,
  RegionalCoordinator,
  RegionalObserver,
  Sampler1Fixture,
  Sampler2Fixture,
  SamplerDaoaFixture
} from 'maestro-shared/test/userFixtures';
import { expectArrayToContainElements } from 'maestro-shared/test/utils';
import { toMaestroDate, withISOStringDates } from 'maestro-shared/utils/date';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import { departmentsSeed } from '../../database/seeds/departments/departmentsSeed';
import { analysisReportDocumentsRepository } from '../../repositories/analysisReportDocumentsRepository';
import { analysisRepository } from '../../repositories/analysisRepository';
import { documentRepository } from '../../repositories/documentRepository';
import { kysely } from '../../repositories/kysely';
import { SampleItems } from '../../repositories/sampleItemRepository';
import {
  formatPartialSample,
  Samples
} from '../../repositories/sampleRepository';
import { createServer } from '../../server';
import {
  mockGenerateSampleSupportPDF,
  mockMattermostSend,
  mockTriggerProcessing
} from '../../test/setupTests';
import { tokenProvider } from '../../test/testUtils';

beforeAll(async () => {
  await departmentsSeed();
});
describe('Sample router', () => {
  const { app } = createServer();

  const sample = genSampleContextData({
    programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
    sampler: RegionalCoordinator
  });

  describe('GET /samples/{sampleId}', () => {
    const testRoute = (sampleId: string) => `/api/samples/${sampleId}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(Sample11Fixture.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid sample id', async () => {
      await request(app)
        .get(`${testRoute(fakerFR.string.alphanumeric(32))}`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the sample does not exist', async () => {
      await request(app)
        .get(`${testRoute(uuidv4())}`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should fail if the sample does not belong to the user region for a regional user', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .get(`${testRoute(Sample2Fixture.id)}`)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(RegionalCoordinator);
      await forbiddenRequestTest(RegionalObserver);
    });

    test('should get the sample', async () => {
      const successRequestTest = async (user: UserRefined) => {
        const res = await request(app)
          .get(`${testRoute(Sample11Fixture.id)}`)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_OK);

        expect(res.body).toMatchObject(
          withISOStringDates({
            ...Sample11Fixture,
            createdAt: Sample11Fixture.createdAt,
            lastUpdatedAt: Sample11Fixture.lastUpdatedAt
          })
        );
      };

      await successRequestTest(Sampler1Fixture);
      await successRequestTest(RegionalCoordinator);
      await successRequestTest(RegionalObserver);
      await successRequestTest(NationalCoordinator);
      await successRequestTest(NationalObserver);
      await successRequestTest(AdminFixture);
    });
  });

  describe('GET /samples/{sampleId}/items/{itemNumber}/copy/{copyNumber}/document', () => {
    const testRoute = (
      sampleId: string,
      itemNumber: number,
      copyNumber: number
    ) =>
      `/api/samples/${sampleId}/items/${itemNumber}/copy/${copyNumber}/document`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(Sample11Fixture.id, 1, 1))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid sample id', async () => {
      await request(app)
        .get(`${testRoute(fakerFR.string.alphanumeric(32), 1, 1)}`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the sample does not exist', async () => {
      await request(app)
        .get(`${testRoute(uuidv4(), 1, 1)}`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should fail if the sample does not belong to the user region', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .get(`${testRoute(Sample2Fixture.id, 1, 1)}`)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(RegionalCoordinator);
      await forbiddenRequestTest(RegionalObserver);
    });

    test('should successfully get the document', async () => {
      const successRequestTest = async (user: UserRefined) => {
        await request(app)
          .get(`${testRoute(Sample11Fixture.id, 1, 1)}`)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_OK);
      };

      await successRequestTest(Sampler1Fixture);
      await successRequestTest(RegionalCoordinator);
      await successRequestTest(RegionalObserver);
      await successRequestTest(NationalCoordinator);
      await successRequestTest(NationalObserver);
      await successRequestTest(AdminFixture);

      expect(mockGenerateSampleSupportPDF).toHaveBeenCalledTimes(6);
    });
  });

  describe('GET /samples', () => {
    const testRoute = (params: Record<string, string>) =>
      `/api/samples?${new URLSearchParams(params).toString()}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute({}))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should find the samples with query parameters restricted to the user region', async () => {
      const successRequestTest = async (user: UserRefined) => {
        const res = await request(app)
          .get(
            testRoute({
              programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
              statuses: 'Sent'
            })
          )
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_OK);

        const expectedSamples = [
          expect.objectContaining({
            id: Sample13Fixture.id
          })
        ].map(withISOStringDates);
        expect(res.body).toHaveLength(expectedSamples.length);
        expectArrayToContainElements(res.body, expectedSamples);
      };

      await successRequestTest(Sampler1Fixture);
      await successRequestTest(RegionalCoordinator);
      await successRequestTest(RegionalObserver);
    });

    test('should find the samples with query parameters restricted to the user programming plan kinds', async () => {
      const res = await request(app)
        .get(testRoute({}))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      const expectedSamples = [
        Sample11Fixture,
        Sample12Fixture,
        Sample13Fixture
      ]
        .map((sample) =>
          expect.objectContaining({
            id: sample.id
          })
        )
        .map(withISOStringDates);
      expect(res.body).toHaveLength(expectedSamples.length);
      expectArrayToContainElements(res.body, expectedSamples);
    });

    test('should find the samples with query parameters restricted to the daoa sampler company', async () => {
      const res = await request(app)
        .get(
          testRoute({
            programmingPlanId: DAOAInProgressProgrammingPlanFixture.id
          })
        )
        .use(tokenProvider(SamplerDaoaFixture))
        .expect(constants.HTTP_STATUS_OK);

      const expectedSamples = [
        expect.objectContaining({
          id: SampleDAOA1Fixture.id
        })
      ].map(withISOStringDates);
      expect(res.body).toHaveLength(expectedSamples.length);
      expectArrayToContainElements(res.body, expectedSamples);
    });

    test('should find national samples with a list of statuses', async () => {
      const successRequestTest = async (user: UserRefined) => {
        const res = await request(app)
          .get(
            testRoute({
              programmingPlanIds: PPVValidatedProgrammingPlanFixture.id,
              status: 'Sent,Draft'
            })
          )
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_OK);

        const expectedSamples = [
          {
            ...omit(Sample11Fixture, ['items']),
            createdAt: Sample11Fixture.createdAt,
            lastUpdatedAt: Sample11Fixture.lastUpdatedAt,
            documentIds: []
          },
          expect.objectContaining({
            id: Sample12Fixture.id
          }),
          expect.objectContaining({
            id: Sample2Fixture.id
          }),
          expect.objectContaining({
            id: Sample13Fixture.id
          })
        ].map(withISOStringDates);
        expect(res.body).toHaveLength(expectedSamples.length);
        expectArrayToContainElements(res.body, expectedSamples);
      };

      await successRequestTest(NationalCoordinator);
      await successRequestTest(NationalObserver);
      await successRequestTest(AdminFixture);
    });
  });

  describe('GET /samples/count', () => {
    const testRoute = (params: Record<string, string>) =>
      `/api/samples/count?${new URLSearchParams(params).toString()}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute({}))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should count the samples with query parameters restricted to the user region', async () => {
      const successRequestTest = async (user: UserRefined) => {
        const res = await request(app)
          .get(
            testRoute({
              programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
              statuses: 'Sent'
            })
          )
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_OK);

        expect(res.body).toMatchObject({ count: 1 });
      };

      await successRequestTest(Sampler1Fixture);
      await successRequestTest(RegionalCoordinator);
      await successRequestTest(RegionalObserver);
    });

    test('should count national samples with a list of statuses', async () => {
      const successRequestTest = async (user: UserRefined) => {
        const res = await request(app)
          .get(
            testRoute({
              programmingPlanIds: PPVValidatedProgrammingPlanFixture.id,
              status: 'Sent,Draft'
            })
          )
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_OK);

        expect(res.body).toMatchObject({ count: 4 });
      };

      await successRequestTest(NationalCoordinator);
      await successRequestTest(NationalObserver);
      await successRequestTest(AdminFixture);
    });
  });

  describe('POST /samples', () => {
    const testRoute = '/api/samples';

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .send(genSampleContextData())
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .post(testRoute)
          .send(payload)
          .use(tokenProvider(Sampler1Fixture))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest({ ...genSampleContextData(), resytalId: 123 });
      await badRequestTest({ ...genSampleContextData(), geolocation: '123' });
      await badRequestTest({
        ...genSampleContextData(),
        geolocation: {
          latitude: undefined
        }
      });
      const badRequest = await badRequestTest({
        ...genSampleContextData(),
        geolocation: {
          x: 0,
          y: 0
        }
      });
      expect(badRequest.text).toMatchInlineSnapshot(
        `"{"name":"BadCoordinatesError","message":"Coordonnées GPS incorrectes."}"`
      );

      await badRequestTest({
        ...genSampleContextData(),
        programmingPlanId: '123'
      });
      await badRequestTest({ ...genSampleContextData(), legalContext: '123' });
      await badRequestTest({
        ...genSampleContextData(),
        sampledDate: 'invalid-date'
      });
    });

    test('should fail if the user does not have the permission to create samples', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .post(testRoute)
          .send(genSampleContextData())
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(RegionalCoordinator);
      await forbiddenRequestTest(NationalCoordinator);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(AdminFixture);
      const forbiddenRequest = await forbiddenRequestTest(Sampler2Fixture);
      expect(forbiddenRequest.text).toMatchInlineSnapshot(
        `"{"name":"BadDepartmentError","message":"Vous n'avez pas les droits dans le département Ardennes"}"`
      );
    });

    test('should create a sample with incremental reference', async () => {
      const successRequestTest = async (
        user: UserRefined,
        expectedIncrement: string
      ) => {
        const sampleId = uuidv4();
        const res = await request(app)
          .post(testRoute)
          .send({
            ...sample,
            id: sampleId
          })
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_CREATED);

        expect(res.body).toMatchObject(
          withISOStringDates({
            ...sample,
            id: sampleId,
            createdAt: expect.any(String),
            sampler: {
              id: sample.sampler.id,
              name: sample.sampler.name
            },
            reference: `${Regions[user.region as Region].shortName}-${format(new Date(), 'yy')}-0000${expectedIncrement}`
          })
        );

        await expect(
          Samples().where({ id: res.body.id }).first()
        ).resolves.toBeDefined();
      };

      await successRequestTest(Sampler1Fixture, '1');
      await successRequestTest(Sampler1Fixture, '2');
    });
  });

  describe('PUT /samples/{sampleId}', () => {
    const testRoute = (sampleId: string) => `/api/samples/${sampleId}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(`${testRoute(Sample11Fixture.id)}`)
        .send({})
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid sample id', async () => {
      await request(app)
        .put(`${testRoute(fakerFR.string.alphanumeric(32))}`)
        .send({})
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the sample does not exist', async () => {
      await request(app)
        .put(`${testRoute(uuidv4())}`)
        .send(genCreatedPartialSample())
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should fail if the sample region does not match the user region', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .put(`${testRoute(Sample2Fixture.id)}`)
          .send(Sample2Fixture)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(RegionalCoordinator);
    });

    test('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .put(`${testRoute(Sample11Fixture.id)}`)
          .send({ ...Sample11Fixture, ...payload })
          .use(tokenProvider(Sampler1Fixture))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest({ matrix: 123 });
      await badRequestTest({
        items: [
          {
            ...genSampleItem({
              sampleId: Sample11Fixture.id,
              copyNumber: 1
            }),
            quantity: '123'
          }
        ]
      });
      await badRequestTest({
        items: [
          {
            ...genSampleItem({
              sampleId: Sample11Fixture.id,
              copyNumber: 1
            }),
            quantityUnit: 123
          }
        ]
      });
      const badRequest = await badRequestTest({
        ...genSampleContextData(),
        geolocation: {
          x: 0,
          y: 0
        }
      });
      expect(badRequest.text).toMatchInlineSnapshot(
        `"{"name":"BadCoordinatesError","message":"Coordonnées GPS incorrectes."}"`
      );
    });

    const validBody = {
      ...Sample11Fixture,
      matrix: oneOf(MatrixEffective.options),
      stage: null,
      items: [
        genSampleItem({
          sampleId: Sample11Fixture.id,
          copyNumber: 1
        })
      ]
    };

    test('should fail if the user does not have the permission to update samples', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .put(`${testRoute(Sample11Fixture.id)}`)
          .send(Sample11Fixture)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(RegionalCoordinator);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(NationalCoordinator);
      await forbiddenRequestTest(AdminFixture);
    });

    test('should update a partial sample', async () => {
      const successRequestTest = async (user: UserRefined) => {
        const res = await request(app)
          .put(`${testRoute(Sample11Fixture.id)}`)
          .send(validBody)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_OK);

        expect(res.body).toMatchObject(
          withISOStringDates({
            ...Sample11Fixture,
            createdAt: Sample11Fixture.createdAt,
            lastUpdatedAt: expect.any(String),
            matrix: validBody.matrix,
            stage: validBody.stage,
            items: validBody.items,
            prescriptionId: null,
            monoSubstances: null,
            multiSubstances: null
          })
        );

        await expect(
          Samples()
            .where({ id: Sample11Fixture.id, matrix: validBody.matrix })
            .first()
        ).resolves.toBeDefined();

        await expect(
          SampleItems()
            .where({ sampleId: Sample11Fixture.id, copyNumber: 1 })
            .first()
        ).resolves.toBeDefined();
      };

      await successRequestTest(Sampler1Fixture);
    });

    test('should be forbidden to send a sample with sampleAt in the future', async () => {
      await Samples()
        .where({
          id: Sample11Fixture.id
        })
        .update({
          step: 'Submitted',
          ownerAgreement: true,
          sentAt: null
        });

      await request(app)
        .put(`${testRoute(Sample11Fixture.id)}`)
        .send({
          ...Sample11Fixture,
          step: 'Sent',
          sampledDate: toMaestroDate(addDays(new Date(), 1))
        })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should be forbidden to send a DAOA_BOVIN sample without seizure', async () => {
      const sampleId = uuidv4();
      const sample = genCreatedPartialSample({
        id: sampleId,
        sampler: SamplerDaoaFixture,
        programmingPlanId: DAOAInProgressProgrammingPlanFixture.id,
        region: SamplerDaoaFixture.region,
        department: SamplerDaoaFixture.department,
        company: SlaughterhouseCompanyFixture1,
        step: 'Submitted',
        ownerAgreement: true,
        matrixKind: 'A0C0Z',
        matrix: 'A0BAV',
        programmingPlanKind: 'DAOA_BOVIN',
        specificData: {
          killingCode: '1234',
          sampling: 'Aléatoire',
          animalUniqueIdentifier: 'FR1234567890',
          animalKind: 'TYPEA1',
          sex: 'SEX1',
          ageInMonths: 24,
          productionKind: 'PROD_1',
          outdoorAccess: 'PAT1'
        }
      });
      await Samples().insert(formatPartialSample(sample));

      await request(app)
        .put(`${testRoute(sampleId)}`)
        .send({
          ...sample,
          step: 'Sent'
        })
        .use(tokenProvider(SamplerDaoaFixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should update the sample send date when sending the sample', async () => {
      const successRequestTest = async (user: UserRefined) => {
        await Samples()
          .where({
            id: Sample11Fixture.id
          })
          .update({
            step: 'Submitted',
            ownerAgreement: true,
            sentAt: null
          });

        await request(app)
          .put(`${testRoute(Sample11Fixture.id)}`)
          .send({
            ...Sample11Fixture,
            step: 'Sent'
          })
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_OK);

        await expect(
          Samples()
            .where({
              id: Sample11Fixture.id
            })
            .first()
        ).resolves.toMatchObject({
          step: 'Sent',
          sentAt: expect.any(Date)
        });
      };

      await successRequestTest(Sampler1Fixture);
    });

    test('should trigger processor when sending a DAOA sample (Submitted → Sent)', async () => {
      await Samples().where({ id: SampleDAOA1Fixture.id }).update({
        step: 'Submitted',
        matrixKind: 'A0C0Z',
        matrix: 'A01GL',
        ownerAgreement: true,
        sentAt: null,
        programmingPlanKind: 'DAOA_VOLAILLE'
      });

      mockTriggerProcessing.mockClear();

      await request(app)
        .put(`${testRoute(SampleDAOA1Fixture.id)}`)
        .send({
          ...SampleDAOA1Fixture,
          step: 'Sent',
          programmingPlanKind: 'DAOA_VOLAILLE',
          items: [
            {
              ...SampleDAOA1Fixture.items![0],
              laboratoryId: LaboratoryFixture.id
            }
          ],
          specificData: {
            ...SampleDAOA1Fixture.specificData,
            outdoorAccess: 'PAT1',
            breedingMethod: 'PROD_1',
            species: 'ESP7',
            ageInDays: 12,
            animalBatchIdentifier: 'id',
            sampling: 'Aléatoire'
          }
        })
        .use(tokenProvider(SamplerDaoaFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(mockTriggerProcessing).toHaveBeenCalledOnce();

      const daiRows = await kysely
        .selectFrom('analysisDai')
        .innerJoin('analysis', 'analysisDai.analysisId', 'analysis.id')
        .where('analysis.sampleId', '=', SampleDAOA1Fixture.id)
        .selectAll('analysisDai')
        .execute();

      expect(daiRows.length).toBe(0);
    });

    test('should trigger processor when sending a PPV sample (Submitted → Sent)', async () => {
      await Samples().where({ id: Sample11Fixture.id }).update({
        step: 'Submitted',
        ownerAgreement: true,
        sentAt: null
      });

      mockTriggerProcessing.mockClear();

      await request(app)
        .put(`${testRoute(Sample11Fixture.id)}`)
        .send({
          ...Sample11Fixture,
          step: 'Sent'
        })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(mockTriggerProcessing).toHaveBeenCalledOnce();
      expect(mockMattermostSend).not.toHaveBeenCalled();

      const daiRows = await kysely
        .selectFrom('analysisDai')
        .innerJoin('analysis', 'analysisDai.analysisId', 'analysis.id')
        .where('analysis.sampleId', '=', Sample11Fixture.id)
        .selectAll('analysisDai')
        .execute();

      expect(daiRows.length).toBe(0);
    });
  });

  describe('PUT /samples/{sampleId}/compliance', () => {
    const testRoute = (sampleId: string) =>
      `/api/samples/${sampleId}/compliance`;

    const complianceData = {
      compliance: 'Compliant' as const,
      notesOnCompliance: 'RAS'
    };

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute(SampleDAOA1Fixture.id))
        .send(complianceData)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid sample id', async () => {
      await request(app)
        .put(testRoute(fakerFR.string.alphanumeric(32)))
        .send(complianceData)
        .use(tokenProvider(SamplerDaoaFixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the sample does not exist', async () => {
      await request(app)
        .put(testRoute(uuidv4()))
        .send(complianceData)
        .use(tokenProvider(SamplerDaoaFixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should fail if the sample does not belong to the user region', async () => {
      await request(app)
        .put(testRoute(SampleDAOA1Fixture.id))
        .send(complianceData)
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the user does not have the permission to update samples', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .put(testRoute(SampleDAOA1Fixture.id))
          .send(complianceData)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(RegionalCoordinator);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(NationalCoordinator);
      await forbiddenRequestTest(AdminFixture);
    });

    test('should be forbidden for a PPV sample', async () => {
      await request(app)
        .put(testRoute(Sample13Fixture.id))
        .send(complianceData)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should update the compliance of a non-PPV sample', async () => {
      const res = await request(app)
        .put(testRoute(SampleDAOA1Fixture.id))
        .send(complianceData)
        .use(tokenProvider(SamplerDaoaFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(complianceData);

      await expect(
        Samples().where({ id: SampleDAOA1Fixture.id }).first()
      ).resolves.toMatchObject({
        compliance: complianceData.compliance,
        notesOnCompliance: complianceData.notesOnCompliance
      });
    });
  });

  describe('DELETE /samples/{sampleId}', () => {
    const testRoute = (sampleId: string) => `/api/samples/${sampleId}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .delete(testRoute(Sample11Fixture.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid sample id', async () => {
      await request(app)
        .delete(testRoute(fakerFR.string.alphanumeric(32)))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the sample does not exist', async () => {
      await request(app)
        .delete(testRoute(uuidv4()))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should fail if the sample does not belong to the user region', async () => {
      await request(app)
        .delete(testRoute(Sample11Fixture.id))
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the user does not have the permission to delete samples', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .delete(testRoute(Sample11Fixture.id))
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(RegionalCoordinator);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(NationalCoordinator);
      await forbiddenRequestTest(AdminFixture);
    });

    test('should be forbidden to delete a sample that is not in draft status', async () => {
      await request(app)
        .delete(testRoute(Sample13Fixture.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should delete the sample', async () => {
      const successRequestTest = async (user: UserRefined) => {
        const sampleId = uuidv4();
        await Samples().insert([
          formatPartialSample(
            genCreatedPartialSample({
              id: sampleId,
              sampler: user,
              region: user.region ?? undefined,
              programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
              company: CompanyFixture
            })
          )
        ]);
        await SampleItems().insert(
          genSampleItem({
            sampleId
          })
        );

        await request(app)
          .delete(testRoute(sampleId))
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_NO_CONTENT);

        await expect(
          Samples().where({ id: sampleId }).first()
        ).resolves.toBeUndefined();

        await expect(
          SampleItems().where({ sampleId }).first()
        ).resolves.toBeUndefined();
      };

      await successRequestTest(Sampler1Fixture);
    });
  });

  describe('PUT /samples/{sampleId}/items/{itemNumber}/copy/{copyNumber}', () => {
    const testRoute = (sampleId: string, itemNumber = 1, copyNumber = 1) =>
      `/api/samples/${sampleId}/items/${itemNumber}/copy/${copyNumber}`;

    const getAnalysis = () =>
      kysely
        .selectFrom('analysis')
        .selectAll()
        .where('sampleId', '=', Sample13Fixture.id)
        .where('itemNumber', '=', 1)
        .where('copyNumber', '=', 1)
        .executeTakeFirst();

    afterEach(async () => {
      await kysely
        .deleteFrom('analysis')
        .where('sampleId', '=', Sample13Fixture.id)
        .execute();
      await kysely.deleteFrom('documents').execute();
    });

    test('should create an analysis with status Sent when isAdmissible is true and no analysis exists', async () => {
      await request(app)
        .put(testRoute(Sample13Fixture.id))
        .send({
          updateKey: 'analysis',
          isAdmissible: true,
          receiptDate: '2026-01-15'
        })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      const created = await getAnalysis();
      expect(created?.status).toBe('Sent');
    });

    test('should create a NotAdmissible analysis when isAdmissible is false and no analysis exists', async () => {
      await request(app)
        .put(testRoute(Sample13Fixture.id))
        .send({
          updateKey: 'analysis',
          isAdmissible: false,
          receiptDate: '2026-01-15'
        })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      const created = await getAnalysis();
      expect(created?.status).toBe('NotAdmissible');
    });

    test('should set analysis to NotAdmissible when isAdmissible is false', async () => {
      await analysisRepository.insert(
        genPartialAnalysis({
          sampleId: Sample13Fixture.id,
          itemNumber: 1,
          copyNumber: 1,
          createdBy: Sampler1Fixture.id,
          status: 'Sent'
        })
      );

      await request(app)
        .put(testRoute(Sample13Fixture.id))
        .send({
          updateKey: 'analysis',
          isAdmissible: false,
          receiptDate: '2026-01-15'
        })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      const updated = await getAnalysis();
      expect(updated?.status).toBe('NotAdmissible');
    });

    test('should keep the current analysis status when isAdmissible is null and receiptDate is unchanged', async () => {
      await analysisRepository.insert(
        genPartialAnalysis({
          sampleId: Sample13Fixture.id,
          itemNumber: 1,
          copyNumber: 1,
          createdBy: Sampler1Fixture.id,
          status: 'Sent'
        })
      );

      await request(app)
        .put(testRoute(Sample13Fixture.id))
        .send({ updateKey: 'analysis', isAdmissible: null, receiptDate: null })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      const updated = await getAnalysis();
      expect(updated?.status).toBe('Sent');
    });

    test('should set analysis to Analysis when transitioning from Sent to admissible without report document', async () => {
      await analysisRepository.insert(
        genPartialAnalysis({
          sampleId: Sample13Fixture.id,
          itemNumber: 1,
          copyNumber: 1,
          createdBy: Sampler1Fixture.id,
          status: 'Sent'
        })
      );

      await request(app)
        .put(testRoute(Sample13Fixture.id))
        .send({
          updateKey: 'analysis',
          isAdmissible: true,
          receiptDate: '2026-01-15'
        })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      const updated = await getAnalysis();
      expect(updated?.status).toBe('Analysis');
    });

    test('should set analysis to InReview when transitioning from Sent to admissible with a report document', async () => {
      const analysis = genPartialAnalysis({
        sampleId: Sample13Fixture.id,
        itemNumber: 1,
        copyNumber: 1,
        createdBy: Sampler1Fixture.id,
        status: 'Sent'
      });
      await analysisRepository.insert(analysis);

      const doc = genDocument({
        createdBy: Sampler1Fixture.id,
        kind: 'AnalysisReportDocument'
      });
      await documentRepository.insert(doc);
      await analysisReportDocumentsRepository.insert(analysis.id, doc.id);

      await request(app)
        .put(testRoute(Sample13Fixture.id))
        .send({
          updateKey: 'analysis',
          isAdmissible: true,
          receiptDate: '2026-01-15'
        })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      const updated = await getAnalysis();
      expect(updated?.status).toBe('InReview');
    });

    test('should set analysis to Completed when transitioning from NotAdmissible to admissible with compliance', async () => {
      await analysisRepository.insert(
        genPartialAnalysis({
          sampleId: Sample13Fixture.id,
          itemNumber: 1,
          copyNumber: 1,
          createdBy: Sampler1Fixture.id,
          status: 'NotAdmissible',
          compliance: true
        })
      );

      await request(app)
        .put(testRoute(Sample13Fixture.id))
        .send({
          updateKey: 'analysis',
          isAdmissible: true,
          receiptDate: '2026-01-15'
        })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      const updated = await getAnalysis();
      expect(updated?.status).toBe('Completed');
    });

    test('should keep the current analysis status when isAdmissible is true but status is not NotAdmissible or Sent', async () => {
      await analysisRepository.insert(
        genPartialAnalysis({
          sampleId: Sample13Fixture.id,
          itemNumber: 1,
          copyNumber: 1,
          createdBy: Sampler1Fixture.id,
          status: 'Analysis'
        })
      );

      await request(app)
        .put(testRoute(Sample13Fixture.id))
        .send({
          updateKey: 'analysis',
          isAdmissible: true,
          receiptDate: '2026-01-15'
        })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      const updated = await getAnalysis();
      expect(updated?.status).toBe('Analysis');
    });

    test('should keep the current analysis status when updateKey is not analysis', async () => {
      await analysisRepository.insert(
        genPartialAnalysis({
          sampleId: Sample13Fixture.id,
          itemNumber: 1,
          copyNumber: 1,
          createdBy: Sampler1Fixture.id,
          status: 'Analysis'
        })
      );

      await request(app)
        .put(testRoute(Sample13Fixture.id))
        .send({ updateKey: 'shipping' })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      const updated = await getAnalysis();
      expect(updated?.status).toBe('Analysis');
    });
  });
});
