import { constants } from 'http2';
import randomstring from 'randomstring';
import request from 'supertest';
import { NationalCoordinator } from '../../../database/seeds/test/001-users';
import { genLaboratory } from '../../../shared/test/testFixtures';
import db from '../../repositories/db';
import { Laboratories } from '../../repositories/laboratoryRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Laboratory router', () => {
  const { app } = createServer();

  const laboratory = genLaboratory();

  beforeAll(async () => {
    await db.seed.run();
    await Laboratories().insert(laboratory);
  });

  afterAll(async () => {
    await Laboratories().delete().where('id', laboratory.id);
  });

  describe('GET /laboratories/:id', () => {
    const testRoute = (laboratoryId: string) =>
      `/api/laboratories/${laboratoryId}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(laboratory.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid laboratory id', async () => {
      await request(app)
        .get(testRoute(randomstring.generate()))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should find the laboratory', async () => {
      const res = await request(app)
        .get(testRoute(laboratory.id))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: laboratory.id,
          name: laboratory.name,
        })
      );
    });
  });

  describe('GET /laboratories', () => {
    const testRoute = '/api/laboratories';

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should find the laboratories', async () => {
      const res = await request(app)
        .get(testRoute)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: laboratory.id,
            name: laboratory.name,
          }),
        ])
      );
    });
  });
});
