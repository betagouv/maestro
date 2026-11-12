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
import { LaboratoryFixture } from 'maestro-shared/test/laboratoryFixtures';
import {
  PPVValidatedProgrammingPlanFixture,
  PPVValidatedSubPlanId
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  AdminBGIRFixture,
  AdminFixture,
  DepartmentalCoordinator,
  LaboratoryOfficeUserFixture,
  LaboratoryUserFixture,
  NationalCoordinator,
  NationalObserver,
  RegionalCoordinator,
  RegionalObserver,
  Sampler1Fixture,
  SamplerDaoaFixture
} from 'maestro-shared/test/userFixtures';
import { expectArrayToContainElements } from 'maestro-shared/test/utils';
import request from 'supertest';
import { afterEach, describe, expect, test } from 'vitest';
import { kysely } from '../../repositories/kysely';
import { createServer } from '../../server';
import { mockSendNotification } from '../../test/setupTests';
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
      `/api/laboratories${programmingPlanId || substanceKind ? '?' : ''}${programmingPlanId ? `programmingPlanId=${programmingPlanId}` : ''}${programmingPlanId && substanceKind ? '&' : ''}${substanceKind ? `substanceKinds=${substanceKind}` : ''}`;

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

    test('should filter aggregated laboratories by programmingPlanId and substanceKinds', async () => {
      const res = await request(app)
        .get(testRoute(PPVValidatedProgrammingPlanFixture.id, 'Mono'))
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

  describe('GET /laboratories/agreements', () => {
    const testRoute = '/api/laboratories/agreements';

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user cannot read laboratory agreements', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .get(testRoute)
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(NationalObserver);
    });

    test('should fail for a read-only user as long as the agreements are not diffused', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .get(testRoute)
          .query({ year: PPVValidatedProgrammingPlanFixture.year })
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(DepartmentalCoordinator);
      await forbiddenRequestTest(RegionalCoordinator);
      await forbiddenRequestTest(LaboratoryUserFixture);
    });

    test('should return the agreements of a diffused year to a read-only user', async () => {
      await kysely
        .insertInto('laboratoryAgreementDiffusions')
        .values({
          year: PPVValidatedProgrammingPlanFixture.year,
          diffusedAt: new Date(),
          diffusedBy: AdminBGIRFixture.id
        })
        .execute();

      await request(app)
        .get(testRoute)
        .query({ year: PPVValidatedProgrammingPlanFixture.year })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      await request(app)
        .get(testRoute)
        .query({ year: PPVValidatedProgrammingPlanFixture.year + 1 })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);

      await kysely.deleteFrom('laboratoryAgreementDiffusions').execute();
    });

    test('should return the sub-plans of a diffused year to a sampler, whatever his stages and the plan status', async () => {
      await kysely
        .insertInto('laboratoryAgreementDiffusions')
        .values({
          year: PPVValidatedProgrammingPlanFixture.year,
          diffusedAt: new Date(),
          diffusedBy: AdminBGIRFixture.id
        })
        .execute();

      const res = await request(app)
        .get('/api/laboratories/agreements/sub-plans')
        .query({ year: PPVValidatedProgrammingPlanFixture.year })
        .use(tokenProvider(SamplerDaoaFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: PPVValidatedSubPlanId,
            programmingPlanTitle: PPVValidatedProgrammingPlanFixture.title,
            programmingPlanDomainId: PPVValidatedProgrammingPlanFixture.domainId
          })
        ])
      );

      await request(app)
        .get('/api/laboratories/agreements/sub-plans')
        .query({ year: PPVValidatedProgrammingPlanFixture.year + 1 })
        .use(tokenProvider(SamplerDaoaFixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);

      await kysely.deleteFrom('laboratoryAgreementDiffusions').execute();
    });

    test('should return the agreements of an undiffused year to a national coordinator', async () => {
      await request(app)
        .get(testRoute)
        .query({ year: PPVValidatedProgrammingPlanFixture.year })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);
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
            substanceKind: 'Mono'
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
        substanceKind: 'Mono'
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

    test('removing an agreement notifies the coordinators that assigned this laboratory', async () => {
      try {
        await request(app)
          .put(testRoute(LaboratoryFixture.id))
          .use(tokenProvider(AdminFixture))
          .send(validBody)
          .expect(constants.HTTP_STATUS_OK);

        mockSendNotification.mockClear();

        await request(app)
          .put(testRoute(LaboratoryFixture.id))
          .use(tokenProvider(AdminFixture))
          .send({
            ...validBody,
            referenceLaboratory: false,
            detectionAnalysis: false,
            confirmationAnalysis: false
          })
          .expect(constants.HTTP_STATUS_OK);

        expect(mockSendNotification).toHaveBeenCalledWith(
          expect.objectContaining({ category: 'LaboratoryAgreementLost' }),
          expect.arrayContaining([
            expect.objectContaining({ id: RegionalCoordinator.id })
          ]),
          expect.objectContaining({
            object: expect.stringContaining('Perte d’agrément'),
            content: expect.stringContaining(LaboratoryFixture.shortName)
          }),
          expect.objectContaining({
            message: expect.stringContaining(LaboratoryFixture.shortName)
          })
        );
      } finally {
        await request(app)
          .put(testRoute(LaboratoryFixture.id))
          .use(tokenProvider(AdminFixture))
          .send(validBody);
      }
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
          substanceKind: 'Mono',
          referenceLaboratory: true,
          detectionAnalysis: true,
          confirmationAnalysis: false
        })
      ]);
    });
  });
  describe('POST /laboratories/agreements/diffusions', () => {
    const testRoute = '/api/laboratories/agreements/diffusions';
    const year = PPVValidatedProgrammingPlanFixture.year;

    afterEach(async () => {
      await kysely.deleteFrom('laboratoryAgreementDiffusions').execute();
    });

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .send({ year })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user cannot diffuse the laboratory agreements', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .post(testRoute)
          .send({ year })
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(AdminFixture);
      await forbiddenRequestTest(LaboratoryOfficeUserFixture);
      await forbiddenRequestTest(NationalCoordinator);
      await forbiddenRequestTest(Sampler1Fixture);
    });

    test('should refuse the diffusion while a sub-plan has no detection or confirmation laboratory', async () => {
      await request(app)
        .post(testRoute)
        .send({ year })
        .use(tokenProvider(AdminBGIRFixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);

      await expect(
        kysely.selectFrom('laboratoryAgreementDiffusions').selectAll().execute()
      ).resolves.toEqual([]);
    });

    test('should diffuse a year with no sub-plan left uncovered, and stay idempotent', async () => {
      const emptyYear = 1999;

      const res = await request(app)
        .post(testRoute)
        .send({ year: emptyYear })
        .use(tokenProvider(AdminBGIRFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        year: emptyYear,
        diffusedBy: AdminBGIRFixture.id
      });

      const again = await request(app)
        .post(testRoute)
        .send({ year: emptyYear })
        .use(tokenProvider(AdminBGIRFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(again.body).toMatchObject({ year: emptyYear });

      await expect(
        kysely.selectFrom('laboratoryAgreementDiffusions').selectAll().execute()
      ).resolves.toHaveLength(1);
    });
  });
});
