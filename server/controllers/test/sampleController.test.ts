import { constants } from 'http2';
import request from 'supertest';
import { User1 } from '../../../database/seeds/test/001-users';
import { Samples } from '../../repositories/sampleRepository';
import { createServer } from '../../server';
import { genSampleToCreate } from '../../test/testFixtures';
import { withAccessToken } from '../../test/testUtils';

const { app } = createServer();

describe('Sample controller', () => {
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
});
