import { format } from 'date-fns';
import { constants } from 'http2';
import { omit } from 'lodash-es';
import { MatrixEffective } from 'maestro-shared/referential/Matrix/Matrix';
import { Region, Regions } from 'maestro-shared/referential/Region';
import {
  genCreatedPartialSample,
  genSampleContextData,
  genSampleItem,
  Sample11Fixture,
  Sample12Fixture,
  Sample13Fixture,
  Sample2Fixture
} from 'maestro-shared/test/sampleFixtures';
import { oneOf } from 'maestro-shared/test/testFixtures';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { SampleItems } from '../../repositories/sampleItemRepository';
import {
  formatPartialSample,
  Samples
} from '../../repositories/sampleRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

import { fakerFR } from '@faker-js/faker';
import { User } from 'maestro-shared/schema/User/User';
import { CompanyFixture } from 'maestro-shared/test/companyFixtures';
import { ValidatedProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
import {
  AdminFixture,
  NationalCoordinator,
  NationalObserver,
  RegionalCoordinator,
  RegionalObserver,
  Sampler1Fixture,
  Sampler2Fixture,
  SamplerAndNationalObserver
} from 'maestro-shared/test/userFixtures';
import { withISOStringDates } from 'maestro-shared/utils/utils';
import { beforeAll, describe, expect, test } from 'vitest';
import { departmentsSeed } from '../../database/seeds/departments/departmentsSeed';
import { mockGenerateSampleSupportPDF } from '../../test/setupTests';

beforeAll(async () => {
  await departmentsSeed();
});
describe('Sample router', () => {
  const { app } = createServer();

  const sample = genSampleContextData({
    programmingPlanId: ValidatedProgrammingPlanFixture.id,
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
      const forbiddenRequestTest = async (user: User) =>
        request(app)
          .get(`${testRoute(Sample2Fixture.id)}`)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(RegionalCoordinator);
      await forbiddenRequestTest(RegionalObserver);
    });

    test('should get the sample', async () => {
      const successRequestTest = async (user: User) => {
        const res = await request(app)
          .get(`${testRoute(Sample11Fixture.id)}`)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_OK);

        expect(res.body).toMatchObject(
          withISOStringDates({
            ...Sample11Fixture,
            createdAt: Sample11Fixture.createdAt,
            lastUpdatedAt: Sample11Fixture.lastUpdatedAt,
            sampledAt: Sample11Fixture.sampledAt
          })
        );
      };

      await successRequestTest(Sampler1Fixture);
      await successRequestTest(RegionalCoordinator);
      await successRequestTest(RegionalObserver);
      await successRequestTest(NationalCoordinator);
      await successRequestTest(NationalObserver);
      await successRequestTest(SamplerAndNationalObserver);
      await successRequestTest(AdminFixture);
    });
  });

  describe('GET /samples/{sampleId}/items/{itemNumber}/document', () => {
    const testRoute = (sampleId: string, itemNumber: number) =>
      `/api/samples/${sampleId}/items/${itemNumber}/document`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(Sample11Fixture.id, 1))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid sample id', async () => {
      await request(app)
        .get(`${testRoute(fakerFR.string.alphanumeric(32), 1)}`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the sample does not exist', async () => {
      await request(app)
        .get(`${testRoute(uuidv4(), 1)}`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should fail if the sample does not belong to the user region', async () => {
      const forbiddenRequestTest = async (user: User) =>
        request(app)
          .get(`${testRoute(Sample2Fixture.id, 1)}`)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(RegionalCoordinator);
      await forbiddenRequestTest(RegionalObserver);
    });

    test('should successfully get the document', async () => {
      const successRequestTest = async (user: User) => {
        await request(app)
          .get(`${testRoute(Sample11Fixture.id, 1)}`)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_OK);
      };

      await successRequestTest(Sampler1Fixture);
      await successRequestTest(RegionalCoordinator);
      await successRequestTest(RegionalObserver);
      await successRequestTest(NationalCoordinator);
      await successRequestTest(NationalObserver);
      await successRequestTest(SamplerAndNationalObserver);
      await successRequestTest(AdminFixture);

      expect(mockGenerateSampleSupportPDF).toHaveBeenCalledTimes(7);
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

    test('should fail if the programmingPlanId is not provided', async () => {
      await request(app)
        .get(testRoute({}))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should find the samples with query parameters restricted to the user region', async () => {
      const successRequestTest = async (user: User) => {
        const res = await request(app)
          .get(
            testRoute({
              programmingPlanId: ValidatedProgrammingPlanFixture.id,
              status: 'DraftMatrix'
            })
          )
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_OK);

        const expectedSamples = [
          expect.objectContaining({
            ...omit(Sample11Fixture, ['items']),
            createdAt: Sample11Fixture.createdAt,
            lastUpdatedAt: Sample11Fixture.lastUpdatedAt,
            sampledAt: Sample11Fixture.sampledAt
          })
        ].map(withISOStringDates);
        expect(res.body).toHaveLength(expectedSamples.length);
        expect(res.body).toEqual(expect.arrayContaining(expectedSamples));
      };

      await successRequestTest(Sampler1Fixture);
      await successRequestTest(RegionalCoordinator);
      await successRequestTest(RegionalObserver);
    });

    test('should find national samples with a list of statuses', async () => {
      const successRequestTest = async (user: User) => {
        const res = await request(app)
          .get(
            testRoute({
              programmingPlanId: ValidatedProgrammingPlanFixture.id,
              status: 'DraftMatrix,Draft'
            })
          )
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_OK);

        const expectedSamples = [
          {
            ...omit(Sample11Fixture, ['items']),
            createdAt: Sample11Fixture.createdAt,
            lastUpdatedAt: Sample11Fixture.lastUpdatedAt,
            sampledAt: Sample11Fixture.sampledAt,
            documentIds: []
          },
          expect.objectContaining({
            id: Sample12Fixture.id
          }),
          expect.objectContaining({
            id: Sample2Fixture.id
          })
        ].map(withISOStringDates);
        expect(res.body).toHaveLength(expectedSamples.length);
        expect(res.body).toEqual(expect.arrayContaining(expectedSamples));
      };

      await successRequestTest(NationalCoordinator);
      await successRequestTest(NationalObserver);
      await successRequestTest(SamplerAndNationalObserver);
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

    test('should fail if the programmingPlanId is not provided', async () => {
      await request(app)
        .get(testRoute({}))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should count the samples with query parameters restricted to the user region', async () => {
      const successRequestTest = async (user: User) => {
        const res = await request(app)
          .get(
            testRoute({
              programmingPlanId: ValidatedProgrammingPlanFixture.id,
              status: 'DraftMatrix'
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
      const successRequestTest = async (user: User) => {
        const res = await request(app)
          .get(
            testRoute({
              programmingPlanId: ValidatedProgrammingPlanFixture.id,
              status: 'DraftMatrix,Draft'
            })
          )
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_OK);

        expect(res.body).toMatchObject({ count: 3 });
      };

      await successRequestTest(NationalCoordinator);
      await successRequestTest(NationalObserver);
      await successRequestTest(SamplerAndNationalObserver);
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
        `"Coordonnées GPS incorrectes."`
      );

      await badRequestTest({
        ...genSampleContextData(),
        programmingPlanId: '123'
      });
      await badRequestTest({ ...genSampleContextData(), legalContext: '123' });
      await badRequestTest({
        ...genSampleContextData(),
        sampledAt: 'invalid date'
      });
    });

    test('should fail if the user does not have the permission to create samples', async () => {
      const forbiddenRequestTest = async (user: User) =>
        request(app)
          .post(testRoute)
          .send(genSampleContextData())
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(NationalCoordinator);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(AdminFixture);
      const forbiddenRequest = await forbiddenRequestTest(Sampler2Fixture);
      expect(forbiddenRequest.text).toMatchInlineSnapshot(
        `"Vous n'avez pas les droits dans le département Ardennes"`
      );
    });

    test('should create a sample with incremental reference', async () => {
      const successRequestTest = async (
        user: User,
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
              firstName: sample.sampler.firstName,
              lastName: sample.sampler.lastName
            },
            reference: `${Regions[user.region as Region].shortName}-${format(new Date(), 'yy')}-000${expectedIncrement}`
          })
        );

        await expect(
          Samples().where({ id: res.body.id }).first()
        ).resolves.toBeDefined();
      };

      await successRequestTest(Sampler1Fixture, '1');
      await successRequestTest(Sampler1Fixture, '2');
      await successRequestTest(RegionalCoordinator, '3');
      await successRequestTest(SamplerAndNationalObserver, '4');
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
      const forbiddenRequestTest = async (user: User) =>
        request(app)
          .put(`${testRoute(Sample2Fixture.id)}`)
          .send(Sample2Fixture)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(RegionalCoordinator);
      await forbiddenRequestTest(SamplerAndNationalObserver);
    });

    test('should fail if the user does not have the permission to set the status to InReview', async () => {
      const forbiddenRequestTest = async (user: User) =>
        request(app)
          .put(`${testRoute(Sample11Fixture.id)}`)
          .send({ ...Sample11Fixture, status: 'InReview' })
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(SamplerAndNationalObserver);
      await forbiddenRequestTest(RegionalCoordinator);
      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(NationalCoordinator);
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
              itemNumber: 1
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
              itemNumber: 1
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
        `"Coordonnées GPS incorrectes."`
      );
    });

    const validBody = {
      ...Sample11Fixture,
      matrix: oneOf(MatrixEffective.options),
      items: [
        genSampleItem({
          sampleId: Sample11Fixture.id,
          itemNumber: 1
        })
      ]
    };

    test('should fail if the user does not have the permission to update samples', async () => {
      const forbiddenRequestTest = async (user: User) =>
        request(app)
          .put(`${testRoute(Sample11Fixture.id)}`)
          .send(Sample11Fixture)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(NationalCoordinator);
      await forbiddenRequestTest(AdminFixture);
    });

    test('should update a partial sample', async () => {
      const successRequestTest = async (user: User) => {
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
            sampledAt: Sample11Fixture.sampledAt,
            matrix: validBody.matrix,
            items: validBody.items
          })
        );

        await expect(
          Samples()
            .where({ id: Sample11Fixture.id, matrix: validBody.matrix })
            .first()
        ).resolves.toBeDefined();

        await expect(
          SampleItems()
            .where({ sampleId: Sample11Fixture.id, itemNumber: 1 })
            .first()
        ).resolves.toBeDefined();
      };

      await successRequestTest(Sampler1Fixture);
      await successRequestTest(RegionalCoordinator);
      await successRequestTest(SamplerAndNationalObserver);
    });

    test('should update the sample send date when sending the sample', async () => {
      const successRequestTest = async (user: User) => {
        await Samples()
          .where({
            id: Sample11Fixture.id
          })
          .update({
            status: 'Submitted',
            ownerAgreement: true,
            sentAt: null
          });

        await request(app)
          .put(`${testRoute(Sample11Fixture.id)}`)
          .send({
            ...validBody,
            status: 'Sent'
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
          status: 'Sent',
          sentAt: expect.any(Date)
        });
      };

      await successRequestTest(Sampler1Fixture);
      await successRequestTest(RegionalCoordinator);
      await successRequestTest(SamplerAndNationalObserver);
    });

    test('should update the sample compliance', async () => {
      const successRequestTest = async (user: User) => {
        await request(app)
          .put(`${testRoute(Sample11Fixture.id)}`)
          .send({
            ...validBody,
            status: 'Analysis',
            notesOnAdmissibility: 'Admissible'
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
          status: 'Analysis',
          notesOnAdmissibility: 'Admissible'
        });
      };

      await successRequestTest(Sampler1Fixture);
      await successRequestTest(RegionalCoordinator);
      await successRequestTest(SamplerAndNationalObserver);
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
      const forbiddenRequestTest = async (user: User) =>
        request(app)
          .delete(testRoute(Sample11Fixture.id))
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(RegionalObserver);
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
      const successRequestTest = async (user: User) => {
        const sampleId = uuidv4();
        await Samples().insert([
          formatPartialSample(
            genCreatedPartialSample({
              id: sampleId,
              sampler: user,
              region: user.region ?? undefined,
              programmingPlanId: ValidatedProgrammingPlanFixture.id,
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
      await successRequestTest(RegionalCoordinator);
      await successRequestTest(SamplerAndNationalObserver);
    });
  });
});
