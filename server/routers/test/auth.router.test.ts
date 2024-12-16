import bcrypt from 'bcryptjs';
import { constants } from 'http2';
import request from 'supertest';
import { genUser } from '../../../shared/test/userFixtures';
import { Users } from '../../repositories/userRepository';
import { createServer } from '../../server';

import { afterAll, beforeAll, describe, expect, test } from 'vitest';

describe('Auth routes', () => {
  const { app } = createServer();

  const user = genUser();

  beforeAll(async () => {
    const hash = await bcrypt.hash(user.password, 10);
    await Users().insert({
      ...user,
      password: hash
    });
  });

  afterAll(async () => {
    await Users().delete().where('email', user.email);
  });

  describe('GET /auth/redirect-url', () => {
    const testRoute = '/api/auth/redirect-url';

    test('should return a redirect url', async () => {
      const response = await request(app).get(testRoute);

      expect(response.status).toBe(constants.HTTP_STATUS_OK);
      expect(response.body).toHaveProperty('url');
      expect(response.body).toHaveProperty('state');
      expect(response.body).toHaveProperty('nonce');
    });
  });
});
