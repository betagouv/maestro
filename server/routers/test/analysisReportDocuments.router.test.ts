import { constants } from 'http2';
import { UserRefined } from 'maestro-shared/schema/User/User';
import {
  genAnalysisToCreate,
  genPartialAnalysis
} from 'maestro-shared/test/analysisFixtures';
import { genDocument } from 'maestro-shared/test/documentFixtures';
import {
  Sample11Fixture,
  Sample2Fixture
} from 'maestro-shared/test/sampleFixtures';
import {
  AdminFixture,
  NationalCoordinator,
  NationalObserver,
  RegionalObserver,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { analysisReportDocumentsRepository } from '../../repositories/analysisReportDocumentsRepository';
import { Analysis } from '../../repositories/analysisRepository';
import { Documents } from '../../repositories/documentRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Analysis Report Documents router', () => {
  const { app } = createServer();

  const document1 = genDocument({
    createdBy: Sampler1Fixture.id,
    kind: 'AnalysisReportDocument'
  });
  const document2 = genDocument({
    createdBy: Sampler1Fixture.id,
    kind: 'AnalysisReportDocument'
  });
  const analysisWithoutReportDocuments = genPartialAnalysis({
    sampleId: Sample11Fixture.id,
    createdBy: Sampler1Fixture.id
  });
  const analysisWithReportDocuments = genPartialAnalysis({
    sampleId: Sample2Fixture.id,
    createdBy: Sampler1Fixture.id
  });

  beforeEach(async () => {
    await Documents().insert([document1, document2]);
    await Analysis().insert([
      analysisWithoutReportDocuments,
      analysisWithReportDocuments
    ]);
    await analysisReportDocumentsRepository.insert(
      analysisWithReportDocuments.id,
      document1.id
    );
    await analysisReportDocumentsRepository.insert(
      analysisWithReportDocuments.id,
      document2.id
    );
  });

  afterEach(async () => {
    await Analysis()
      .delete()
      .where('sampleId', 'in', [Sample11Fixture.id, Sample2Fixture.id]);
    await Documents().delete().where('id', 'in', [document1.id, document2.id]);
  });

  const testRoute = (analysisId: string) =>
    `/api/analysis/${analysisId}/reportDocuments`;

  describe('GET /analysis/:analysisId/reportDocuments', () => {
    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(analysisWithReportDocuments.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid analysis id', async () => {
      await request(app)
        .get(testRoute('123'))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the analysis does not exist', async () => {
      await request(app)
        .get(testRoute(uuidv4()))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should get no documents', async () => {
      const res = await request(app)
        .get(testRoute(analysisWithoutReportDocuments.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual([]);
    });

    test('should get report documents', async () => {
      const res = await request(app)
        .get(testRoute(analysisWithReportDocuments.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual([document2.id, document1.id]);
    });
  });
  describe('POST /analysis/:analysisId/reportDocuments', () => {
    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute('test'))
        .send(genAnalysisToCreate())
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .post(testRoute(analysisWithReportDocuments.id))
          .send(payload)
          .use(tokenProvider(Sampler1Fixture))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest({});
      await badRequestTest({
        documentId: undefined
      });
    });

    test('should fail if the user does not have the permission to create analysis', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .post(testRoute(analysisWithoutReportDocuments.id))
          .send({ documentId: document1.id })
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(NationalCoordinator);
      await forbiddenRequestTest(AdminFixture);
    });

    test('should link a document with an analysis', async () => {
      const document3 = genDocument({
        createdBy: Sampler1Fixture.id,
        kind: 'AnalysisReportDocument'
      });
      await Documents().insert([document3]);

      await request(app)
        .post(testRoute(analysisWithoutReportDocuments.id))
        .send({ documentId: document3.id })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_CREATED);

      await expect(
        analysisReportDocumentsRepository.findByAnalysisId(
          analysisWithoutReportDocuments.id
        )
      ).resolves.toEqual([document3.id]);
    });
  });
  describe('DELETE /analysis/:analysisId/reportDocuments', () => {
    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .delete(testRoute('test'))
        .send(genAnalysisToCreate())
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .delete(testRoute(analysisWithReportDocuments.id))
          .send(payload)
          .use(tokenProvider(Sampler1Fixture))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest({});
      await badRequestTest({
        documentId: undefined
      });
    });

    test('should fail if the user does not have the permission to create analysis', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .delete(testRoute(analysisWithoutReportDocuments.id))
          .send({ documentId: document1.id })
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(NationalCoordinator);
      await forbiddenRequestTest(AdminFixture);
    });

    test('should unlink a document with an analysis', async () => {
      await request(app)
        .delete(testRoute(analysisWithReportDocuments.id))
        .send({ documentId: document2.id })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      await expect(
        analysisReportDocumentsRepository.findByAnalysisId(
          analysisWithReportDocuments.id
        )
      ).resolves.toEqual([document1.id]);
    });
  });
});
