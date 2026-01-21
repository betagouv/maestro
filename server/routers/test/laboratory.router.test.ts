import { constants } from 'http2';
import {
  genLaboratory,
  genLaboratoryAnalyticalCompetence,
  Laboratory1AnalyticalCompetenceFixture1,
  Laboratory1AnalyticalCompetenceFixture2,
  LaboratoryFixture
} from 'maestro-shared/test/laboratoryFixtures';
import request from 'supertest';
import { Laboratories } from '../../repositories/laboratoryRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

import { fakerFR } from '@faker-js/faker';
import {
  DummyLaboratoryIds,
  LDA31Id,
  PPVDummyLaboratoryIds,
  UserRefined
} from 'maestro-shared/schema/User/User';
import { PPVValidatedProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
import {
  DepartmentalCoordinator,
  LaboratoryUserFixture,
  NationalCoordinator,
  NationalObserver,
  RegionalCoordinator,
  RegionalObserver,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import { expectArrayToContainElements } from 'maestro-shared/test/utils';
import { describe, expect, test } from 'vitest';
import { LaboratoryAnalyticalCompetences } from '../../repositories/laboratoryAnalyticalCompetenceRepository';
describe('Laboratory router', () => {
  const { app } = createServer();

  describe('GET /laboratories/:id', () => {
    const testRoute = (laboratoryId: string) =>
      `/api/laboratories/${laboratoryId}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(LaboratoryFixture.id))
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
        .get(testRoute(LaboratoryFixture.id))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: LaboratoryFixture.id,
          shortName: LaboratoryFixture.shortName
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
            id: laboratoryId,
            shortName: LaboratoryFixture.shortName
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

      expectArrayToContainElements(res.body, [
        expect.objectContaining({
          id: LaboratoryFixture.id,
          shortName: LaboratoryFixture.shortName
        })
      ]);
    });
  });

  describe('GET /laboratories/:laboratoryId/analytical-competences', () => {
    const testRoute = (laboratoryId: string) =>
      `/api/laboratories/${laboratoryId}/analytical-competences`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(LaboratoryFixture.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have the permission to read laboratory competences', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .get(testRoute(LaboratoryFixture.id))
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(DepartmentalCoordinator);
      await forbiddenRequestTest(RegionalCoordinator);
      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(NationalObserver);
    });

    test('should get a valid laboratory id', async () => {
      await request(app)
        .get(testRoute(fakerFR.string.alphanumeric(32)))
        .use(tokenProvider(LaboratoryUserFixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should find the laboratory analytical competences', async () => {
      const res = await request(app)
        .get(testRoute(LaboratoryFixture.id))
        .use(tokenProvider(LaboratoryUserFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toHaveLength(2);
      expectArrayToContainElements(res.body, [
        expect.objectContaining({
          id: Laboratory1AnalyticalCompetenceFixture1.id,
          laboratoryId: LaboratoryFixture.id,
          residueReference:
            Laboratory1AnalyticalCompetenceFixture1.residueReference
        }),
        expect.objectContaining({
          id: Laboratory1AnalyticalCompetenceFixture2.id,
          laboratoryId: LaboratoryFixture.id,
          residueReference:
            Laboratory1AnalyticalCompetenceFixture2.residueReference
        })
      ]);
    });

    test('should return empty array for laboratory without competences', async () => {
      const otherLaboratory = genLaboratory();
      await Laboratories().insert(otherLaboratory);

      const res = await request(app)
        .get(testRoute(otherLaboratory.id))
        .use(tokenProvider(LaboratoryUserFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual([]);

      await Laboratories().delete().where('id', otherLaboratory.id);
    });
  });

  describe('PUT /laboratories/:laboratoryId/analytical-competences/:analyticalCompetenceId', () => {
    const testRoute = (laboratoryId: string, competenceId: string) =>
      `/api/laboratories/${laboratoryId}/analytical-competences/${competenceId}`;

    const validBody = genLaboratoryAnalyticalCompetence({
      id: Laboratory1AnalyticalCompetenceFixture1.id,
      laboratoryId: LaboratoryFixture.id
    });

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(
          testRoute(
            LaboratoryFixture.id,
            Laboratory1AnalyticalCompetenceFixture1.id
          )
        )
        .send(validBody)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have the permission to update laboratory competences', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .put(
            testRoute(
              LaboratoryFixture.id,
              Laboratory1AnalyticalCompetenceFixture1.id
            )
          )
          .use(tokenProvider(user))
          .send(validBody)
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(DepartmentalCoordinator);
      await forbiddenRequestTest(RegionalCoordinator);
      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(NationalObserver);
    });

    test('should get a valid laboratory id', async () => {
      await request(app)
        .put(
          testRoute(
            fakerFR.string.alphanumeric(32),
            Laboratory1AnalyticalCompetenceFixture1.id
          )
        )
        .use(tokenProvider(LaboratoryUserFixture))
        .send(validBody)
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should get a valide analytical competence id', async () => {
      await request(app)
        .put(testRoute(LaboratoryFixture.id, fakerFR.string.alphanumeric(32)))
        .use(tokenProvider(LaboratoryUserFixture))
        .send(validBody)
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should update a laboratory analytical competence', async () => {
      const res = await request(app)
        .put(
          testRoute(
            LaboratoryFixture.id,
            Laboratory1AnalyticalCompetenceFixture1.id
          )
        )
        .use(tokenProvider(LaboratoryUserFixture))
        .send(validBody)
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...validBody,
        id: Laboratory1AnalyticalCompetenceFixture1.id,
        laboratoryId: LaboratoryFixture.id
      });

      await expect(
        LaboratoryAnalyticalCompetences()
          .where({ id: Laboratory1AnalyticalCompetenceFixture1.id })
          .first()
      ).resolves.toMatchObject({
        ...validBody,
        detectionLimit: validBody.detectionLimit?.toFixed(4),
        quantificationLimit: validBody.quantificationLimit?.toFixed(4),
        id: Laboratory1AnalyticalCompetenceFixture1.id,
        laboratoryId: LaboratoryFixture.id
      });
    });
  });
});
