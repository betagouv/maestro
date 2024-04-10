import { constants } from 'http2';
import fp from 'lodash';
import randomstring from 'randomstring';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { MatrixList } from '../../../shared/foodex2/Matrix';
import {
  genCreatedSample,
  genSample,
  genSampleItem,
  genSampleToCreate,
  genUser,
  oneOf,
} from '../../../shared/test/testFixtures';
import { SampleItems } from '../../repositories/sampleItemRepository';
import {
  formatPartialSample,
  Samples,
} from '../../repositories/sampleRepository';
import { Users } from '../../repositories/userRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Sample router', () => {
  const { app } = createServer();

  const sampler1 = genUser('Sampler');
  const sampler2 = genUser('Sampler');
  const nationalCoordinator = genUser('NationalCoordinator');
  const sample1Id = uuidv4();
  const sampleItem1 = genSampleItem(sample1Id, 1);
  const sample1 = {
    ...genSample(sampler1.id),
    id: sample1Id,
    items: [sampleItem1],
  };
  const sample2 = genSample(sampler2.id);

  beforeAll(async () => {
    await Users().insert([sampler1, sampler2, nationalCoordinator]);
    await Samples().insert([
      formatPartialSample(sample1),
      formatPartialSample(sample2),
    ]);
    await SampleItems().insert(sampleItem1);
  });

  describe('GET /samples/{sampleId}', () => {
    const testRoute = (sampleId: string) => `/api/samples/${sampleId}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(sample1.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid sample id', async () => {
      await request(app)
        .get(`${testRoute(randomstring.generate())}`)
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the sample does not exist', async () => {
      await request(app)
        .get(`${testRoute(uuidv4())}`)
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the sample does not belong to the user', async () => {
      await request(app)
        .get(`${testRoute(sample1.id)}`)
        .use(tokenProvider(sampler2))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the user does not have the permission to read samples', async () => {
      await request(app)
        .get(testRoute(sample1.id))
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should get the sample', async () => {
      const res = await request(app)
        .get(testRoute(sample1.id))
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...sample1,
        createdAt: sample1.createdAt.toISOString(),
        sampledAt: sample1.sampledAt.toISOString(),
        expiryDate: sample1.expiryDate?.toISOString(),
      });
    });
  });

  describe('GET /samples', () => {
    const testRoute = '/api/samples';

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should fail if the user does not have the permission to read samples', async () => {
      await request(app)
        .get(testRoute)
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should find the samples of the authenticated user', async () => {
      const res = await request(app)
        .get(testRoute)
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject([
        {
          ...fp.omit(sample1, ['items']),
          createdAt: sample1.createdAt.toISOString(),
          sampledAt: sample1.sampledAt.toISOString(),
          expiryDate: sample1.expiryDate?.toISOString(),
        },
      ]);
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
          .use(tokenProvider(sampler1))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest({ ...genSampleToCreate(), resytalId: '123' });
      await badRequestTest({ ...genSampleToCreate(), resytalId: '' });
      await badRequestTest({ ...genSampleToCreate(), resytalId: 123 });
      await badRequestTest({ ...genSampleToCreate(), userLocation: undefined });
      await badRequestTest({ ...genSampleToCreate(), userLocation: '123' });
      await badRequestTest({
        ...genSampleToCreate(),
        userLocation: {
          latitude: undefined,
        },
      });
      await badRequestTest({
        ...genSampleToCreate(),
        sampledAt: undefined,
      });
      await badRequestTest({
        ...genSampleToCreate(),
        planningContext: undefined,
      });
      await badRequestTest({ ...genSampleToCreate(), planningContext: '123' });
      await badRequestTest({ ...genSampleToCreate(), legalContext: undefined });
      await badRequestTest({ ...genSampleToCreate(), legalContext: '123' });
      await badRequestTest({ ...genSampleToCreate(), department: undefined });
      await badRequestTest({ ...genSampleToCreate(), department: '123' });
      await badRequestTest({ ...genSampleToCreate(), department: '' });
      await badRequestTest({ ...genSampleToCreate(), department: 123 });
    });

    it('should fail if the user does not have the permission to create samples', async () => {
      await request(app)
        .post(testRoute)
        .send(genSampleToCreate())
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should create a sample', async () => {
      const sample = genSampleToCreate();

      console.log('sample', sample);
      const res = await request(app)
        .post(testRoute)
        .send(sample)
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject(
        expect.objectContaining({
          ...sample,
          id: expect.any(String),
          createdAt: expect.any(String),
          createdBy: sampler1.id,
          sampledAt: sample.sampledAt.toISOString(),
          reference: expect.stringMatching(/^GES-[0-9]{2}-2024-1$/),
          status: 'DraftInfos',
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
        .put(`${testRoute(sample1.id)}`)
        .send({})
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid sample id', async () => {
      await request(app)
        .put(`${testRoute(randomstring.generate())}`)
        .send({})
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the sample does not exist', async () => {
      await request(app)
        .put(`${testRoute(uuidv4())}`)
        .send(genCreatedSample(sampler1.id))
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the sample does not belong to the user', async () => {
      await request(app)
        .put(`${testRoute(sample1.id)}`)
        .send(sample1)
        .use(tokenProvider(sampler2))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .put(`${testRoute(sample1.id)}`)
          .send(payload)
          .use(tokenProvider(sampler1))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest({ matrix: 123 });
    });

    const validBody = {
      ...sample1,
      matrix: oneOf(MatrixList),
    };

    it('should fail if the user does not have the permission to update samples', async () => {
      await request(app)
        .put(`${testRoute(sample1.id)}`)
        .send(validBody)
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should be forbidden to update a sample that is already sent', async () => {
      const sample = genSample(sampler1.id);
      await Samples().insert(
        formatPartialSample({
          ...sample,
          status: 'Sent',
          sentAt: new Date(),
        })
      );

      await request(app)
        .put(`${testRoute(sample.id)}`)
        .send(sample)
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should update the sample', async () => {
      const res = await request(app)
        .put(`${testRoute(sample1.id)}`)
        .send(validBody)
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...sample1,
        createdAt: sample1.createdAt.toISOString(),
        sampledAt: sample1.sampledAt.toISOString(),
        expiryDate: sample1.expiryDate?.toISOString(),
        matrix: validBody.matrix,
      });

      await expect(
        Samples()
          .where({ id: sample1.id, matrix: validBody.matrix as string })
          .first()
      ).resolves.toBeDefined();
    });
  });

  describe('PUT /samples/{sampleId}/items', () => {
    const testRoute = (sampleId: string) => `/api/samples/${sampleId}/items`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute(sample1.id))
        .send([genSampleItem(sample1.id)])
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid sample id', async () => {
      await request(app)
        .put(testRoute(randomstring.generate()))
        .send([genSampleItem(sample1.id)])
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the sample does not exist', async () => {
      await request(app)
        .put(testRoute(uuidv4()))
        .send([genSampleItem(sample1.id)])
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the sample does not belong to the user', async () => {
      await request(app)
        .put(testRoute(sample1.id))
        .send([genSampleItem(sample1.id)])
        .use(tokenProvider(sampler2))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the user does not have the permission to update samples', async () => {
      await request(app)
        .put(testRoute(sample1.id))
        .send([genSampleItem(sample1.id)])
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should get a valid body', async () => {
      const badRequestTest = async (payload?: any[]) =>
        request(app)
          .put(testRoute(sample1.id))
          .send(payload)
          .use(tokenProvider(sampler1))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest([
        {
          ...genSampleItem(sample1.id),
          quantity: '123',
        },
      ]);
      await badRequestTest([
        {
          ...genSampleItem(sample1.id),
          quantityUnit: 123,
        },
      ]);
    });

    it('should be forbidden to update a sample that is already sent', async () => {
      const sample = genSample(sampler1.id);
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
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should update the sample items', async () => {
      const sampleItems = [
        genSampleItem(sample1.id, 1),
        genSampleItem(sample1.id, 2),
      ];

      await request(app)
        .put(testRoute(sample1.id))
        .send(sampleItems)
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_OK);

      await expect(
        SampleItems().where({ sampleId: sample1.id })
      ).resolves.toMatchObject(sampleItems);
    });
  });
});
