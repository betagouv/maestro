import { constants } from 'node:http2';
import type { UserRefined } from 'maestro-shared/schema/User/User';
import {
  AdminFixture,
  LaboratoryOfficeUserFixture,
  LaboratoryUserFixture,
  NationalCoordinator,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import request from 'supertest';
import { describe, expect, test } from 'vitest';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

const ds01XmlContent = `
        <DonneesStandardisees schemavalidation="DonneesStandardisees.xsd">
          <MessageParametres>
            <CodeScenario>E.D.I. SIGAL/LABOS</CodeScenario>
            <VersionScenario>1.0.1</VersionScenario>
            <TypeFichier>DS01</TypeFichier>
            <NomFichier>DS01DGALDGAL251224111923306</NomFichier>
            <NomLogicielCreation>SIGAL</NomLogicielCreation>
            <VersionLogicielCreation>4.0</VersionLogicielCreation>
          </MessageParametres>
          <ReferenceCommemoratifType>
            <ReferenceCommemoratif>
              <Cle>CLE_TEST</Cle>
              <Sigle>SIGLE_TEST</Sigle>
              <Libelle>Libellé Test</Libelle>
              <Statut>V</Statut>
              <Unite>kg</Unite>
              <TypeDonnee>A</TypeDonnee>
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

describe('Sacha router', () => {
  const { app } = createServer();

  const testRoute = '/api/sacha/commemoratifs';
  const referentialsRoute = '/api/sacha/referentials';
  const contextsRoute = '/api/sacha/contexts';

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
      await forbiddenRequestTest(LaboratoryUserFixture);
      await forbiddenRequestTest(LaboratoryOfficeUserFixture);
    });

    test('should get commemoratifs', async () => {
      const res = await request(app)
        .get(testRoute)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toStrictEqual({});
    });
  });

  describe('POST /sacha/referentials', () => {
    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(referentialsRoute)
        .send({ xmlContent: '<xml></xml>' })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .post(referentialsRoute)
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
          .post(referentialsRoute)
          .send({ xmlContent: '<xml></xml>' })
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(NationalCoordinator);
      await forbiddenRequestTest(LaboratoryUserFixture);
      await forbiddenRequestTest(LaboratoryOfficeUserFixture);
    });

    test('should refuse a file not compliant with the XSD', async () => {
      const res = await request(app)
        .post(referentialsRoute)
        .send({ xmlContent: '<Resultats></Resultats>' })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      expect(res.body.message).toMatch(/^Fichier non conforme à la XSD Sacha/);
    });

    test('should create commemoratifs from XML and retrieve them', async () => {
      const importRes = await request(app)
        .post(referentialsRoute)
        .send({ xmlContent: ds01XmlContent })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(importRes.body).toEqual({
        kind: 'DS01',
        fileName: 'DS01DGALDGAL251224111923306'
      });

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

  describe('GET /sacha/contexts', () => {
    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(contextsRoute)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have the permission', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .get(contextsRoute)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(LaboratoryUserFixture);
    });

    test('should get the usable contexts imported from a RP01', async () => {
      await request(app)
        .post(referentialsRoute)
        .send({ xmlContent: ds01XmlContent })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      const xmlContent = `
        <ReferentielPrescripteur schemavalidation="ReferentielPrescripteur.xsd">
          <MessageParametres>
            <CodeScenario>E.D.I. SIGAL/LABOS</CodeScenario>
            <VersionScenario>1.0.1</VersionScenario>
            <TypeFichier>RP01</TypeFichier>
            <NomFichier>RP01DGALDGAL260803195529876</NomFichier>
            <NomLogicielCreation>SIGAL</NomLogicielCreation>
            <VersionLogicielCreation>4.0</VersionLogicielCreation>
          </MessageParametres>
          <Emetteur>
            <Sigle>DGAL</Sigle>
            <LibellePartenaire>DGAL</LibellePartenaire>
            <EmailPartenaire>sigal.dgal@agriculture.gouv.fr</EmailPartenaire>
          </Emetteur>
          <ReferenceContextesType>
            <ReferenceContextesIntervention>
              <Cle>100000001494</Cle>
              <Sigle>PR17_2026_RPDA_PBOV</Sigle>
              <Libelle>Plan de surveillance résidus de pesticides bovin</Libelle>
              <Statut>V</Statut>
              <DateModification>2026-08-03T19:55:29</DateModification>
            </ReferenceContextesIntervention>
            <ReferenceCommemoratifsInterventionContexte>
              <SigleCommemoratif>SIGLE_TEST</SigleCommemoratif>
            </ReferenceCommemoratifsInterventionContexte>
          </ReferenceContextesType>
          <ReferenceContextesType>
            <ReferenceContextesIntervention>
              <Cle>100000000001</Cle>
              <Sigle>PR17_2019_PREC_PBOV</Sigle>
              <Libelle>Plan 2019</Libelle>
              <Statut>G</Statut>
              <DateModification>2026-08-03T19:55:29</DateModification>
            </ReferenceContextesIntervention>
          </ReferenceContextesType>
        </ReferentielPrescripteur>
      `;

      const importRes = await request(app)
        .post(referentialsRoute)
        .send({ xmlContent })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(importRes.body).toEqual({
        kind: 'RP01',
        fileName: 'RP01DGALDGAL260803195529876'
      });

      const res = await request(app)
        .get(contextsRoute)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual([
        {
          sigle: 'PR17_2026_RPDA_PBOV',
          libelle: 'Plan de surveillance résidus de pesticides bovin',
          commemoratifs: [{ sigle: 'SIGLE_TEST', level: 'Sample' }]
        }
      ]);
    });
  });
});
