import { format } from 'date-fns';
import { constants } from 'http2';
import { omit } from 'lodash-es';
import { MatrixList } from 'maestro-shared/referential/Matrix/Matrix';
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
import randomstring from 'randomstring';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { SampleItems } from '../../repositories/sampleItemRepository';
import { Samples } from '../../repositories/sampleRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

import { ValidatedProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
import {
  NationalCoordinator,
  Sampler1Fixture,
  Sampler2Fixture
} from 'maestro-shared/test/userFixtures';
import { describe, expect, test } from 'vitest';
describe('Sample router', () => {
  const { app } = createServer();

  const sample = genSampleContextData({
    programmingPlanId: ValidatedProgrammingPlanFixture.id
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
        .get(`${testRoute(randomstring.generate())}`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the sample does not exist', async () => {
      await request(app)
        .get(`${testRoute(uuidv4())}`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should fail if the sample does not belong to the user region', async () => {
      await request(app)
        .get(`${testRoute(Sample11Fixture.id)}`)
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should get the sample', async () => {
      const res = await request(app)
        .get(testRoute(Sample11Fixture.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...Sample11Fixture,
        createdAt: Sample11Fixture.createdAt.toISOString(),
        lastUpdatedAt: Sample11Fixture.lastUpdatedAt.toISOString(),
        sampledAt: Sample11Fixture.sampledAt.toISOString()
      });
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
        .get(`${testRoute(randomstring.generate(), 1)}`)
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
      await request(app)
        .get(`${testRoute(Sample11Fixture.id, 1)}`)
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the user does not have the permission to download the sample document', async () => {
      await request(app)
        .get(`${testRoute(Sample11Fixture.id, 1)}`)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
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
      const res = await request(app)
        .get(
          testRoute({
            programmingPlanId: ValidatedProgrammingPlanFixture.id,
            status: 'DraftMatrix'
          })
        )
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject([
        {
          ...omit(Sample11Fixture, ['items']),
          createdAt: Sample11Fixture.createdAt.toISOString(),
          lastUpdatedAt: Sample11Fixture.lastUpdatedAt.toISOString(),
          sampledAt: Sample11Fixture.sampledAt.toISOString()
        }
      ]);
    });

    test('should find national samples with a list of statuses', async () => {
      const res = await request(app)
        .get(
          testRoute({
            programmingPlanId: ValidatedProgrammingPlanFixture.id,
            status: 'DraftMatrix,Draft'
          })
        )
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        expect.arrayContaining([
          {
            ...omit(Sample11Fixture, ['items']),
            createdAt: Sample11Fixture.createdAt.toISOString(),
            lastUpdatedAt: Sample11Fixture.lastUpdatedAt.toISOString(),
            sampledAt: Sample11Fixture.sampledAt.toISOString(),
            documentIds: []
          },
          expect.objectContaining({
            id: Sample12Fixture.id
          }),
          expect.objectContaining({
            id: Sample2Fixture.id
          })
        ])
      );
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
      const res = await request(app)
        .get(
          testRoute({
            programmingPlanId: ValidatedProgrammingPlanFixture.id,
            status: 'DraftMatrix'
          })
        )
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({ count: 1 });
    });

    test('should count national samples with a list of statuses', async () => {
      const res = await request(app)
        .get(
          testRoute({
            programmingPlanId: ValidatedProgrammingPlanFixture.id,
            status: 'DraftMatrix,Draft'
          })
        )
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({ count: 3 });
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
      await badRequestTest({
        ...genSampleContextData(),
        sampledAt: undefined
      });
      await badRequestTest({
        ...genSampleContextData(),
        programmingPlanId: '123'
      });
      await badRequestTest({
        ...genSampleContextData(),
        legalContext: undefined
      });
      await badRequestTest({ ...genSampleContextData(), legalContext: '123' });
      await badRequestTest({
        ...genSampleContextData(),
        department: undefined
      });
      await badRequestTest({ ...genSampleContextData(), department: '123' });
      await badRequestTest({ ...genSampleContextData(), department: '' });
      await badRequestTest({ ...genSampleContextData(), department: 123 });
      await badRequestTest({
        ...genSampleContextData(),
        sampledAt: 'invalid date'
      });
      await badRequestTest({ ...genSampleContextData(), sampledAt: null });
    });

    test('should fail if the user does not have the permission to create samples', async () => {
      await request(app)
        .post(testRoute)
        .send(genSampleContextData())
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should create a sample', async () => {
      const res = await request(app)
        .post(testRoute)
        .send(sample)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject({
        ...sample,
        id: sample.id,
        createdAt: expect.any(String),
        sampler: {
          id: Sampler1Fixture.id,
          firstName: Sampler1Fixture.firstName,
          lastName: Sampler1Fixture.lastName
        },
        sampledAt: sample.sampledAt.toISOString(),
        reference: `${Regions[Sampler1Fixture.region as Region].shortName}-${
          sample.department
        }-${format(new Date(), 'yy')}-0001-${sample.legalContext}`,
        status: sample.status
      });

      await expect(
        Samples().where({ id: res.body.id }).first()
      ).resolves.toBeDefined();
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
        .put(`${testRoute(randomstring.generate())}`)
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

    test('should fail if the sample does not belong to the user', async () => {
      await request(app)
        .put(`${testRoute(Sample11Fixture.id)}`)
        .send(Sample11Fixture)
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
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
    });

    const validBody = {
      ...Sample11Fixture,
      matrix: oneOf(MatrixList),
      items: [
        genSampleItem({
          sampleId: Sample11Fixture.id,
          itemNumber: 1
        })
      ]
    };

    test('should fail if the user does not have the permission to update samples', async () => {
      await request(app)
        .put(`${testRoute(Sample11Fixture.id)}`)
        .send(validBody)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should update a partial sample', async () => {
      const res = await request(app)
        .put(`${testRoute(Sample11Fixture.id)}`)
        .send(validBody)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...Sample11Fixture,
        createdAt: Sample11Fixture.createdAt.toISOString(),
        lastUpdatedAt: expect.any(String),
        sampledAt: Sample11Fixture.sampledAt.toISOString(),
        matrix: validBody.matrix,
        items: validBody.items
      });

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
    });

    test('should update the sample compliance', async () => {
      await request(app)
        .put(`${testRoute(Sample11Fixture.id)}`)
        .send({
          ...validBody,
          status: 'Analysis',
          notesOnAdmissibility: 'Admissible'
        })
        .use(tokenProvider(Sampler1Fixture))
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
        .delete(testRoute(randomstring.generate()))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the sample does not exist', async () => {
      await request(app)
        .delete(testRoute(uuidv4()))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should fail if the sample does not belong to the user', async () => {
      await request(app)
        .delete(testRoute(Sample11Fixture.id))
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the user does not have the permission to delete samples', async () => {
      await request(app)
        .delete(testRoute(Sample11Fixture.id))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should be forbidden to delete a sample that is not in draft status', async () => {
      await request(app)
        .delete(testRoute(Sample13Fixture.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should delete the sample', async () => {
      await request(app)
        .delete(testRoute(sample.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      await expect(
        Samples().where({ id: sample.id }).first()
      ).resolves.toBeUndefined();

      await expect(
        SampleItems().where({ sampleId: sample.id }).first()
      ).resolves.toBeUndefined();
    });
  });
});
