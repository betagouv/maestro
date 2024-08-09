import { constants } from 'http2';
import fp from 'lodash';
import randomstring from 'randomstring';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import {
  NationalCoordinator,
  RegionalCoordinator,
  Sampler1Fixture,
  Sampler2Fixture,
} from '../../../database/seeds/test/001-users';
import db from '../../repositories/db';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('User router', () => {
  const { app } = createServer();

  beforeAll(async () => {
    await db.seed.run();
  });

  describe('GET /{userId}/infos', () => {
    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(`/api/users/${Sampler1Fixture.id}/infos`)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid user id', async () => {
      await request(app)
        .get(`/api/users/${randomstring.generate()}/infos`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the user does not exist', async () => {
      await request(app)
        .get(`/api/users/${uuidv4()}/infos`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the user requested is not the user authenticated', async () => {
      await request(app)
        .get(`/api/users/${Sampler1Fixture.id}/infos`)
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should return user infos', async () => {
      const res = await request(app)
        .get(`/api/users/${Sampler1Fixture.id}/infos`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual({
        id: Sampler1Fixture.id,
        email: Sampler1Fixture.email,
        firstName: Sampler1Fixture.firstName,
        lastName: Sampler1Fixture.lastName,
        roles: Sampler1Fixture.roles,
        region: Sampler1Fixture.region,
      });
    });
  });

  describe('GET /', () => {
    const testRoute = (params: Record<string, string>) =>
      `/api/users?${new URLSearchParams(params).toString()}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute({}))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should filter users by region', async () => {
      const res = await request(app)
        .get(testRoute({ region: Sampler1Fixture.region }))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual([
        fp.omit(Sampler1Fixture, 'password'),
        fp.omit(RegionalCoordinator, 'password'),
      ]);
    });

    it('should filter users by role', async () => {
      const res = await request(app)
        .get(testRoute({ role: 'Sampler' }))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual([
        fp.omit(Sampler1Fixture, 'password'),
        fp.omit(Sampler2Fixture, 'password'),
      ]);
    });
  });
});
