import { constants } from 'http2';
import randomstring from 'randomstring';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { User1, User2 } from '../../../database/seeds/test/001-users';
import { MatrixList } from '../../../shared/foodex2/Matrix';
import { formatPartialSample, Samples } from '../../repositories/sampleRepository';
import { createServer } from '../../server';
import { genCreatedSample, genSample, genSampleToCreate, oneOf } from '../../../shared/test/testFixtures';
import { withAccessToken } from '../../test/testUtils';


describe('Sample routes', () => {
  const { app } = createServer();

  const sample1 = genSample(User1.id);
  const sample2 = genSample(User2.id);

  beforeAll(async () => {
    await Samples().insert(formatPartialSample(sample1));
    await Samples().insert(formatPartialSample(sample2));
  });

  describe('GET /samples/{sampleId}', () => {
    const testRoute = (sampleId: string) => `/api/samples/${sampleId}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(sample1.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid sample id', async () => {
      await withAccessToken(
        request(app).get(`${testRoute(randomstring.generate())}`)
      ).expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the sample does not exist', async () => {
      await withAccessToken(
        request(app).get(`${testRoute(uuidv4())}`),
        User1
      ).expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the sample does not belong to the user', async () => {
      await withAccessToken(
        request(app).get(`${testRoute(sample1.id)}`),
        User2
      ).expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should get the sample', async () => {
      const res = await withAccessToken(
        request(app).get(testRoute(sample1.id)),
      ).expect(constants.HTTP_STATUS_OK);

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

    it('should find the samples of the authenticated user', async () => {
      const res = await withAccessToken(request(app).get(testRoute)).expect(
        constants.HTTP_STATUS_OK
      );

      expect(res.body).toMatchObject([
        {
          ...sample1,
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
        withAccessToken(request(app).post(testRoute).send(payload)).expect(
          constants.HTTP_STATUS_BAD_REQUEST
        );

      await badRequestTest();
      await badRequestTest({ ...genSampleToCreate(), resytalId: undefined });
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

    it('should create a sample', async () => {
      const sample = genSampleToCreate();

      console.log('sample', sample);
      const res = await withAccessToken(
        request(app).post(testRoute).send(sample)
      ).expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject(
        expect.objectContaining({
          ...sample,
          id: expect.any(String),
          createdAt: expect.any(String),
          createdBy: User1.id,
          sampledAt: sample.sampledAt.toISOString(),
          reference: expect.stringMatching(/^GES-[0-9]{2}-2024-1$/),
          status: 'Draft',
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
      await withAccessToken(
        request(app)
          .put(`${testRoute(randomstring.generate())}`)
          .send({})
      ).expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the sample does not exist', async () => {
      await withAccessToken(
        request(app)
          .put(`${testRoute(uuidv4())}`)
          .send(genCreatedSample(User1.id)),
        User1
      ).expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the sample does not belong to the user', async () => {
      await withAccessToken(
        request(app)
          .put(`${testRoute(sample1.id)}`)
          .send(sample1),
        User2
      ).expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        withAccessToken(
          request(app)
            .put(`${testRoute(sample1.id)}`)
            .send(payload),
          User1
        ).expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest({ matrix: 123 });
    });

    const validBody = {
      ...sample1,
      matrix: oneOf(MatrixList),
    };

    it('should update the sample', async () => {
      const res = await withAccessToken(
        request(app)
          .put(`${testRoute(sample1.id)}`)
          .send(validBody),
        User1
      ).expect(constants.HTTP_STATUS_OK);

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

    it('should be forbidden to update a sample that is already sent', async () => {
      const sample = genSample(User1.id);
      await Samples().insert(
        formatPartialSample({
          ...sample,
          status: 'Sent',
          sentAt: new Date(),
        })
      );

      await withAccessToken(
        request(app)
          .put(`${testRoute(sample.id)}`)
          .send(sample),
        User1
      ).expect(constants.HTTP_STATUS_FORBIDDEN);
    });
  });
});
