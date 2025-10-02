import { constants } from 'http2';
import {
  genDocument,
  genDocumentToCreate
} from 'maestro-shared/test/documentFixtures';
import request from 'supertest';
import { Documents } from '../../repositories/documentRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

import { Sample11Fixture } from 'maestro-shared/test/sampleFixtures';
import {
  AdminFixture,
  NationalCoordinator,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import { withISOStringDates } from 'maestro-shared/utils/utils';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { knexInstance as db } from '../../repositories/db';
import { sampleDocumentsTable } from '../../repositories/sampleRepository';
describe('Document router', () => {
  const { app } = createServer();

  const analysisDocument = genDocument({
    createdBy: Sampler1Fixture.id,
    kind: 'AnalysisReportDocument' as const
  });

  const resourceDocument = genDocument({
    createdBy: NationalCoordinator.id,
    kind: 'Resource' as const
  });

  const sampleDocument = genDocument({
    createdBy: Sampler1Fixture.id,
    kind: 'SampleDocument' as const
  });

  beforeAll(async () => {
    await Documents().insert([
      analysisDocument,
      resourceDocument,
      sampleDocument
    ]);
    await db(sampleDocumentsTable).insert({
      sampleId: Sample11Fixture.id,
      documentId: sampleDocument.id
    });
  });

  afterAll(async () => {
    await Documents()
      .delete()
      .where('id', 'in', [
        analysisDocument.id,
        resourceDocument.id,
        sampleDocument.id
      ]);
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
          createdAt: resourceDocument.createdAt.toISOString()
        }
      ]);
    });
  });

  describe('POST /documents', () => {
    const testRoute = '/api/documents';
    const validResourceBody = {
      ...genDocumentToCreate(),
      kind: 'Resource'
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
        .send({
          ...validResourceBody,
          kind: 'SupportDocument'
        })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);

      await request(app)
        .post(testRoute)
        .send(validResourceBody)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);

      await request(app)
        .post(testRoute)
        .send({
          ...validResourceBody,
          kind: 'AnalysisReportDocument'
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);

      await request(app)
        .post(testRoute)
        .send({
          ...validResourceBody,
          kind: 'SampleDocument'
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
        kind: 'Resource'
      });

      await expect(
        Documents().where({ id: validResourceBody.id }).first()
      ).resolves.toEqual({
        ...validResourceBody,
        createdAt: expect.any(Date),
        createdBy: NationalCoordinator.id,
        kind: 'Resource',
        legend: null
      });
    });

    test('should create an analysis document', async () => {
      const validAnalysisBody = {
        ...genDocumentToCreate(),
        kind: 'AnalysisReportDocument'
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
        kind: 'AnalysisReportDocument'
      });

      await expect(
        Documents().where({ id: validAnalysisBody.id }).first()
      ).resolves.toEqual({
        ...validAnalysisBody,
        createdAt: expect.any(Date),
        createdBy: Sampler1Fixture.id,
        kind: 'AnalysisReportDocument',
        legend: null
      });
    });

    test('should create a sample document', async () => {
      const validSampleBody = {
        ...genDocumentToCreate(),
        kind: 'SampleDocument'
      };

      const res = await request(app)
        .post(testRoute)
        .send(validSampleBody)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toEqual({
        ...validSampleBody,
        createdAt: expect.any(String),
        createdBy: Sampler1Fixture.id,
        kind: 'SampleDocument'
      });

      await expect(
        Documents().where({ id: validSampleBody.id }).first()
      ).resolves.toEqual({
        ...validSampleBody,
        createdAt: expect.any(Date),
        createdBy: Sampler1Fixture.id,
        kind: 'SampleDocument',
        legend: null
      });
    });
  });

  describe('PUT /documents/:documentId', () => {
    const testRoute = (id: string) => `/api/documents/${id}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute(analysisDocument.id))
        .send({ legend: 'legend' })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user has not the right permissions', async () => {
      await request(app)
        .put(testRoute(analysisDocument.id))
        .send({ legend: 'legend' })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should get a valid document id', async () => {
      await request(app)
        .put(testRoute('invalid-id'))
        .send({ legend: 'legend' })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the document is not a sample document', async () => {
      await request(app)
        .put(testRoute(resourceDocument.id))
        .send({ legend: 'legend' })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if no body', async () => {
      await request(app)
        .put(testRoute(sampleDocument.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should update the document', async () => {
      const updatedLegend = 'test';
      const res = await request(app)
        .put(testRoute(sampleDocument.id))
        .send({ legend: updatedLegend })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual(
        withISOStringDates({
          ...sampleDocument,
          legend: updatedLegend
        })
      );

      await expect(
        Documents().where({ id: sampleDocument.id }).first()
      ).resolves.toEqual({
        ...sampleDocument,
        legend: updatedLegend
      });
    });
  });

  describe('GET /documents/:documentId', () => {
    const testRoute = (id: string) => `/api/documents/${id}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(analysisDocument.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get the document', async () => {
      const res = await request(app)
        .get(testRoute(sampleDocument.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(withISOStringDates(sampleDocument));
    });
  });
});
