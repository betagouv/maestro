import { format } from 'date-fns';
import { constants } from 'http2';
import { default as fp } from 'lodash';
import randomstring from 'randomstring';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import {
  NationalCoordinator,
  Region1Fixture,
  Region2Fixture,
  Sampler1Fixture,
  Sampler2Fixture,
} from '../../../database/seeds/test/001-users';
import { ProgrammingPlanFixture } from '../../../database/seeds/test/002-programming-plans';
import { CompanyFixture } from '../../../database/seeds/test/003-companies';
import { MatrixList } from '../../../shared/referential/Matrix/Matrix';
import { Regions } from '../../../shared/referential/Region';
import { SampleStatus } from '../../../shared/schema/Sample/SampleStatus';
import {
  genCreatedSample,
  genPartialSample,
  genSampleItem,
  genSampleToCreate,
} from '../../../shared/test/sampleFixtures';
import { oneOf } from '../../../shared/test/testFixtures';
import db from '../../repositories/db';
import { SampleItems } from '../../repositories/sampleItemRepository';
import {
  formatPartialSample,
  Samples,
} from '../../repositories/sampleRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Sample router', () => {
  const { app } = createServer();

  const sample11Id = uuidv4();
  const sampleItem1 = genSampleItem(sample11Id, 1);
  const sample11 = {
    ...genPartialSample(
      Sampler1Fixture,
      ProgrammingPlanFixture.id,
      CompanyFixture
    ),
    id: sample11Id,
    items: [sampleItem1],
    status: 'DraftMatrix' as SampleStatus,
    department: oneOf(Regions[Region1Fixture].departments),
  };
  const sample12 = {
    ...genPartialSample(
      Sampler1Fixture,
      ProgrammingPlanFixture.id,
      CompanyFixture
    ),
    id: uuidv4(),
    status: 'Draft' as SampleStatus,
    department: oneOf(Regions[Region1Fixture].departments),
  };
  const sample13 = {
    ...genPartialSample(
      Sampler1Fixture,
      ProgrammingPlanFixture.id,
      CompanyFixture
    ),
    id: uuidv4(),
    status: 'Sent' as SampleStatus,
    department: oneOf(Regions[Region1Fixture].departments),
  };
  const sample2 = {
    ...genPartialSample(
      Sampler2Fixture,
      ProgrammingPlanFixture.id,
      CompanyFixture
    ),
    status: 'DraftMatrix' as SampleStatus,
    department: oneOf(Regions[Region2Fixture].departments),
  };

  beforeAll(async () => {
    await db.seed.run();
    await Samples().insert([
      formatPartialSample(sample11),
      formatPartialSample(sample12),
      formatPartialSample(sample13),
      formatPartialSample(sample2),
    ]);
    await SampleItems().insert(sampleItem1);
  });

  describe('GET /samples/{sampleId}', () => {
    const testRoute = (sampleId: string) => `/api/samples/${sampleId}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(sample11.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid sample id', async () => {
      await request(app)
        .get(`${testRoute(randomstring.generate())}`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the sample does not exist', async () => {
      await request(app)
        .get(`${testRoute(uuidv4())}`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the sample does not belong to the user region', async () => {
      await request(app)
        .get(`${testRoute(sample11.id)}`)
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should get the sample', async () => {
      const res = await request(app)
        .get(testRoute(sample11.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...sample11,
        createdAt: sample11.createdAt.toISOString(),
        lastUpdatedAt: sample11.lastUpdatedAt.toISOString(),
        sampledAt: sample11.sampledAt.toISOString(),
      });
    });
  });

  describe('GET /samples/{sampleId}/items/{itemNumber}/document', () => {
    const testRoute = (sampleId: string, itemNumber: number) =>
      `/api/samples/${sampleId}/items/${itemNumber}/document`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(sample11.id, 1))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid sample id', async () => {
      await request(app)
        .get(`${testRoute(randomstring.generate(), 1)}`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the sample does not exist', async () => {
      await request(app)
        .get(`${testRoute(uuidv4(), 1)}`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the item does not exist', async () => {
      await request(app)
        .get(`${testRoute(sample11.id, 2)}`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the sample does not belong to the user region', async () => {
      await request(app)
        .get(`${testRoute(sample11.id, 1)}`)
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the user does not have the permission to download the sample document', async () => {
      await request(app)
        .get(`${testRoute(sample11.id, 1)}`)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });
  });

  describe('GET /samples', () => {
    const testRoute = (params: Record<string, string>) =>
      `/api/samples?${new URLSearchParams(params).toString()}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute({}))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should find the samples with query parameters restricted to the user region', async () => {
      const res = await request(app)
        .get(testRoute({ status: 'DraftMatrix' }))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject([
        {
          ...fp.omit(sample11, ['items']),
          createdAt: sample11.createdAt.toISOString(),
          lastUpdatedAt: sample11.lastUpdatedAt.toISOString(),
          sampledAt: sample11.sampledAt.toISOString(),
        },
      ]);
    });

    it('should find national samples with a list of statuses', async () => {
      const res = await request(app)
        .get(testRoute({ status: 'DraftMatrix,Draft' }))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        expect.arrayContaining([
          {
            ...fp.omit(sample2, ['items']),
            createdAt: sample2.createdAt.toISOString(),
            lastUpdatedAt: sample2.lastUpdatedAt.toISOString(),
            sampledAt: sample2.sampledAt.toISOString(),
          },
          {
            ...fp.omit(sample12, ['items']),
            createdAt: sample12.createdAt.toISOString(),
            lastUpdatedAt: sample12.lastUpdatedAt.toISOString(),
            sampledAt: sample12.sampledAt.toISOString(),
          },
          {
            ...fp.omit(sample11, ['items']),
            createdAt: sample11.createdAt.toISOString(),
            lastUpdatedAt: sample11.lastUpdatedAt.toISOString(),
            sampledAt: sample11.sampledAt.toISOString(),
          },
        ])
      );
    });
  });

  describe('GET /samples/count', () => {
    const testRoute = (params: Record<string, string>) =>
      `/api/samples/count?${new URLSearchParams(params).toString()}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute({}))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should count the samples with query parameters restricted to the user region', async () => {
      const res = await request(app)
        .get(testRoute({ status: 'DraftMatrix' }))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({ count: 1 });
    });

    it('should count national samples with a list of statuses', async () => {
      const res = await request(app)
        .get(testRoute({ status: 'DraftMatrix,Draft' }))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({ count: 3 });
    });
  });

  describe('POST /samples', () => {
    const testRoute = '/api/samples';

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .send(genSampleToCreate())
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .post(testRoute)
          .send(payload)
          .use(tokenProvider(Sampler1Fixture))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest({ ...genSampleToCreate(), resytalId: 123 });
      await badRequestTest({ ...genSampleToCreate(), geolocation: undefined });
      await badRequestTest({ ...genSampleToCreate(), geolocation: '123' });
      await badRequestTest({
        ...genSampleToCreate(),
        geolocation: {
          latitude: undefined,
        },
      });
      await badRequestTest({
        ...genSampleToCreate(),
        sampledAt: undefined,
      });
      await badRequestTest({
        ...genSampleToCreate(),
        programmingPlanId: '123',
      });
      await badRequestTest({ ...genSampleToCreate(), legalContext: undefined });
      await badRequestTest({ ...genSampleToCreate(), legalContext: '123' });
      await badRequestTest({ ...genSampleToCreate(), department: undefined });
      await badRequestTest({ ...genSampleToCreate(), department: '123' });
      await badRequestTest({ ...genSampleToCreate(), department: '' });
      await badRequestTest({ ...genSampleToCreate(), department: 123 });
      await badRequestTest({
        ...genSampleToCreate(),
        sampledAt: 'invalid date',
      });
      await badRequestTest({ ...genSampleToCreate(), sampledAt: null });
    });

    it('should fail if the user does not have the permission to create samples', async () => {
      await request(app)
        .post(testRoute)
        .send(genSampleToCreate())
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should create a sample', async () => {
      const sample = genSampleToCreate(ProgrammingPlanFixture.id);

      const res = await request(app)
        .post(testRoute)
        .send(sample)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject(
        expect.objectContaining({
          ...sample,
          id: expect.any(String),
          createdAt: expect.any(String),
          sampler: {
            id: Sampler1Fixture.id,
            firstName: Sampler1Fixture.firstName,
            lastName: Sampler1Fixture.lastName,
          },
          sampledAt: sample.sampledAt.toISOString(),
          reference: `${Regions[Sampler1Fixture.region].shortName}-${
            sample.department
          }-${format(new Date(), 'yy')}-0001-${sample.legalContext}`,
          status: 'DraftMatrix',
        })
      );

      await expect(
        Samples().where({ id: res.body.id }).first()
      ).resolves.toBeDefined();
    });
  });

  describe('PUT /samples/{sampleId}', () => {
    const testRoute = (sampleId: string) => `/api/samples/${sampleId}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(`${testRoute(sample11.id)}`)
        .send({})
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid sample id', async () => {
      await request(app)
        .put(`${testRoute(randomstring.generate())}`)
        .send({})
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the sample does not exist', async () => {
      await request(app)
        .put(`${testRoute(uuidv4())}`)
        .send(genCreatedSample(Sampler1Fixture))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the sample does not belong to the user', async () => {
      await request(app)
        .put(`${testRoute(sample11.id)}`)
        .send(sample11)
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .put(`${testRoute(sample11.id)}`)
          .send(payload)
          .use(tokenProvider(Sampler1Fixture))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest({ matrix: 123 });
    });

    const validBody = {
      ...sample11,
      matrix: oneOf(MatrixList),
    };

    it('should fail if the user does not have the permission to update samples', async () => {
      await request(app)
        .put(`${testRoute(sample11.id)}`)
        .send(validBody)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should update the sample', async () => {
      const res = await request(app)
        .put(`${testRoute(sample11.id)}`)
        .send(validBody)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...sample11,
        createdAt: sample11.createdAt.toISOString(),
        lastUpdatedAt: expect.any(String),
        sampledAt: sample11.sampledAt.toISOString(),
        matrix: validBody.matrix,
      });

      await expect(
        Samples().where({ id: sample11.id, matrix: validBody.matrix }).first()
      ).resolves.toBeDefined();
    });
  });

  describe('PUT /samples/{sampleId}/items', () => {
    const testRoute = (sampleId: string) => `/api/samples/${sampleId}/items`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute(sample11.id))
        .send([genSampleItem(sample11.id)])
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid sample id', async () => {
      await request(app)
        .put(testRoute(randomstring.generate()))
        .send([genSampleItem(sample11.id)])
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the sample does not exist', async () => {
      await request(app)
        .put(testRoute(uuidv4()))
        .send([genSampleItem(sample11.id)])
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the sample does not belong to the user', async () => {
      await request(app)
        .put(testRoute(sample11.id))
        .send([genSampleItem(sample11.id)])
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the user does not have the permission to update samples', async () => {
      await request(app)
        .put(testRoute(sample11.id))
        .send([genSampleItem(sample11.id)])
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should get a valid body', async () => {
      const badRequestTest = async (payload?: any[]) =>
        request(app)
          .put(testRoute(sample11.id))
          .send(payload)
          .use(tokenProvider(Sampler1Fixture))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest([
        {
          ...genSampleItem(sample11.id),
          quantity: '123',
        },
      ]);
      await badRequestTest([
        {
          ...genSampleItem(sample11.id),
          quantityUnit: 123,
        },
      ]);
    });

    it('should be forbidden to update a sample that is already sent', async () => {
      const sample = genPartialSample(
        Sampler1Fixture,
        ProgrammingPlanFixture.id,
        CompanyFixture
      );
      await Samples().insert(
        formatPartialSample({
          ...sample,
          status: 'Sent',
          sentAt: new Date(),
        })
      );

      await request(app)
        .put(testRoute(sample.id))
        .send([genSampleItem(sample.id)])
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should update the sample items', async () => {
      const sampleItems = [
        genSampleItem(sample11.id, 1),
        genSampleItem(sample11.id, 2),
      ];

      await request(app)
        .put(testRoute(sample11.id))
        .send(sampleItems)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      await expect(
        SampleItems().where({ sampleId: sample11.id })
      ).resolves.toMatchObject(sampleItems);
    });
  });

  describe('DELETE /samples/{sampleId}', () => {
    const testRoute = (sampleId: string) => `/api/samples/${sampleId}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .delete(testRoute(sample11.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid sample id', async () => {
      await request(app)
        .delete(testRoute(randomstring.generate()))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the sample does not exist', async () => {
      await request(app)
        .delete(testRoute(uuidv4()))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the sample does not belong to the user', async () => {
      await request(app)
        .delete(testRoute(sample11.id))
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the user does not have the permission to delete samples', async () => {
      await request(app)
        .delete(testRoute(sample11.id))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should be forbidden to delete a sample that is not in draft status', async () => {
      await request(app)
        .delete(testRoute(sample13.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should delete the sample', async () => {
      await request(app)
        .delete(testRoute(sample11.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      await expect(
        Samples().where({ id: sample11.id }).first()
      ).resolves.toBeUndefined();
    });
  });
});
