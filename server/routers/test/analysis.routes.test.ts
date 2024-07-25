import { constants } from 'http2';
import fp from 'lodash';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import {
  NationalCoordinator,
  Region1Fixture,
  Sampler1Fixture,
} from '../../../database/seeds/test/001-users';
import { ProgrammingPlanFixture } from '../../../database/seeds/test/002-programming-plans';
import { CompanyFixture } from '../../../database/seeds/test/003-companies';
import { Regions } from '../../../shared/referential/Region';
import { AnalyteList } from '../../../shared/referential/Residue/Analyte';
import { PartialAnalyte } from '../../../shared/schema/Analysis/Analyte';
import {
  genAnalysisToCreate,
  genPartialAnalysis,
  genPartialAnalyte,
  genPartialResidue,
} from '../../../shared/test/analysisFixtures';
import { genDocument } from '../../../shared/test/documentFixtures';
import { genPartialSample } from '../../../shared/test/sampleFixtures';
import { oneOf } from '../../../shared/test/testFixtures';
import {
  Analysis,
  AnalysisResidues,
  ResidueAnalytes,
} from '../../repositories/analysisRepository';
import db from '../../repositories/db';
import { Documents } from '../../repositories/documentRepository';
import {
  formatPartialSample,
  Samples,
} from '../../repositories/sampleRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Analysis router', () => {
  const { app } = createServer();

  const sample1 = {
    ...genPartialSample(
      Sampler1Fixture,
      ProgrammingPlanFixture.id,
      CompanyFixture
    ),
    department: oneOf(Regions[Region1Fixture].departments),
  };
  const sample2 = {
    ...genPartialSample(
      Sampler1Fixture,
      ProgrammingPlanFixture.id,
      CompanyFixture
    ),
    department: oneOf(Regions[Region1Fixture].departments),
  };
  const document1 = genDocument({
    createdBy: Sampler1Fixture.id,
    kind: 'AnalysisReportDocument',
  });
  const document2 = genDocument({
    createdBy: Sampler1Fixture.id,
    kind: 'AnalysisReportDocument',
  });
  const analysisWithoutResidue = genPartialAnalysis({
    sampleId: sample1.id,
    reportDocumentId: document1.id,
    createdBy: Sampler1Fixture.id,
  });
  const analysisWithResidues = genPartialAnalysis({
    sampleId: sample2.id,
    reportDocumentId: document2.id,
    createdBy: Sampler1Fixture.id,
  });
  const residues = [
    genPartialResidue({
      analysisId: analysisWithResidues.id,
      residueNumber: 1,
      kind: 'Simple',
    }),
    genPartialResidue({
      analysisId: analysisWithResidues.id,
      residueNumber: 2,
      kind: 'Complex',
    }),
  ];
  const complexResidueAnalytes = [
    genPartialAnalyte({
      analysisId: analysisWithResidues.id,
      residueNumber: 2,
      analyteNumber: 1,
      reference: oneOf(AnalyteList),
    }),
  ];

  beforeAll(async () => {
    await db.seed.run();
    await Samples().insert([
      formatPartialSample(sample1),
      formatPartialSample(sample2),
    ]);
    await Documents().insert([document1, document2]);
    await Analysis().insert([analysisWithoutResidue, analysisWithResidues]);
    await AnalysisResidues().insert(residues);
    await ResidueAnalytes().insert(complexResidueAnalytes);
  });

  afterAll(async () => {
    await Analysis()
      .delete()
      .where('id', 'in', [analysisWithoutResidue.id, analysisWithResidues.id]);
    await Documents().delete().where('id', 'in', [document1.id, document2.id]);
    await Samples().delete().where('id', 'in', [sample1.id, sample2.id]);
  });

  describe('GET /analysis', () => {
    const testRoute = (sampleId?: string) =>
      `/api/analysis?${
        sampleId ? new URLSearchParams({ sampleId }).toString() : ''
      }`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(analysisWithoutResidue.sampleId))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should fail if the user does not have the permission to read analysis', async () => {
      await request(app)
        .get(testRoute(analysisWithoutResidue.sampleId))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should get a valid sample id', async () => {
      await request(app)
        .get(testRoute())
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await request(app)
        .get(testRoute('123'))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the analysis does not exist', async () => {
      await request(app)
        .get(testRoute(uuidv4()))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should get a analysis without residue', async () => {
      const res = await request(app)
        .get(testRoute(analysisWithoutResidue.sampleId))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...analysisWithoutResidue,
        createdAt: analysisWithoutResidue.createdAt.toISOString(),
      });
    });

    it('should get an analysis with residues', async () => {
      const res = await request(app)
        .get(testRoute(analysisWithResidues.sampleId))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual({
        ...analysisWithResidues,
        createdAt: analysisWithResidues.createdAt.toISOString(),
        residues: [
          residues[0],
          {
            ...residues[1],
            analytes: complexResidueAnalytes,
          },
        ],
      });
    });
  });

  describe('POST /analysis', () => {
    const testRoute = '/api/analysis';

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .send(genAnalysisToCreate())
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .post(testRoute)
          .send(payload)
          .use(tokenProvider(Sampler1Fixture))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest(
        genAnalysisToCreate({
          sampleId: '123',
        })
      );
      await badRequestTest(
        genAnalysisToCreate({
          sampleId: undefined,
        })
      );
      await badRequestTest(
        genAnalysisToCreate({
          reportDocumentId: '123',
        })
      );
      await badRequestTest(
        genAnalysisToCreate({
          reportDocumentId: undefined,
        })
      );
    });

    it('should fail if the user does not have the permission to create analysis', async () => {
      await request(app)
        .post(testRoute)
        .send(genAnalysisToCreate())
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should create an analysis and update the associated sample status', async () => {
      const analysis = genAnalysisToCreate({
        sampleId: sample1.id,
        reportDocumentId: document1.id,
      });

      const res = await request(app)
        .post(testRoute)
        .send(analysis)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject(
        expect.objectContaining({
          ...analysis,
          id: expect.any(String),
          createdAt: expect.any(String),
          createdBy: Sampler1Fixture.id,
        })
      );

      await expect(
        Analysis().where({ id: res.body.id }).first()
      ).resolves.toMatchObject({
        ...analysis,
        id: res.body.id,
        createdAt: expect.any(Date),
        createdBy: Sampler1Fixture.id,
      });

      await expect(
        Samples().where({ id: analysis.sampleId }).first()
      ).resolves.toMatchObject({
        status: 'Analysis',
      });
    });
  });

  describe('PUT /analysis/:id', () => {
    const testRoute = (analysisId: string) => `/api/analysis/${analysisId}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute(analysisWithoutResidue.id))
        .send(genPartialAnalysis())
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid analysis id', async () => {
      const badRequestTest = async (analysisId: string) =>
        request(app)
          .put(testRoute(analysisId))
          .send(genPartialAnalysis())
          .use(tokenProvider(Sampler1Fixture))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest('123');
    });

    it('should fail if the analysis does not exist', async () => {
      await request(app)
        .put(testRoute(uuidv4()))
        .send(genPartialAnalysis())
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the user does not have the permission to update analysis', async () => {
      await request(app)
        .put(testRoute(analysisWithoutResidue.id))
        .send(genPartialAnalysis())
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should get a valid body', async () => {
      const validBody = genPartialAnalysis({
        id: analysisWithoutResidue.id,
        sampleId: sample1.id,
        reportDocumentId: document1.id,
      });
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .put(testRoute(analysisWithoutResidue.id))
          .send({
            ...validBody,
            ...payload,
          })
          .use(tokenProvider(Sampler1Fixture))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest({
        sampleId: '123',
      });
      await badRequestTest({
        sampleId: undefined,
      });
      await badRequestTest({
        reportDocumentId: '123',
      });
      await badRequestTest({
        reportDocumentId: undefined,
      });
      await badRequestTest({
        kind: 'invalid',
      });
      await badRequestTest({
        residues: 'invalid',
      });
      await badRequestTest({
        residues: [
          {
            kind: 'invalid',
          },
        ],
      });
    });

    it('should update a analysis with adding residues', async () => {
      const analysisUpdate = {
        ...genPartialAnalysis(analysisWithoutResidue),
        residues: [
          genPartialResidue({
            analysisId: analysisWithoutResidue.id,
            residueNumber: 1,
            kind: 'Simple',
          }),
          genPartialResidue({
            analysisId: analysisWithoutResidue.id,
            residueNumber: 2,
            kind: 'Complex',
            analytes: [
              genPartialAnalyte({
                analysisId: analysisWithoutResidue.id,
                residueNumber: 2,
                analyteNumber: 1,
                reference: oneOf(AnalyteList),
              }),
            ],
          }),
        ],
      };

      const res = await request(app)
        .put(testRoute(analysisWithoutResidue.id))
        .send(analysisUpdate)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        expect.objectContaining({
          ...analysisUpdate,
          createdAt: analysisUpdate.createdAt.toISOString(),
        })
      );

      await expect(
        Analysis().where({ id: analysisWithoutResidue.id }).first()
      ).resolves.toMatchObject(fp.omit(analysisUpdate, ['residues']));

      await expect(
        AnalysisResidues().where({
          analysisId: analysisWithoutResidue.id,
        })
      ).resolves.toMatchObject(
        analysisUpdate.residues.map((_) => fp.omit(_, ['analytes']))
      );

      await expect(
        ResidueAnalytes().where({
          analysisId: analysisWithoutResidue.id,
          residueNumber: 2,
        })
      ).resolves.toMatchObject(
        analysisUpdate.residues[1].analytes as PartialAnalyte[]
      );
    });

    it('should update a analysis with removing residues', async () => {
      const analysisUpdate = {
        ...genPartialAnalysis(analysisWithResidues),
        residues: [],
      };

      const res = await request(app)
        .put(testRoute(analysisWithResidues.id))
        .send(analysisUpdate)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        expect.objectContaining({
          ...analysisUpdate,
          createdAt: analysisUpdate.createdAt.toISOString(),
        })
      );

      await expect(
        Analysis().where({ id: analysisWithResidues.id }).first()
      ).resolves.toMatchObject(fp.omit(analysisUpdate, ['residues']));

      await expect(
        AnalysisResidues().where({
          analysisId: analysisWithResidues.id,
        })
      ).resolves.toMatchObject([]);
    });
  });
});
