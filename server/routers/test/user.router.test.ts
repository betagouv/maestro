import { constants } from 'http2';
import { Insertable, Selectable } from 'kysely';
import { Region } from 'maestro-shared/referential/Region';
import { User } from 'maestro-shared/schema/User/User';
import {
  NationalCoordinator,
  RegionalCoordinator,
  Sampler1Fixture,
  Sampler2Fixture,
  SamplerDromFixture
} from 'maestro-shared/test/userFixtures';
import randomstring from 'randomstring';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { describe, expect, test } from 'vitest';
import { DB } from '../../repositories/kysely.type';
import { createServer } from '../../server';
import { accessTokenTest, tokenProvider } from '../../test/testUtils';
import { COOKIE_MAESTRO_ACCESS_TOKEN } from '../../utils/constants';

// Vérifie que le type généré par kysely correspond bien à notre type
// À l'avenir mieux vaut utiliser vitest pour tester les types => https://vitest.dev/guide/testing-types.html
const userShareToKysely = (v: User): Insertable<DB['users']> => v;
const userKyselyToShare = (v: Selectable<DB['users']>): User => v;
console.log(userShareToKysely);
console.log(userKyselyToShare);

describe('User router', () => {
  const { app } = createServer();

  describe('GET /{userId}', () => {
    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(`/api/users/${Sampler1Fixture.id}`)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the loggedSecret is wrong', async () => {

      await request(app)
        .get(`/api/users/${Sampler1Fixture.id}`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      await request(app)
        .get(`/api/users/${Sampler1Fixture.id}`)
        .use( (request) => {
   request.set('Cookie', `${COOKIE_MAESTRO_ACCESS_TOKEN}=${accessTokenTest({
        userId: Sampler1Fixture.id,
        idToken: 'idToken',
        loggedSecret: 'anotherSecret'
    })}`)
  })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);

    });

    test('should get a valid user id', async () => {
      await request(app)
        .get(`/api/users/${randomstring.generate()}`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the user does not exist', async () => {
      await request(app)
        .get(`/api/users/${uuidv4()}`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should fail if the user requested has no common region with the authenticated user', async () => {
      await request(app)
        .get(`/api/users/${Sampler1Fixture.id}`)
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should return user', async () => {
      const res = await request(app)
        .get(`/api/users/${Sampler1Fixture.id}`)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual({
        id: Sampler1Fixture.id,
        email: Sampler1Fixture.email,
        firstName: Sampler1Fixture.firstName,
        lastName: Sampler1Fixture.lastName,
        role: Sampler1Fixture.role,
        region: Sampler1Fixture.region
      });
    });
  });

  describe('GET /', () => {
    const testRoute = (params: Record<string, string>) =>
      `/api/users?${new URLSearchParams(params).toString()}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute({}))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should filter users by region', async () => {
      const res = await request(app)
        .get(testRoute({ region: Sampler1Fixture.region as Region }))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual(expect.arrayContaining([Sampler1Fixture, RegionalCoordinator]));
    });

    test('should filter users by role', async () => {
      const res = await request(app)
        .get(testRoute({ role: 'Sampler' }))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual(expect.arrayContaining([
        Sampler1Fixture,
        Sampler2Fixture,
        SamplerDromFixture
      ]));
    });
  });
});
