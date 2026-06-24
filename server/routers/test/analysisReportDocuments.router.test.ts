import { constants } from 'node:http2';
import type { UserRefined } from 'maestro-shared/schema/User/User';
import { genPartialAnalysis } from 'maestro-shared/test/analysisFixtures';
import {
  genDocument,
  genDocumentToCreate
} from 'maestro-shared/test/documentFixtures';
import {
  Sample2Fixture,
  Sample11Fixture,
  Sample13Fixture
} from 'maestro-shared/test/sampleFixtures';
import {
  AdminFixture,
  LaboratoryOfficeUserFixture,
  LaboratoryUserFixture,
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
  const analysisNoDocuments = genPartialAnalysis({
    sampleId: Sample11Fixture.id,
    createdBy: Sampler1Fixture.id
  });
  const analysisWithDocuments = genPartialAnalysis({
    sampleId: Sample13Fixture.id,
    createdBy: Sampler1Fixture.id
  });
  const analysisOutOfRegion = genPartialAnalysis({
    sampleId: Sample2Fixture.id,
    createdBy: Sampler1Fixture.id
  });

  beforeEach(async () => {
    await Documents().insert([document1, document2]);
    await Analysis().insert([
      analysisNoDocuments,
      analysisWithDocuments,
      analysisOutOfRegion
    ]);
    await analysisReportDocumentsRepository.insert(
      analysisWithDocuments.id,
      document1.id
    );
    await analysisReportDocumentsRepository.insert(
      analysisWithDocuments.id,
      document2.id
    );
  });

  afterEach(async () => {
    await Analysis()
      .delete()
      .where('sampleId', 'in', [
        Sample11Fixture.id,
        Sample13Fixture.id,
        Sample2Fixture.id
      ]);
    await Documents().delete().where('id', 'in', [document1.id, document2.id]);
  });

  const testRoute = (analysisId: string) =>
    `/api/analysis/${analysisId}/reportDocuments`;

  describe('GET /analysis/:analysisId/reportDocuments', () => {
    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(analysisWithDocuments.id))
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

    test('should fail if the analysis is out of the user region scope', async () => {
      await request(app)
        .get(testRoute(analysisOutOfRegion.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should get no documents', async () => {
      const res = await request(app)
        .get(testRoute(analysisNoDocuments.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual([]);
    });

    test('should get report documents', async () => {
      const res = await request(app)
        .get(testRoute(analysisWithDocuments.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual([document2.id, document1.id]);
    });
  });

  describe('POST /analysis/:analysisId/reportDocuments', () => {
    const validBody = () => genDocumentToCreate();

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute(analysisNoDocuments.id))
        .send(validBody())
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .post(testRoute(analysisNoDocuments.id))
          .send(payload)
          .use(tokenProvider(Sampler1Fixture))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest({});
    });

    test('should fail if the user does not have the performAnalysis permission', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .post(testRoute(analysisNoDocuments.id))
          .send(validBody())
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(NationalCoordinator);
      await forbiddenRequestTest(AdminFixture);
      await forbiddenRequestTest(LaboratoryUserFixture);
      await forbiddenRequestTest(LaboratoryOfficeUserFixture);
    });

    test('should fail if the analysis is out of the user region scope', async () => {
      await request(app)
        .post(testRoute(analysisOutOfRegion.id))
        .send(validBody())
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should create and link a report document', async () => {
      const body = validBody();

      await request(app)
        .post(testRoute(analysisNoDocuments.id))
        .send(body)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_CREATED);

      await expect(
        Documents().where({ id: body.id }).first()
      ).resolves.toMatchObject({
        id: body.id,
        kind: 'AnalysisReportDocument',
        createdBy: Sampler1Fixture.id
      });

      await expect(
        analysisReportDocumentsRepository.findByAnalysisId(
          analysisNoDocuments.id
        )
      ).resolves.toEqual([body.id]);

      await Documents().where({ id: body.id }).delete();
    });
  });

  describe('DELETE /analysis/:analysisId/reportDocuments', () => {
    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .delete(testRoute(analysisWithDocuments.id))
        .send({ documentId: document1.id })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .delete(testRoute(analysisWithDocuments.id))
          .send(payload)
          .use(tokenProvider(Sampler1Fixture))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest({});
      await badRequestTest({ documentId: undefined });
    });

    test('should fail if the user does not have the performAnalysis permission', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .delete(testRoute(analysisWithDocuments.id))
          .send({ documentId: document1.id })
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(NationalCoordinator);
      await forbiddenRequestTest(AdminFixture);
      await forbiddenRequestTest(LaboratoryUserFixture);
      await forbiddenRequestTest(LaboratoryOfficeUserFixture);
    });

    test('should fail if the analysis is out of the user region scope', async () => {
      await request(app)
        .delete(testRoute(analysisOutOfRegion.id))
        .send({ documentId: document1.id })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should unlink a document from an analysis', async () => {
      await request(app)
        .delete(testRoute(analysisWithDocuments.id))
        .send({ documentId: document2.id })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      await expect(
        analysisReportDocumentsRepository.findByAnalysisId(
          analysisWithDocuments.id
        )
      ).resolves.toEqual([document1.id]);
    });
  });
});
