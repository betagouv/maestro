import { constants } from 'http2';
import { describe, test, expect } from 'vitest';
import randomstring from 'randomstring';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import {
  NationalCoordinator,
  RegionalCoordinator,
  Sampler1Fixture,
  Sampler2Fixture,
  SamplerDromFixture
} from '../../test/seed/001-users';
import { Region } from '../../../shared/referential/Region';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';
import { User } from '../../../shared/schema/User/User';
import { Selectable } from 'kysely';
import { DB } from '../../repositories/kysely.type';

// Vérifie que le type généré par kysely correspond bien à notre type
// À l'avenir mieux vaut utiliser vitest pour tester les types => https://vitest.dev/guide/testing-types.html
const userShareToKysely = (v: User) : Selectable<DB['users']> => v
const userKyselyToShare = (v:  Selectable<DB['users']>) :User => v
console.log(userShareToKysely)
console.log(userKyselyToShare)

describe('User router', () => {
  const { app } = createServer();

  describe('GET /{userId}/infos', () => {
    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(`/api/users/${Sampler1Fixture.id}/infos`)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid user id', async () => {
      await request(app)
        .get(`/api/users/${randomstring.generate()}/infos`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the user does not exist', async () => {
      await request(app)
        .get(`/api/users/${uuidv4()}/infos`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should fail if the user requested has no common region with the authenticated user', async () => {
      await request(app)
        .get(`/api/users/${Sampler1Fixture.id}/infos`)
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should return user infos', async () => {
      const res = await request(app)
        .get(`/api/users/${Sampler1Fixture.id}/infos`)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual({
        id: Sampler1Fixture.id,
        email: Sampler1Fixture.email,
        firstName: Sampler1Fixture.firstName,
        lastName: Sampler1Fixture.lastName,
        roles: Sampler1Fixture.roles,
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

      expect(res.body).toEqual([
        Sampler1Fixture,
        RegionalCoordinator,
      ]);
    });

    test('should filter users by role', async () => {
      const res = await request(app)
        .get(testRoute({ role: 'Sampler' }))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual([
        Sampler1Fixture,
        Sampler2Fixture,
        SamplerDromFixture,
      ]);
    });
  });
});
