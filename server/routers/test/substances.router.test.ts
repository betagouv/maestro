import { constants } from 'http2';
import { genSubstance } from 'maestro-shared/test/substanceFixtures';
import { NationalCoordinator } from 'maestro-shared/test/userFixtures';
import request from 'supertest';
import { beforeAll, describe, expect, test } from 'vitest';
import { Substances } from '../../repositories/substanceRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Substances router', () => {
  const { app } = createServer();

  const substance1 = genSubstance({
    label: 'Ma substance 1'
  });

  const substance2 = genSubstance({
    label: 'Ma substance 2'
  });

  beforeAll(async () => {
    await Substances().insert([substance1, substance2]);
  });

  describe('GET /search', () => {
    const testRoute = (query?: string) =>
      `/api/substances/search?${query ? `q=${query}` : ''}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute('Ma substance'))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a query', async () => {
      await request(app)
        .get(testRoute())
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should return a list of substances matching the query', async () => {
      const res1 = await request(app)
        .get(testRoute('ma substance'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res1.body).toEqual([substance1, substance2]);

      const res2 = await request(app)
        .get(testRoute('ance 1'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res2.body).toEqual([substance1]);
    });
  });
});
