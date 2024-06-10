import { constants } from 'http2';
import request from 'supertest';
import { genUser } from '../../../shared/test/testFixtures';
import { Users } from '../../repositories/userRepository';
import { createServer } from '../../server';

describe('Company Router', () => {
  const { app } = createServer();

  const sampler = genUser('Sampler');

  beforeAll(async () => {
    await Users().insert(sampler);
  });

  describe('GET /companies/search', () => {
    const testRoute = (params: Record<string, string>) =>
      `/api/companies/search?${new URLSearchParams(params).toString()}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute({}))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });
  });
});
