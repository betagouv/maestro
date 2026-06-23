import { constants } from 'node:http2';
import { omit } from 'lodash-es';
import { UserBase } from 'maestro-shared/schema/User/User';
import {
  genDocument,
  genDocumentToCreate
} from 'maestro-shared/test/documentFixtures';
import {
  DAOAInProgressProgrammingPlanFixture,
  PPVInProgressProgrammingPlanFixture,
  PPVValidatedProgrammingPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import { Sample11Fixture } from 'maestro-shared/test/sampleFixtures';
import {
  AdminFixture,
  DepartmentalCoordinator,
  LaboratoryUserFixture,
  NationalCoordinator,
  NationalCoordinatorDaoaFixture,
  NationalObserver,
  RegionalCoordinator,
  RegionalObserver,
  Sampler1Fixture,
  Sampler2Fixture,
  SamplerDaoaFixture
} from 'maestro-shared/test/userFixtures';
import { expectArrayToContainElements } from 'maestro-shared/test/utils';
import { withISOStringDates } from 'maestro-shared/utils/date';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { knexInstance as db } from '../../repositories/db';
import {
  Documents,
  documentProgrammingPlansTable
} from '../../repositories/documentRepository';
import { sampleDocumentsTable } from '../../repositories/sampleRepository';
import { createServer } from '../../server';
import { mockSendNotification } from '../../test/setupTests';
import { tokenProvider } from '../../test/testUtils';

describe('Document router', () => {
  const { app } = createServer();

  const analysisDocument = genDocument({
    createdBy: Sampler1Fixture.id,
    kind: 'AnalysisReportDocument' as const
  });

  const noPlanResourceDocument = genDocument({
    createdBy: NationalCoordinator.id,
    kind: 'TechnicalInstruction' as const,
    year: PPVInProgressProgrammingPlanFixture.year
  });

  const ppvValidatedResourceDocument = genDocument({
    createdBy: NationalCoordinator.id,
    kind: 'TechnicalInstruction' as const,
    programmingPlanIds: [PPVValidatedProgrammingPlanFixture.id],
    year: PPVValidatedProgrammingPlanFixture.year
  });
  const ppvInProgressResourceDocument = genDocument({
    createdBy: NationalCoordinator.id,
    kind: 'TechnicalInstruction' as const,
    programmingPlanIds: [PPVInProgressProgrammingPlanFixture.id],
    year: PPVInProgressProgrammingPlanFixture.year
  });
  const daoaInProgressResourceDocument = genDocument({
    createdBy: NationalCoordinator.id,
    kind: 'TechnicalInstruction' as const,
    programmingPlanIds: [DAOAInProgressProgrammingPlanFixture.id],
    year: DAOAInProgressProgrammingPlanFixture.year
  });

  const sampleDocument = genDocument({
    createdBy: Sampler1Fixture.id,
    kind: 'SampleDocument' as const
  });

  beforeAll(async () => {
    await Documents().insert(
      [
        analysisDocument,
        noPlanResourceDocument,
        ppvValidatedResourceDocument,
        ppvInProgressResourceDocument,
        daoaInProgressResourceDocument,
        sampleDocument
      ].map((_) => omit(_, 'programmingPlanIds'))
    );
    await db(sampleDocumentsTable).insert({
      sampleId: Sample11Fixture.id,
      documentId: sampleDocument.id
    });
    await db(documentProgrammingPlansTable).insert([
      {
        documentId: ppvValidatedResourceDocument.id,
        programmingPlanId: PPVValidatedProgrammingPlanFixture.id
      },
      {
        documentId: ppvInProgressResourceDocument.id,
        programmingPlanId: PPVInProgressProgrammingPlanFixture.id
      },
      {
        documentId: daoaInProgressResourceDocument.id,
        programmingPlanId: DAOAInProgressProgrammingPlanFixture.id
      }
    ]);
  });

  afterAll(async () => {
    await Documents()
      .delete()
      .where('id', 'in', [
        analysisDocument.id,
        noPlanResourceDocument.id,
        ppvValidatedResourceDocument.id,
        ppvInProgressResourceDocument.id,
        daoaInProgressResourceDocument.id,
        sampleDocument.id
      ]);
  });

  describe('GET /documents/resources', () => {
    const testRoute = (params?: Record<string, string>) =>
      `/api/documents/resources?${new URLSearchParams(params).toString()}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute())
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should return all resources for admin', async () => {
      const res = await request(app)
        .get(testRoute())
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expectArrayToContainElements(res.body, [
        {
          ...noPlanResourceDocument,
          programmingPlanIds: [],
          createdAt: expect.any(String)
        },
        { ...ppvValidatedResourceDocument, createdAt: expect.any(String) },
        { ...ppvInProgressResourceDocument, createdAt: expect.any(String) },
        { ...daoaInProgressResourceDocument, createdAt: expect.any(String) }
      ]);
    });

    test('should filter resources by query', async () => {
      const resByYear = await request(app)
        .get(
          testRoute({
            year: String(PPVInProgressProgrammingPlanFixture.year)
          })
        )
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expectArrayToContainElements(resByYear.body, [
        {
          ...noPlanResourceDocument,
          programmingPlanIds: [],
          createdAt: expect.any(String)
        },
        { ...ppvInProgressResourceDocument, createdAt: expect.any(String) }
      ]);

      const resByProgrammingPlan = await request(app)
        .get(
          testRoute({
            programmingPlanId: PPVInProgressProgrammingPlanFixture.id
          })
        )
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expectArrayToContainElements(resByProgrammingPlan.body, [
        { ...ppvInProgressResourceDocument, createdAt: expect.any(String) }
      ]);
    });

    test('should filter ressources for national coordinator by authorized programming plans', async () => {
      const res = await request(app)
        .get(testRoute())
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expectArrayToContainElements(res.body, [
        {
          ...noPlanResourceDocument,
          programmingPlanIds: [],
          createdAt: expect.any(String)
        },
        { ...ppvValidatedResourceDocument, createdAt: expect.any(String) },
        { ...ppvInProgressResourceDocument, createdAt: expect.any(String) }
      ]);
    });

    test('should filter ressources for sampler by validated authorized programming plans', async () => {
      const res = await request(app)
        .get(testRoute())
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expectArrayToContainElements(res.body, [
        {
          ...noPlanResourceDocument,
          programmingPlanIds: [],
          createdAt: expect.any(String)
        },
        { ...ppvValidatedResourceDocument, createdAt: expect.any(String) }
      ]);
    });

    test('should filter ressources for laboratory user by validated authorized programming plans or no plans', async () => {
      const res = await request(app)
        .get(testRoute())
        .use(tokenProvider(LaboratoryUserFixture))
        .expect(constants.HTTP_STATUS_OK);

      expectArrayToContainElements(res.body, [
        {
          ...noPlanResourceDocument,
          programmingPlanIds: [],
          createdAt: expect.any(String)
        },
        { ...ppvValidatedResourceDocument, createdAt: expect.any(String) }
      ]);
    });
  });

  describe('POST /documents', () => {
    const testRoute = '/api/documents';

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .send({ ...genDocumentToCreate(), kind: 'AnalysisReportDocument' })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should reject a non analysis report document kind', async () => {
      await request(app)
        .post(testRoute)
        .send({ ...genDocumentToCreate(), kind: 'SampleDocument' })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should create an analysis report document', async () => {
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
        kind: 'AnalysisReportDocument',
        programmingPlanIds: []
      });

      await Documents().where({ id: validAnalysisBody.id }).delete();
    });
  });

  describe('POST /documents/resources', () => {
    const testRoute = '/api/documents/resources';
    const validResourceBody = {
      ...genDocumentToCreate(),
      kind: 'TechnicalInstruction',
      name: 'Resource Document',
      programmingPlanIds: [PPVValidatedProgrammingPlanFixture.id],
      year: PPVValidatedProgrammingPlanFixture.year
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
    });

    test('should reject a non resource document kind', async () => {
      await request(app)
        .post(testRoute)
        .send({ ...validResourceBody, kind: 'AnalysisReportDocument' })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
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

    test('should create a resource document and notify concerned Laboratory', async () => {
      mockSendNotification.mockClear();

      const res = await request(app)
        .post(testRoute)
        .send(validResourceBody)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toEqual({
        ...validResourceBody,
        createdAt: expect.any(String),
        createdBy: NationalCoordinator.id,
        kind: 'TechnicalInstruction'
      });

      await expect(
        Documents().where({ id: validResourceBody.id }).first()
      ).resolves.toEqual({
        ...validResourceBody,
        createdAt: expect.any(Date),
        createdBy: NationalCoordinator.id,
        kind: 'TechnicalInstruction',
        legend: null,
        notes: null,
        programmingPlanIds: undefined
      });

      expect(mockSendNotification).toHaveBeenCalledTimes(1);

      const [notificationData, recipients, params] =
        mockSendNotification.mock.calls[0];

      expect(recipients).toHaveLength(6);
      expect(recipients).toMatchObject(
        expect.arrayContaining(
          [
            LaboratoryUserFixture,
            Sampler1Fixture,
            Sampler2Fixture,
            RegionalCoordinator,
            RegionalObserver,
            NationalObserver
          ].map((user) =>
            expect.objectContaining({
              id: user.id
            })
          )
        )
      );

      expect(notificationData).toMatchObject({
        category: 'ResourceDocumentUploaded',
        author: UserBase.omit({
          programmingSubPlans: true
        }).parse(NationalCoordinator),
        link: expect.stringContaining(validResourceBody.id)
      });

      expect(params).toMatchObject({
        object: 'Nouveau document disponible'
      });

      await Documents().where({ id: validResourceBody.id }).delete();
    });

    test('should not notify not concerned Laboratory', async () => {
      mockSendNotification.mockClear();

      const daoaResourceBody = {
        ...genDocumentToCreate(),
        kind: 'TechnicalInstruction',
        name: 'Resource Document',
        programmingPlanIds: [DAOAInProgressProgrammingPlanFixture.id],
        year: DAOAInProgressProgrammingPlanFixture.year
      };

      await request(app)
        .post(testRoute)
        .send(daoaResourceBody)
        .use(tokenProvider(NationalCoordinatorDaoaFixture))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(mockSendNotification).toHaveBeenCalledTimes(1);

      const [_notificationData, recipients, _params] =
        mockSendNotification.mock.calls[0];

      expect(recipients).toHaveLength(2);

      expect(recipients).toMatchObject(
        expect.arrayContaining(
          [SamplerDaoaFixture, DepartmentalCoordinator].map((user) =>
            expect.objectContaining({
              id: user.id
            })
          )
        )
      );

      await Documents().where({ id: daoaResourceBody.id }).delete();
    });
  });

  describe('POST /samples/:sampleId/documents', () => {
    const testRoute = (sampleId: string) =>
      `/api/samples/${sampleId}/documents`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute(Sample11Fixture.id))
        .send({ ...genDocumentToCreate(), kind: 'SampleDocument' })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the sample is out of the user region scope', async () => {
      await request(app)
        .post(testRoute(Sample11Fixture.id))
        .send({ ...genDocumentToCreate(), kind: 'SampleDocument' })
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should reject a non sample document kind', async () => {
      await request(app)
        .post(testRoute(Sample11Fixture.id))
        .send({ ...genDocumentToCreate(), kind: 'AnalysisReportDocument' })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should create and link a sample document', async () => {
      const validSampleBody = {
        ...genDocumentToCreate(),
        kind: 'SampleDocument'
      };

      const res = await request(app)
        .post(testRoute(Sample11Fixture.id))
        .send(validSampleBody)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject({
        ...validSampleBody,
        createdBy: Sampler1Fixture.id,
        kind: 'SampleDocument',
        programmingPlanIds: []
      });

      await expect(
        db(sampleDocumentsTable)
          .where({
            sampleId: Sample11Fixture.id,
            documentId: validSampleBody.id
          })
          .first()
      ).resolves.toMatchObject({ documentId: validSampleBody.id });

      await Documents().where({ id: validSampleBody.id }).delete();
    });
  });

  describe('GET /documents/resources/:documentId', () => {
    const testRoute = (id: string) => `/api/documents/resources/${id}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(ppvValidatedResourceDocument.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get an in-scope resource document', async () => {
      const res = await request(app)
        .get(testRoute(ppvValidatedResourceDocument.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        withISOStringDates(ppvValidatedResourceDocument)
      );
    });

    test('should get a global resource document with no programming plan', async () => {
      await request(app)
        .get(testRoute(noPlanResourceDocument.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);
    });

    test('should fail if the resource document is out of the user programming scope', async () => {
      await request(app)
        .get(testRoute(daoaInProgressResourceDocument.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the document is not a resource document', async () => {
      await request(app)
        .get(testRoute(sampleDocument.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });
  });

  describe('GET /documents/resources/:documentId/download-signed-url', () => {
    const testRoute = (id: string) =>
      `/api/documents/resources/${id}/download-signed-url`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(ppvValidatedResourceDocument.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the resource document is out of the user programming scope', async () => {
      await request(app)
        .get(testRoute(daoaInProgressResourceDocument.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });
  });

  describe('PUT /documents/resources/:documentId', () => {
    const testRoute = (id: string) => `/api/documents/resources/${id}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute(ppvInProgressResourceDocument.id))
        .send({ kind: 'TechnicalInstruction', legend: 'legend' })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid document id', async () => {
      await request(app)
        .put(testRoute('invalid-id'))
        .send({ kind: 'TechnicalInstruction', legend: 'legend' })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the document is not a resource document', async () => {
      await request(app)
        .put(testRoute(sampleDocument.id))
        .send({
          kind: 'TechnicalInstruction',
          name: 'updated',
          year: PPVValidatedProgrammingPlanFixture.year
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the resource document is out of the user programming scope', async () => {
      await request(app)
        .put(testRoute(daoaInProgressResourceDocument.id))
        .send({
          kind: 'TechnicalInstruction',
          name: 'updated',
          year: DAOAInProgressProgrammingPlanFixture.year,
          programmingPlanIds: [DAOAInProgressProgrammingPlanFixture.id]
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should update the resource document', async () => {
      await request(app)
        .put(testRoute(ppvInProgressResourceDocument.id))
        .send({
          kind: 'TechnicalInstruction',
          name: 'updated',
          legend: 'updated legend',
          year: PPVInProgressProgrammingPlanFixture.year,
          programmingPlanIds: [PPVInProgressProgrammingPlanFixture.id]
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      await expect(
        Documents().where({ id: ppvInProgressResourceDocument.id }).first()
      ).resolves.toMatchObject({ legend: 'updated legend' });
    });
  });

  describe('DELETE /documents/resources/:documentId', () => {
    const testRoute = (id: string) => `/api/documents/resources/${id}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .delete(testRoute(ppvValidatedResourceDocument.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the document is not a resource document', async () => {
      await request(app)
        .delete(testRoute(sampleDocument.id))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the resource document is out of the user programming scope', async () => {
      await request(app)
        .delete(testRoute(daoaInProgressResourceDocument.id))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });
  });

  describe('GET /samples/:sampleId/documents/:documentId', () => {
    const testRoute = (sampleId: string, documentId: string) =>
      `/api/samples/${sampleId}/documents/${documentId}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(Sample11Fixture.id, sampleDocument.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get the sample document', async () => {
      const res = await request(app)
        .get(testRoute(Sample11Fixture.id, sampleDocument.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(withISOStringDates(sampleDocument));
    });

    test('should fail if the sample is out of the user region scope', async () => {
      await request(app)
        .get(testRoute(Sample11Fixture.id, sampleDocument.id))
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the document is not attached to the sample', async () => {
      await request(app)
        .get(testRoute(Sample11Fixture.id, ppvValidatedResourceDocument.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });
  });

  describe('GET /samples/:sampleId/documents/:documentId/download-signed-url', () => {
    const testRoute = (sampleId: string, documentId: string) =>
      `/api/samples/${sampleId}/documents/${documentId}/download-signed-url`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(Sample11Fixture.id, sampleDocument.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the sample is out of the user region scope', async () => {
      await request(app)
        .get(testRoute(Sample11Fixture.id, sampleDocument.id))
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });
  });

  describe('PUT /samples/:sampleId/documents/:documentId', () => {
    const testRoute = (sampleId: string, documentId: string) =>
      `/api/samples/${sampleId}/documents/${documentId}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute(Sample11Fixture.id, sampleDocument.id))
        .send({ legend: 'legend' })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the sample is out of the user region scope', async () => {
      await request(app)
        .put(testRoute(Sample11Fixture.id, sampleDocument.id))
        .send({ legend: 'legend' })
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the document is not attached to the sample', async () => {
      await request(app)
        .put(testRoute(Sample11Fixture.id, ppvValidatedResourceDocument.id))
        .send({ legend: 'legend' })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should update the sample document legend', async () => {
      await request(app)
        .put(testRoute(Sample11Fixture.id, sampleDocument.id))
        .send({ legend: 'updated legend' })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      await expect(
        Documents().where({ id: sampleDocument.id }).first()
      ).resolves.toMatchObject({ legend: 'updated legend' });
    });
  });

  describe('DELETE /samples/:sampleId/documents/:documentId', () => {
    const testRoute = (sampleId: string, documentId: string) =>
      `/api/samples/${sampleId}/documents/${documentId}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .delete(testRoute(Sample11Fixture.id, sampleDocument.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the sample is out of the user region scope', async () => {
      await request(app)
        .delete(testRoute(Sample11Fixture.id, sampleDocument.id))
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the document is not attached to the sample', async () => {
      await request(app)
        .delete(testRoute(Sample11Fixture.id, ppvValidatedResourceDocument.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });
  });
});
