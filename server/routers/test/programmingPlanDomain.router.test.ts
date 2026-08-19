import { constants } from 'node:http2';
import {
  AdminFixture,
  NationalCoordinator,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import request from 'supertest';
import { afterAll, describe, expect, test } from 'vitest';
import { kysely } from '../../repositories/kysely';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Programming plan domain router', () => {
  const { app } = createServer();

  const testRoute = '/api/programming-plan-domains';

  describe('GET /programming-plan-domains', () => {
    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get the domains sorted by label', async () => {
      const res = await request(app)
        .get(testRoute)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchInlineSnapshot(`
        [
          {
            "id": "be1fb96c-e498-4e7a-bd2b-cd3d808f997f",
            "label": "Contaminants chimiques",
          },
          {
            "id": "09a95048-64fe-46a1-8543-50146c6ab337",
            "label": "Résidus de pesticides",
          },
        ]
      `);
    });
  });

  describe('POST /programming-plan-domains', () => {
    const testLabel = 'Domaine de test';

    afterAll(async () => {
      await kysely
        .deleteFrom('programmingPlanDomains')
        .where('label', '=', testLabel)
        .execute();
    });

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .send({ label: testLabel })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have the permission', async () => {
      await request(app)
        .post(testRoute)
        .send({ label: testLabel })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the label is empty', async () => {
      await request(app)
        .post(testRoute)
        .send({ label: ' ' })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should create the domain', async () => {
      const res = await request(app)
        .post(testRoute)
        .send({ label: testLabel })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        label: testLabel
      });

      const domains = await request(app)
        .get(testRoute)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(domains.body).toContainEqual(res.body);
    });
  });
});
