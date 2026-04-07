import { constants } from 'node:http2';
import { omit } from 'lodash-es';
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
  LaboratoryUserFixture,
  NationalCoordinator,
  RegionalCoordinator,
  RegionalDromCoordinator,
  Sampler1Fixture
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

      expect(recipients).toHaveLength(3);
      expect(recipients).toMatchObject(
        expect.arrayContaining([
          expect.objectContaining({
            id: LaboratoryUserFixture.id,
            roles: ['LaboratoryUser']
          }),
          expect.objectContaining({
            id: RegionalCoordinator.id,
            roles: ['RegionalCoordinator']
          }),
          expect.objectContaining({
            id: RegionalDromCoordinator.id,
            roles: ['RegionalCoordinator']
          })
        ])
      );

      expect(notificationData).toMatchObject({
        category: 'ResourceDocumentUploaded',
        author: NationalCoordinator,
        link: expect.stringContaining(validResourceBody.id)
      });

      expect(params).toMatchObject({
        object: 'Nouveau document disponible'
      });
    });

    test('should not notify not concerned Laboratory', async () => {
      mockSendNotification.mockClear();

      await request(app)
        .post(testRoute)
        .send({
          ...genDocumentToCreate(),
          kind: 'TechnicalInstruction',
          name: 'Resource Document',
          programmingPlanIds: [DAOAInProgressProgrammingPlanFixture.id],
          year: DAOAInProgressProgrammingPlanFixture.year
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(mockSendNotification).toHaveBeenCalledTimes(1);

      const [_notificationData, recipients, _params] =
        mockSendNotification.mock.calls[0];

      expect(recipients).toHaveLength(0);
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
        kind: 'AnalysisReportDocument',
        programmingPlanIds: []
      });

      await expect(
        Documents().where({ id: validAnalysisBody.id }).first()
      ).resolves.toEqual({
        ...validAnalysisBody,
        createdAt: expect.any(Date),
        createdBy: Sampler1Fixture.id,
        kind: 'AnalysisReportDocument',
        legend: null,
        name: null,
        notes: null,
        year: null
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
        kind: 'SampleDocument',
        programmingPlanIds: []
      });

      await expect(
        Documents().where({ id: validSampleBody.id }).first()
      ).resolves.toEqual({
        ...validSampleBody,
        createdAt: expect.any(Date),
        createdBy: Sampler1Fixture.id,
        kind: 'SampleDocument',
        legend: null,
        name: null,
        notes: null,
        year: null
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
        .send({ kind: 'SampleDocument', legend: 'legend' })
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

    test('should fail if the document is not an updatable document', async () => {
      await request(app)
        .put(testRoute(analysisDocument.id))
        .send({ kind: 'SampleDocument', legend: 'legend' })
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
        .send({ kind: 'SampleDocument', legend: updatedLegend })
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
        legend: updatedLegend,
        notes: null
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
