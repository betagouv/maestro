import { constants } from 'http2';
import request from 'supertest';
import { createServer } from '../../server';

import { describe, test } from 'vitest';
describe('Company Router', () => {
  const { app } = createServer();

  describe('GET /companies/search', () => {
    const testRoute = (params: Record<string, string>) =>
      `/api/companies/search?${new URLSearchParams(params).toString()}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute({}))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });
  });
});
