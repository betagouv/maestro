import { constants } from 'http2';
import randomstring from 'randomstring';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { User1, User2 } from '../../../database/seeds/test/001-users';
import { Sample1 } from '../../../database/seeds/test/002-samples';
import { MatrixList } from '../../../shared/foodex2/Matrix';
import { Samples } from '../../repositories/sampleRepository';
import { createServer } from '../../server';
import { genSampleToCreate, oneOf } from '../../test/testFixtures';
import { withAccessToken } from '../../test/testUtils';

const { app } = createServer();

describe('Sample controller', () => {
  describe('Get', () => {
    const testRoute = '/api/samples';

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(`${testRoute}/${Sample1.id}`)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid sample id', async () => {
      await withAccessToken(
        request(app).get(`${testRoute}/${randomstring.generate()}`)
      ).expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the sample does not exist', async () => {
      await withAccessToken(
        request(app).get(`${testRoute}/${uuidv4()}`),
        User1
      ).expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the sample does not belong to the user', async () => {
      await withAccessToken(
        request(app).get(`${testRoute}/${Sample1.id}`),
        User2
      ).expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should get the sample', async () => {
      const res = await withAccessToken(
        request(app).get(`${testRoute}/${Sample1.id}`)
      ).expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...Sample1,
        createdAt: Sample1.createdAt.toISOString(),
        expiryDate: Sample1.expiryDate?.toISOString(),
      });
    });
  });

  describe('Find', () => {
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
          ...Sample1,
          createdAt: Sample1.createdAt.toISOString(),
          expiryDate: Sample1.expiryDate?.toISOString(),
        },
      ]);
    });
  });
  describe('Create', () => {
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
      await badRequestTest({ ...genSampleToCreate(), context: undefined });
      await badRequestTest({ ...genSampleToCreate(), context: '123' });
      await badRequestTest({ ...genSampleToCreate(), department: undefined });
      await badRequestTest({ ...genSampleToCreate(), department: '123' });
      await badRequestTest({ ...genSampleToCreate(), department: '' });
      await badRequestTest({ ...genSampleToCreate(), department: 123 });
    });

    it('should create a sample', async () => {
      const sample = genSampleToCreate();
      const res = await withAccessToken(
        request(app).post(testRoute).send(sample)
      ).expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject(
        expect.objectContaining({
          ...sample,
          id: expect.any(String),
          createdAt: expect.any(String),
          createdBy: User1.id,
          reference: expect.stringMatching(/^GES-[0-9]{2}-2024-1$/),
        })
      );

      await expect(
        Samples().where({ id: res.body.id }).first()
      ).resolves.toBeDefined();
    });
  });

  describe('Update', () => {
    const testRoute = (sampleId: string) => `/api/samples/${sampleId}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(`${testRoute(Sample1.id)}`)
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
          .send({}),
        User1
      ).expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the sample does not belong to the user', async () => {
      await withAccessToken(
        request(app)
          .put(`${testRoute(Sample1.id)}`)
          .send({}),
        User2
      ).expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        withAccessToken(
          request(app)
            .put(`${testRoute(Sample1.id)}`)
            .send(payload),
          User1
        ).expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest({ matrix: 123 });
    });

    const validBody = {
      matrix: oneOf(MatrixList),
    };

    it('should update the sample', async () => {
      const res = await withAccessToken(
        request(app)
          .put(`${testRoute(Sample1.id)}`)
          .send(validBody),
        User1
      ).expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...Sample1,
        createdAt: Sample1.createdAt.toISOString(),
        expiryDate: Sample1.expiryDate?.toISOString(),
        matrix: validBody.matrix,
      });

      await expect(
        Samples()
          .where({ id: Sample1.id, matrix: validBody.matrix as string })
          .first()
      ).resolves.toBeDefined();
    });
  });
});
