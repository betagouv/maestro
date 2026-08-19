import { constants } from 'node:http2';
import { Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import request from 'supertest';
import { describe, expect, test } from 'vitest';
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
});
