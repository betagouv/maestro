import { constants } from 'http2';
import request from 'supertest';
import { createServer } from '../../server';

import {
  CompanyFixture,
  SlaughterhouseCompanyFixture1,
  SlaughterhouseCompanyFixture2
} from 'maestro-shared/test/companyFixtures';
import { NationalCoordinator } from 'maestro-shared/test/userFixtures';
import { expectArrayToContainElements } from 'maestro-shared/test/utils';
import { describe, test } from 'vitest';
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

      expectArrayToContainElements(res.body, [
        CompanyFixture,
        SlaughterhouseCompanyFixture1,
        SlaughterhouseCompanyFixture2
      ]);
    });

    test('should filter companies', async () => {
      const res1 = await request(app)
        .get(testRoute)
        .query({ kinds: ['MEAT_SLAUGHTERHOUSE'] })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expectArrayToContainElements(res1.body, [
        SlaughterhouseCompanyFixture1,
        SlaughterhouseCompanyFixture2
      ]);

      const res2 = await request(app)
        .get(testRoute)
        .query({ region: '75' })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expectArrayToContainElements(res2.body, [CompanyFixture]);
    });
  });
});
