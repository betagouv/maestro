import { constants } from 'node:http2';
import { fakerFR } from '@faker-js/faker';
import {
  DummyLaboratoryIds,
  LDA31Id,
  PPVDummyLaboratoryIds,
  type UserRefined
} from 'maestro-shared/schema/User/User';
import {
  DAOALaboratoryAgreementFixture,
  LaboratoryAgreementCheckFixture
} from 'maestro-shared/test/laboratoryAgreementFixtures';
import {
  genLaboratoryAnalyticalCompetence,
  Laboratory1AnalyticalCompetenceFixture1,
  LaboratoryFixture
} from 'maestro-shared/test/laboratoryFixtures';
import {
  PPVValidatedProgrammingPlanFixture,
  PPVValidatedSubPlanId
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  AdminFixture,
  DepartmentalCoordinator,
  LaboratoryOfficeUserFixture,
  LaboratoryUserFixture,
  NationalCoordinator,
  NationalObserver,
  RegionalCoordinator,
  RegionalObserver,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import { expectArrayToContainElements } from 'maestro-shared/test/utils';
import request from 'supertest';
import { describe, expect, test } from 'vitest';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

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

    test('should not expose admin fields', async () => {
      const res = await request(app)
        .get(testRoute(LaboratoryFixture.id))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).not.toHaveProperty('emailsAnalysisResult');
      expect(res.body).not.toHaveProperty('legacyDai');
      expect(res.body).not.toHaveProperty('sacha');
    });
  });

  describe('GET /laboratories/:laboratoryId/config', () => {
    const testRoute = (laboratoryId: string) =>
      `/api/laboratories/${laboratoryId}/config`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(LaboratoryFixture.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have administrationMaestro permission', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .get(testRoute(LaboratoryFixture.id))
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(NationalCoordinator);
      await forbiddenRequestTest(RegionalCoordinator);
      await forbiddenRequestTest(LaboratoryUserFixture);
      await forbiddenRequestTest(LaboratoryOfficeUserFixture);
    });

    test('should return the full laboratory config for an admin', async () => {
      const res = await request(app)
        .get(testRoute(LaboratoryFixture.id))
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: LaboratoryFixture.id,
          shortName: LaboratoryFixture.shortName,
          emailsAnalysisResult: expect.any(Array),
          legacyDai: expect.any(Boolean)
        })
      );
      expect(res.body).toHaveProperty('sacha');
    });
  });

  describe('PUT /laboratories/:laboratoryId/config', () => {
    const testRoute = (laboratoryId: string) =>
      `/api/laboratories/${laboratoryId}/config`;

    const baseBody = {
      emails: ['contact@lab.fr'],
      emailsAnalysisResult: ['results@lab.fr']
    };

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute(LaboratoryFixture.id))
        .send({
          ...baseBody,
          legacyDai: false,
          sacha: { activated: false, sigle: null, communication: null }
        })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have administrationMaestro permission', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .put(testRoute(LaboratoryFixture.id))
          .use(tokenProvider(user))
          .send({
            ...baseBody,
            legacyDai: false,
            sacha: { activated: false, sigle: null, communication: null }
          })
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(NationalCoordinator);
      await forbiddenRequestTest(LaboratoryUserFixture);
      await forbiddenRequestTest(LaboratoryOfficeUserFixture);
    });

    test('should accept a valid SACHA EMAIL config', async () => {
      await request(app)
        .put(testRoute(LaboratoryFixture.id))
        .use(tokenProvider(AdminFixture))
        .send({
          ...baseBody,
          legacyDai: false,
          sacha: {
            activated: true,
            sigle: 'LAB1',
            communication: {
              method: 'EMAIL',
              recipientEmail: 'sacha@lab.fr',
              gpgEmail: 'sacha-gpg@lab.fr',
              gpgPublicKey: `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
f2LgSfYvHNZbocMsQoVBhv3yF1i9/Hw=
=mKxP`
            }
          }
        })
        .expect(constants.HTTP_STATUS_OK);
    });

    test('should accept a SACHA EMAIL config without GPG', async () => {
      await request(app)
        .put(testRoute(LaboratoryFixture.id))
        .use(tokenProvider(AdminFixture))
        .send({
          ...baseBody,
          legacyDai: false,
          sacha: {
            activated: true,
            sigle: 'LAB1',
            communication: {
              method: 'EMAIL',
              recipientEmail: 'sacha@lab.fr'
            }
          }
        })
        .expect(constants.HTTP_STATUS_OK);
    });

    test('should accept a valid SACHA SFTP config', async () => {
      await request(app)
        .put(testRoute(LaboratoryFixture.id))
        .use(tokenProvider(AdminFixture))
        .send({
          ...baseBody,
          legacyDai: false,
          sacha: {
            activated: true,
            sigle: 'LAB1',
            communication: { method: 'SFTP', sftpLogin: 'sftp-user' }
          }
        })
        .expect(constants.HTTP_STATUS_OK);
    });

    test('should accept a legacyDai=true config', async () => {
      await request(app)
        .put(testRoute(LaboratoryFixture.id))
        .use(tokenProvider(AdminFixture))
        .send({ ...baseBody, legacyDai: true, sacha: null })
        .expect(constants.HTTP_STATUS_OK);
    });

    test('should reject an incoherent config (legacyDai=true with sacha)', async () => {
      await request(app)
        .put(testRoute(LaboratoryFixture.id))
        .use(tokenProvider(AdminFixture))
        .send({
          ...baseBody,
          legacyDai: true,
          sacha: { activated: true, sigle: null, communication: null }
        })
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should reject an EMAIL communication without email', async () => {
      await request(app)
        .put(testRoute(LaboratoryFixture.id))
        .use(tokenProvider(AdminFixture))
        .send({
          ...baseBody,
          legacyDai: false,
          sacha: {
            activated: true,
            sigle: 'LAB1',
            communication: { method: 'EMAIL', gpgPublicKey: 'PUBKEY' }
          }
        })
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
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

    test('should not expose admin fields in the list', async () => {
      const res = await request(app)
        .get(testRoute())
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      for (const laboratory of res.body) {
        expect(laboratory).not.toHaveProperty('emailsAnalysisResult');
        expect(laboratory).not.toHaveProperty('legacyDai');
        expect(laboratory).not.toHaveProperty('sacha');
      }
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
      await forbiddenRequestTest(LaboratoryUserFixture);
      await forbiddenRequestTest(LaboratoryOfficeUserFixture);
    });

    test('should get a valid laboratory id', async () => {
      await request(app)
        .get(testRoute(fakerFR.string.alphanumeric(32)))
        .use(tokenProvider(LaboratoryUserFixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    // test('should find the laboratory analytical competences', async () => {
    //   const res = await request(app)
    //     .get(testRoute(LaboratoryFixture.id))
    //     .use(tokenProvider(LaboratoryUserFixture))
    //     .expect(constants.HTTP_STATUS_OK);
    //
    //   expect(res.body).toHaveLength(2);
    //   expectArrayToContainElements(res.body, [
    //     expect.objectContaining({
    //       id: Laboratory1AnalyticalCompetenceFixture1.id,
    //       laboratoryId: LaboratoryFixture.id,
    //       residueReference:
    //         Laboratory1AnalyticalCompetenceFixture1.residueReference
    //     }),
    //     expect.objectContaining({
    //       id: Laboratory1AnalyticalCompetenceFixture2.id,
    //       laboratoryId: LaboratoryFixture.id,
    //       residueReference:
    //         Laboratory1AnalyticalCompetenceFixture2.residueReference
    //     })
    //   ]);
    // });
    //
    // test('should return empty array for laboratory without competences', async () => {
    //   const otherLaboratory = genLaboratory();
    //   await Laboratories().insert(otherLaboratory);
    //
    //   const res = await request(app)
    //     .get(testRoute(otherLaboratory.id))
    //     .use(tokenProvider(LaboratoryUserFixture))
    //     .expect(constants.HTTP_STATUS_OK);
    //
    //   expect(res.body).toEqual([]);
    //
    //   await Laboratories().delete().where('id', otherLaboratory.id);
    // });
  });

  describe('GET /laboratories/agreements', () => {
    const testRoute = '/api/laboratories/agreements';

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have the permission to manage laboratory agreements', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .get(testRoute)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(DepartmentalCoordinator);
      await forbiddenRequestTest(RegionalCoordinator);
      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(NationalCoordinator);
      await forbiddenRequestTest(LaboratoryUserFixture);
    });

    test('should return all agreements', async () => {
      const res = await request(app)
        .get(testRoute)
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toBeInstanceOf(Array);
      expectArrayToContainElements(res.body, [
        ...PPVDummyLaboratoryIds.map((laboratoryId) =>
          expect.objectContaining({
            laboratoryId,
            programmingSubPlanId: PPVValidatedSubPlanId,
            substanceKind: 'Any'
          })
        ),
        expect.objectContaining({
          laboratoryId: DAOALaboratoryAgreementFixture.laboratoryId,
          programmingSubPlanId:
            DAOALaboratoryAgreementFixture.programmingSubPlanId,
          substanceKind: DAOALaboratoryAgreementFixture.substanceKind
        })
      ]);
    });

    test('should filter agreements by programmingSubPlanIds and exclude non-matching ones', async () => {
      const res = await request(app)
        .get(testRoute)
        .query({ programmingSubPlanIds: [PPVValidatedSubPlanId] })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toBeInstanceOf(Array);
      res.body.forEach((agreement: { programmingSubPlanId: string }) => {
        expect(agreement.programmingSubPlanId).toBeDefined();
      });
      expect(res.body).not.toMatchObject(
        expect.arrayContaining([
          expect.objectContaining({
            programmingSubPlanId:
              DAOALaboratoryAgreementFixture.programmingSubPlanId
          })
        ])
      );
    });
  });

  describe('GET /laboratories/agreements/checks', () => {
    const testRoute = '/api/laboratories/agreements/checks';

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have the permission to manage laboratory agreements', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .get(testRoute)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(DepartmentalCoordinator);
      await forbiddenRequestTest(RegionalCoordinator);
      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(NationalCoordinator);
      await forbiddenRequestTest(LaboratoryUserFixture);
    });

    test('should return all agreement checks including the seeded one', async () => {
      const res = await request(app)
        .get(testRoute)
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toBeInstanceOf(Array);
      expectArrayToContainElements(res.body, [
        expect.objectContaining(LaboratoryAgreementCheckFixture)
      ]);
    });

    test('should return seeded check when filtering by matching year', async () => {
      const res = await request(app)
        .get(testRoute)
        .query({ year: PPVValidatedProgrammingPlanFixture.year })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toBeInstanceOf(Array);
      expectArrayToContainElements(res.body, [
        expect.objectContaining(LaboratoryAgreementCheckFixture)
      ]);
    });

    test('should return empty array when filtering by non-matching year', async () => {
      const res = await request(app)
        .get(testRoute)
        .query({ year: 1900 })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual([]);
    });
  });

  describe('PUT /laboratories/agreements/checks', () => {
    const testRoute = '/api/laboratories/agreements/checks';

    const validBody = {
      ...LaboratoryAgreementCheckFixture,
      checked: true
    };

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute)
        .send(validBody)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have the permission to manage laboratory agreements', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .put(testRoute)
          .use(tokenProvider(user))
          .send(validBody)
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(DepartmentalCoordinator);
      await forbiddenRequestTest(RegionalCoordinator);
      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(NationalCoordinator);
      await forbiddenRequestTest(LaboratoryUserFixture);
    });

    test('should require a valid body', async () => {
      await request(app)
        .put(testRoute)
        .send({ programmingPlanId: 'not-a-uuid' })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should uncheck the seeded agreement and return the updated list without it', async () => {
      const res = await request(app)
        .put(testRoute)
        .send({ ...LaboratoryAgreementCheckFixture, checked: false })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body).not.toMatchObject(
        expect.arrayContaining([
          expect.objectContaining(LaboratoryAgreementCheckFixture)
        ])
      );
    });

    test('should re-check an agreement and return the updated list with it', async () => {
      const res = await request(app)
        .put(testRoute)
        .send({ ...LaboratoryAgreementCheckFixture, checked: true })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toBeInstanceOf(Array);
      expectArrayToContainElements(res.body, [
        expect.objectContaining(LaboratoryAgreementCheckFixture)
      ]);
    });
  });

  describe('PUT /laboratories/:laboratoryId/agreements', () => {
    const testRoute = (laboratoryId: string) =>
      `/api/laboratories/${laboratoryId}/agreements`;

    const validBody = {
      laboratoryAgreementRowKey: {
        programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
        programmingSubPlanId: PPVValidatedSubPlanId,
        substanceKind: 'Any'
      },
      referenceLaboratory: true,
      detectionAnalysis: true,
      confirmationAnalysis: false
    };

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute(LaboratoryFixture.id))
        .send(validBody)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have the permission to manage laboratory agreements', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .put(testRoute(LaboratoryFixture.id))
          .use(tokenProvider(user))
          .send(validBody)
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(DepartmentalCoordinator);
      await forbiddenRequestTest(RegionalCoordinator);
      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(NationalCoordinator);
      await forbiddenRequestTest(LaboratoryUserFixture);
    });

    test('should require a valid laboratoryId', async () => {
      await request(app)
        .put(testRoute(fakerFR.string.alphanumeric(32)))
        .use(tokenProvider(AdminFixture))
        .send(validBody)
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should update the laboratory agreement and return the updated list', async () => {
      const res = await request(app)
        .put(testRoute(LaboratoryFixture.id))
        .use(tokenProvider(AdminFixture))
        .send(validBody)
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toBeInstanceOf(Array);
      expectArrayToContainElements(res.body, [
        expect.objectContaining({
          laboratoryId: LaboratoryFixture.id,
          programmingSubPlanId: PPVValidatedSubPlanId,
          substanceKind: 'Any',
          referenceLaboratory: true,
          detectionAnalysis: true,
          confirmationAnalysis: false
        })
      ]);
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

    // test('should get a valid laboratory id', async () => {
    //   await request(app)
    //     .put(
    //       testRoute(
    //         fakerFR.string.alphanumeric(32),
    //         Laboratory1AnalyticalCompetenceFixture1.id
    //       )
    //     )
    //     .use(tokenProvider(LaboratoryUserFixture))
    //     .send(validBody)
    //     .expect(constants.HTTP_STATUS_BAD_REQUEST);
    // });
    //
    // test('should get a valide analytical competence id', async () => {
    //   await request(app)
    //     .put(testRoute(LaboratoryFixture.id, fakerFR.string.alphanumeric(32)))
    //     .use(tokenProvider(LaboratoryUserFixture))
    //     .send(validBody)
    //     .expect(constants.HTTP_STATUS_BAD_REQUEST);
    // });
    //
    // test('should update a laboratory analytical competence', async () => {
    //   const res = await request(app)
    //     .put(
    //       testRoute(
    //         LaboratoryFixture.id,
    //         Laboratory1AnalyticalCompetenceFixture1.id
    //       )
    //     )
    //     .use(tokenProvider(LaboratoryUserFixture))
    //     .send(validBody)
    //     .expect(constants.HTTP_STATUS_OK);
    //
    //   expectArrayToContainElements(res.body, [
    //     {
    //       ...validBody,
    //       id: Laboratory1AnalyticalCompetenceFixture1.id,
    //       laboratoryId: LaboratoryFixture.id,
    //       lastUpdatedAt: expect.any(String)
    //     }
    //   ]);
    //
    //   await expect(
    //     LaboratoryAnalyticalCompetences()
    //       .where({ id: Laboratory1AnalyticalCompetenceFixture1.id })
    //       .first()
    //   ).resolves.toMatchObject({
    //     ...validBody,
    //     detectionLimit: validBody.detectionLimit?.toFixed(4),
    //     quantificationLimit: validBody.quantificationLimit?.toFixed(4),
    //     id: Laboratory1AnalyticalCompetenceFixture1.id,
    //     laboratoryId: LaboratoryFixture.id,
    //     lastUpdatedAt: expect.any(Date)
    //   });
    // });
  });
});
