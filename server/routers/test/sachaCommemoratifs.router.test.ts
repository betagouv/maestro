import { constants } from 'http2';
import { UserRefined } from 'maestro-shared/schema/User/User';
import {
  AdminFixture,
  NationalCoordinator,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import request from 'supertest';
import { describe, expect, test } from 'vitest';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Sacha Commemoratifs router', () => {
  const { app } = createServer();

  const testRoute = '/api/sacha/commemoratifs';

  describe('GET /sacha/commemoratifs', () => {
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

    test('should get commemoratifs', async () => {
      const res = await request(app)
        .get(testRoute)
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toStrictEqual({});
    });
  });

  describe('POST /sacha/commemoratifs', () => {
    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .send({ xmlContent: '<xml></xml>' })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .post(testRoute)
          .send(payload)
          .use(tokenProvider(AdminFixture))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest({});
      await badRequestTest({ xmlContent: 123 });
    });

    test('should fail if the user does not have the permission', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .post(testRoute)
          .send({ xmlContent: '<xml></xml>' })
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(NationalCoordinator);
    });

    test('should create commemoratifs from XML and retrieve them', async () => {
      const xmlContent = `
        <DonneesStandardisees>
          <MessageParametres>
            <NomFichier>DS01DGALDGAL251224111923306</NomFichier>
          </MessageParametres>
          <ReferenceCommemoratifType>
            <ReferenceCommemoratif>
              <Cle>CLE_TEST</Cle>
              <Sigle>SIGLE_TEST</Sigle>
              <Libelle>Libellé Test</Libelle>
              <Statut>V</Statut>
              <TypeDonnee>A</TypeDonnee>
              <Unite>kg</Unite>
            </ReferenceCommemoratif>
            <ReferenceCommemoratifsValeurs>
              <Cle>CLE_VAL_1</Cle>
              <Sigle>SIGLE_VAL_1</Sigle>
              <Libelle>Valeur 1</Libelle>
              <Statut>V</Statut>
            </ReferenceCommemoratifsValeurs>
          </ReferenceCommemoratifType>
        </DonneesStandardisees>
      `;

      await request(app)
        .post(testRoute)
        .send({ xmlContent })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      const res = await request(app)
        .get(testRoute)
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchInlineSnapshot(`
        {
          "SIGLE_TEST": {
            "libelle": "Libellé Test",
            "sigle": "SIGLE_TEST",
            "typeDonnee": "text",
            "unite": "kg",
            "values": {
              "SIGLE_VAL_1": {
                "libelle": "Valeur 1",
                "sigle": "SIGLE_VAL_1",
              },
            },
          },
        }
      `);
    });
  });
});
