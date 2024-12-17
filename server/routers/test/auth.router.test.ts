import bcrypt from 'bcryptjs';
import { constants } from 'http2';
import request from 'supertest';
import { genUser } from '../../../shared/test/userFixtures';
import { Users } from '../../repositories/userRepository';
import { createServer } from '../../server';

import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { genAuthRedirectUrl } from '../../../shared/test/authFixtures';

const mockedAuthRedirectUrl = genAuthRedirectUrl();

vi.mock('../../services/authService', () => ({
  getAuthService: Promise.resolve({
    getAuthorizationUrl: () => mockedAuthRedirectUrl,
    authenticate: () => ({
      idToken: 'idToken',
      email: 'email'
    })
  })
}));

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
    vi.restoreAllMocks();
  });

  describe('GET /auth/redirect-url', () => {
    const testRoute = '/api/auth/redirect-url';

    test('should return a redirect url', async () => {
      const response = await request(app).get(testRoute);

      expect(response.status).toBe(constants.HTTP_STATUS_OK);
      expect(response.body).toEqual(mockedAuthRedirectUrl);
    });
  });

  describe('POST /auth/authenticate', () => {
    const testRoute = '/api/auth/authenticate';

    test('should fail when the user does not exist', async () => {
      const response = await request(app)
        .post(testRoute)
        .send({ authRedirectUrl: mockedAuthRedirectUrl });

      expect(response.status).toBe(constants.HTTP_STATUS_UNAUTHORIZED);
    });
  });
});
