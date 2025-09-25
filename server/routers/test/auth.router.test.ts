import { constants } from 'http2';
import { genUser, Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import request from 'supertest';
import { Users } from '../../repositories/userRepository';
import { createServer } from '../../server';

import { fakerFR } from '@faker-js/faker';
import jwt from 'jsonwebtoken';
import { COOKIE_MAESTRO_ACCESS_TOKEN } from 'maestro-shared/constants';
import { genAuthRedirectUrl } from 'maestro-shared/test/authFixtures';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { kysely } from '../../repositories/kysely';
import {
  mockAuthenticate,
  mockGetAuthorizationUrl,
  mockGetLogoutUrl
} from '../../test/setupTests';
import { tokenProvider } from '../../test/testUtils';
import config from '../../utils/config';

describe('Auth routes', () => {
  const { app } = createServer();

  const user = genUser();

  beforeAll(async () => {
    await Users().insert(user);
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
    test('should return a redirect url when the accessToken is expired', async () => {
      const mockedAuthRedirectUrl = genAuthRedirectUrl();
      mockGetAuthorizationUrl.mockReturnValueOnce(mockedAuthRedirectUrl);
      const res = await request(app)
        .get(testRoute)
        .use((request) => {
          request.set(
            'Cookie',
            `${COOKIE_MAESTRO_ACCESS_TOKEN}=${jwt.sign(
              {
                userId: user.id,
                idToken: 'idToken'
              },
              config.auth.secret,
              { expiresIn: -10 }
            )}`
          );
        })
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
        url: fakerFR.string.alphanumeric(32)
      });
    });

    test('should set just an accessToken when the user does not exist', async () => {
      const email = fakerFR.string.alphanumeric(32);
      const mockedAuthenticate = Promise.resolve({
        idToken: fakerFR.string.alphanumeric(32),
        email
      });
      mockAuthenticate.mockResolvedValueOnce(mockedAuthenticate);
      const res = await request(app)
        .post(testRoute)
        .send(validBody)
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        user: null,
        userEmail: email
      });
    });

    test('should authenticate a user', async () => {
      const newName = 'newName';
      const mockedAuthenticate = Promise.resolve({
        idToken: fakerFR.string.alphanumeric(32),
        email: Sampler1Fixture.email,
        name: newName
      });
      mockAuthenticate.mockResolvedValueOnce(mockedAuthenticate);
      const res = await request(app)
        .post(testRoute)
        .send(validBody)
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        user: Sampler1Fixture
      });

      const userInDb = await kysely
        .selectFrom('users')
        .selectAll()
        .where('email', '=', Sampler1Fixture.email)
        .executeTakeFirst();
      expect(userInDb).toMatchObject({
        name: newName
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
