import { constants } from 'http2';
import randomstring from 'randomstring';
import request from 'supertest';
import { genLaboratory } from '../../../shared/test/laboratoryFixtures';
import { Laboratories } from '../../repositories/laboratoryRepository';
import { createServer } from '../../server';
import { NationalCoordinator } from '../../test/seed/001-users';
import { tokenProvider } from '../../test/testUtils';

import { afterAll, beforeAll, describe, expect, test } from 'vitest';
describe('Laboratory router', () => {
  const { app } = createServer();

  const laboratory = genLaboratory();

  beforeAll(async () => {
    await Laboratories().insert(laboratory);
  });

  afterAll(async () => {
    await Laboratories().delete().where('id', laboratory.id);
  });

  describe('GET /laboratories/:id', () => {
    const testRoute = (laboratoryId: string) =>
      `/api/laboratories/${laboratoryId}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(laboratory.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid laboratory id', async () => {
      await request(app)
        .get(testRoute(randomstring.generate()))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should find the laboratory', async () => {
      const res = await request(app)
        .get(testRoute(laboratory.id))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: laboratory.id,
          name: laboratory.name
        })
      );
    });
  });

  describe('GET /laboratories', () => {
    const testRoute = '/api/laboratories';

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should find the laboratories', async () => {
      const res = await request(app)
        .get(testRoute)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: laboratory.id,
            name: laboratory.name
          })
        ])
      );
    });
  });
});
