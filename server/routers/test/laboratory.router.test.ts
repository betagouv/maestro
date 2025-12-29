import { constants } from 'http2';
import { genLaboratory } from 'maestro-shared/test/laboratoryFixtures';
import request from 'supertest';
import { Laboratories } from '../../repositories/laboratoryRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

import { fakerFR } from '@faker-js/faker';
import {
  DummyLaboratoryIds,
  LDA31Id,
  PPVDummyLaboratoryIds
} from 'maestro-shared/schema/User/User';
import { PPVValidatedProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
import { NationalCoordinator } from 'maestro-shared/test/userFixtures';
import { expectArrayToContainElements } from 'maestro-shared/test/utils';
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
        .get(testRoute(fakerFR.string.alphanumeric(32)))
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
          shortName: laboratory.shortName
        })
      );
    });
  });

  describe('GET /laboratories', () => {
    const testRoute = (programmingPlanId?: string, substanceKind?: string) =>
      `/api/laboratories${programmingPlanId || substanceKind ? '?' : ''}${programmingPlanId ? `programmingPlanId=${programmingPlanId}` : ''}${programmingPlanId && substanceKind ? '&' : ''}${substanceKind ? `substanceKind=${substanceKind}` : ''}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute())
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should find the laboratories', async () => {
      const res = await request(app)
        .get(testRoute())
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expectArrayToContainElements(
        res.body,
        DummyLaboratoryIds.map((laboratoryId) =>
          expect.objectContaining({
            id: laboratoryId
          })
        )
      );
    });

    test('should filter aggregated laboratories by programmingPlanId and substanceKind', async () => {
      const res = await request(app)
        .get(testRoute(PPVValidatedProgrammingPlanFixture.id, 'Any'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expectArrayToContainElements(
        res.body,
        PPVDummyLaboratoryIds.map((laboratoryId) =>
          expect.objectContaining({
            id: laboratoryId
          })
        )
      );

      expect(res.body).not.toMatchObject(
        expect.arrayContaining([
          expect.objectContaining({
            id: LDA31Id
          })
        ])
      );
    });
  });
});
