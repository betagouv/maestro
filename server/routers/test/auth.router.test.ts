import { constants } from 'http2';
import request from 'supertest';
import { genUser } from '../../../shared/test/userFixtures';
import { Users } from '../../repositories/userRepository';
import { createServer } from '../../server';

import randomstring from 'randomstring';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { genAuthRedirectUrl } from '../../../shared/test/authFixtures';
import { Sampler1Fixture } from '../../test/seed/001-users';
import {
  mockAuthenticate,
  mockGetAuthorizationUrl,
  mockGetLogoutUrl
} from '../../test/setupTests';
import { tokenProvider } from '../../test/testUtils';

describe('Auth routes', () => {
  const { app } = createServer();

  const user = genUser();

  beforeAll(async () => {
    await Users().insert({
      ...user
    });
  });

  afterAll(async () => {
    await Users().delete().where('email', user.email);
  });

  describe('GET /auth/redirect-url', () => {
    const testRoute = '/api/auth/redirect-url';

    test('should return a redirect url', async () => {
      const mockedAuthRedirectUrl = genAuthRedirectUrl();
      mockGetAuthorizationUrl.mockReturnValueOnce(mockedAuthRedirectUrl);
      const res = await request(app)
        .get(testRoute)
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual(mockedAuthRedirectUrl);
    });
  });

  describe('POST /auth', () => {
    const testRoute = '/api/auth';
    const validBody = genAuthRedirectUrl();

    test('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .post(testRoute)
          .send(payload)
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest({
        ...validBody,
        url: undefined
      });
      await badRequestTest({
        ...validBody,
        url: randomstring.generate()
      });
    });

    test('should fail when the user does not exist', async () => {
      const mockedAuthenticate = Promise.resolve({
        idToken: randomstring.generate(),
        email: randomstring.generate()
      });
      mockAuthenticate.mockResolvedValueOnce(mockedAuthenticate);
      await request(app)
        .post(testRoute)
        .send(validBody)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should authenticate a user', async () => {
      const mockedAuthenticate = Promise.resolve({
        idToken: randomstring.generate(),
        email: Sampler1Fixture.email
      });
      mockAuthenticate.mockResolvedValueOnce(mockedAuthenticate);
      const res = await request(app)
        .post(testRoute)
        .send(validBody)
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        userId: Sampler1Fixture.id,
        accessToken: expect.any(String),
        userRoles: Sampler1Fixture.roles
      });
    });
  });

  describe('POST /auth/logout', () => {
    const testRoute = '/api/auth/logout';

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should return a logout url', async () => {
      const mockedLogoutUrl = genAuthRedirectUrl();
      mockGetLogoutUrl.mockReturnValueOnce(mockedLogoutUrl);
      const res = await request(app)
        .post(testRoute)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual(mockedLogoutUrl);
    });
  });
});
