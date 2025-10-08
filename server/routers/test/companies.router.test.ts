import { constants } from 'http2';
import request from 'supertest';
import { createServer } from '../../server';

import {
  CompanyFixture,
  SlaughterhouseCompanyFixture1
} from 'maestro-shared/test/companyFixtures';
import { NationalCoordinator } from 'maestro-shared/test/userFixtures';
import { describe, expect, test } from 'vitest';
import { tokenProvider } from '../../test/testUtils';
describe('Company Router', () => {
  const { app } = createServer();

  describe('GET /companies', () => {
    const testRoute = '/api/companies';

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should return companies', async () => {
      const res = await request(app)
        .get(testRoute)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual([CompanyFixture, SlaughterhouseCompanyFixture1]);
    });

    test('should filter companies', async () => {
      const res1 = await request(app)
        .get(testRoute)
        .query({ kind: 'Slaughterhouse' })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res1.body).toEqual([SlaughterhouseCompanyFixture1]);

      const res2 = await request(app)
        .get(testRoute)
        .query({ region: '75' })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res2.body).toEqual([CompanyFixture]);
    });
  });
});
