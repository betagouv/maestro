import { constants } from 'http2';
import request from 'supertest';
import {
  NationalCoordinator,
  Sampler1Fixture,
} from '../../../database/seeds/test/001-users';
import { DocumentKind } from '../../../shared/schema/Document/DocumentKind';
import {
  genDocument,
  genDocumentToCreate,
} from '../../../shared/test/documentFixtures';
import { Documents } from '../../repositories/documentRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
describe('Document router', () => {
  const { app } = createServer();

  const analysisDocument = genDocument({
    createdBy: Sampler1Fixture.id,
    kind: 'AnalysisReportDocument' as DocumentKind,
  });

  const resourceDocument = genDocument({
    createdBy: NationalCoordinator.id,
    kind: 'Resource' as DocumentKind,
  });

  beforeAll(async () => {
    await Documents().insert([analysisDocument, resourceDocument]);
  });

  afterAll(async () => {
    await Documents()
      .delete()
      .where('id', 'in', [analysisDocument.id, resourceDocument.id]);
  });

  describe('GET /documents/resources', () => {
    const testRoute = '/api/documents/resources';

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should return all resources', async () => {
      const res = await request(app)
        .get(testRoute)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual([
        {
          ...resourceDocument,
          createdAt: resourceDocument.createdAt.toISOString(),
        },
      ]);
    });
  });

  describe('POST /documents', () => {
    const testRoute = '/api/documents';
    const validResourceBody = {
      ...genDocumentToCreate(),
      kind: 'Resource',
    };

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .send(validResourceBody)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user has not the right permissions', async () => {
      await request(app)
        .post(testRoute)
        .send(validResourceBody)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);

      await request(app)
        .post(testRoute)
        .send({
          ...validResourceBody,
          kind: 'AnalysisReportDocument',
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .post(testRoute)
          .send(payload)
          .use(tokenProvider(NationalCoordinator))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest({ filename: 'test' });
      await badRequestTest({ ...validResourceBody, id: 'test' });
    });

    test('should create a resource document', async () => {
      const res = await request(app)
        .post(testRoute)
        .send(validResourceBody)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toEqual({
        ...validResourceBody,
        createdAt: expect.any(String),
        createdBy: NationalCoordinator.id,
        kind: 'Resource',
      });

      await expect(
        Documents().where({ id: validResourceBody.id }).first()
      ).resolves.toEqual({
        ...validResourceBody,
        createdAt: expect.any(Date),
        createdBy: NationalCoordinator.id,
        kind: 'Resource',
      });
    });

    test('should create an analysis document', async () => {
      const validAnalysisBody = {
        ...genDocumentToCreate(),
        kind: 'AnalysisReportDocument',
      };

      const res = await request(app)
        .post(testRoute)
        .send(validAnalysisBody)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toEqual({
        ...validAnalysisBody,
        createdAt: expect.any(String),
        createdBy: Sampler1Fixture.id,
        kind: 'AnalysisReportDocument',
      });

      await expect(
        Documents().where({ id: validAnalysisBody.id }).first()
      ).resolves.toEqual({
        ...validAnalysisBody,
        createdAt: expect.any(Date),
        createdBy: Sampler1Fixture.id,
        kind: 'AnalysisReportDocument',
      });
    });
  });
});
