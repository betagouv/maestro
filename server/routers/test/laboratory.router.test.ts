import { constants } from 'http2';
import randomstring from 'randomstring';
import request from 'supertest';
import { genLaboratory, genUser } from '../../../shared/test/testFixtures';
import { Laboratories } from '../../repositories/laboratoryRepository';
import { Users } from '../../repositories/userRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Laboratory router', () => {
  const { app } = createServer();

  const nationalCoordinator = genUser('NationalCoordinator');
  const laboratory = genLaboratory();

  beforeAll(async () => {
    await Users().insert([nationalCoordinator]);
    await Laboratories().insert(laboratory);
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
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should find the laboratory', async () => {
      const res = await request(app)
        .get(testRoute(laboratory.id))
        .use(tokenProvider(nationalCoordinator))
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
        .use(tokenProvider(nationalCoordinator))
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
