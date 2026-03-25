import { constants } from 'node:http2';
import request from 'supertest';
import { describe, test } from 'vitest';
import { createServer } from '../../server';

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
