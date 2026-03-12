import { constants } from 'http2';
import { UserRefined } from 'maestro-shared/schema/User/User';
import {
  AllFieldConfigs,
  SachaFieldConfigs
} from 'maestro-shared/test/specificDataFixtures';
import {
  AdminFixture,
  NationalCoordinator,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import request from 'supertest';
import { describe, expect, test } from 'vitest';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

const sachaFieldKeys = [...new Set(SachaFieldConfigs.map((c) => c.field.key))];

const allOptionValuesByFieldKey = new Map(
  sachaFieldKeys.map((key) => [
    key,
    [
      ...new Map(
        AllFieldConfigs.filter((c) => c.field.key === key)
          .flatMap((c) => c.field.options)
          .map((o) => [o.value, o.value])
      ).values()
    ]
  ])
);

describe('SpecificDataFields router', () => {
  const { app } = createServer();

  const testRoute = '/api/specific-data-fields/sacha';

  describe('GET /specific-data-fields/sacha', () => {
    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have the permission', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .get(testRoute)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(NationalCoordinator);
    });

    test('should return distinct sacha field configs', async () => {
      const res = await request(app)
        .get(testRoute)
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toHaveLength(sachaFieldKeys.length);
      expect(res.body.map((f: { key: string }) => f.key).sort()).toEqual(
        [...sachaFieldKeys].sort()
      );
    });

    test('should include sacha-specific fields in the response', async () => {
      const res = await request(app)
        .get(testRoute)
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      for (const field of res.body) {
        expect(field).toMatchObject({
          inDai: expect.any(Boolean),
          optional: expect.any(Boolean),
          sachaCommemoratifSigle: expect.toSatisfy(
            (v: unknown) => v === null || typeof v === 'string'
          )
        });
      }
    });

    test('should return correct options per field', async () => {
      const res = await request(app)
        .get(testRoute)
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      const byKey = Object.fromEntries(
        res.body.map((f: { key: string }) => [f.key, f])
      );
      for (const key of sachaFieldKeys) {
        const expectedValues = allOptionValuesByFieldKey.get(key) ?? [];
        const field = byKey[key] as { options: { value: string }[] };
        expect(field.options.map((o) => o.value)).toEqual(
          expect.arrayContaining(expectedValues)
        );
        expect(field.options).toHaveLength(expectedValues.length);
      }
    });
  });
});
