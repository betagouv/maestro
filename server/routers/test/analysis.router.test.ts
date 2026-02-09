import { constants } from 'http2';
import { omit } from 'lodash-es';
import { AnalyteList } from 'maestro-shared/referential/Residue/Analyte';
import { PartialAnalyte } from 'maestro-shared/schema/Analysis/Analyte';
import {
  genAnalysisToCreate,
  genPartialAnalysis,
  genPartialAnalyte,
  genPartialResidue
} from 'maestro-shared/test/analysisFixtures';
import { genDocument } from 'maestro-shared/test/documentFixtures';
import { oneOf } from 'maestro-shared/test/testFixtures';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import {
  Analysis,
  analysisRepository,
  AnalysisResidues,
  ResidueAnalytes
} from '../../repositories/analysisRepository';
import { Documents } from '../../repositories/documentRepository';
import { Samples } from '../../repositories/sampleRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

import { SSD2Ids } from 'maestro-shared/referential/Residue/SSD2Id';
import { SampleItemKey } from 'maestro-shared/schema/Sample/SampleItem';
import { UserRefined } from 'maestro-shared/schema/User/User';
import {
  Sample11Fixture,
  Sample2Fixture
} from 'maestro-shared/test/sampleFixtures';
import {
  AdminFixture,
  NationalCoordinator,
  NationalObserver,
  RegionalCoordinator,
  RegionalObserver,
  Sampler1Fixture,
  Sampler2Fixture
} from 'maestro-shared/test/userFixtures';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { kysely } from '../../repositories/kysely';

describe('Analysis router', () => {
  const { app } = createServer();

  const document1 = genDocument({
    createdBy: Sampler1Fixture.id,
    kind: 'AnalysisReportDocument'
  });
  const document2 = genDocument({
    createdBy: Sampler1Fixture.id,
    kind: 'AnalysisReportDocument'
  });
  const analysisWithoutResidue = genPartialAnalysis({
    sampleId: Sample11Fixture.id,
    createdBy: Sampler1Fixture.id
  });
  const analysisWithResidues = genPartialAnalysis({
    sampleId: Sample2Fixture.id,
    createdBy: Sampler1Fixture.id,
    emailReceivedAt: null
  });
  const residues = [
    genPartialResidue({
      analysisId: analysisWithResidues.id,
      reference: 'RF-00012007-PAR',
      residueNumber: 1
    }),
    genPartialResidue({
      analysisId: analysisWithResidues.id,
      reference: 'RF-00000030-PAR',
      residueNumber: 2
    })
  ];
  const complexResidueAnalytes = [
    genPartialAnalyte({
      analysisId: analysisWithResidues.id,
      residueNumber: 2,
      analyteNumber: 1,
      resultKind: 'Q',
      reference: oneOf(AnalyteList)
    })
  ];

  beforeEach(async () => {
    await Documents().insert([document1, document2]);
    await Analysis().insert([analysisWithoutResidue, analysisWithResidues]);
    await AnalysisResidues().insert(residues);
    await ResidueAnalytes().insert(complexResidueAnalytes);
  });

  afterEach(async () => {
    await Analysis()
      .delete()
      .where('sampleId', 'in', [Sample11Fixture.id, Sample2Fixture.id]);
    await Documents().delete().where('id', 'in', [document1.id, document2.id]);
  });

  describe('GET /analysis', () => {
    const testRoute = (sampleItemKey?: SampleItemKey) =>
      `/api/analysis?${
        sampleItemKey
          ? new URLSearchParams({
              sampleId: sampleItemKey.sampleId,
              itemNumber: String(sampleItemKey.itemNumber),
              copyNumber: String(sampleItemKey.copyNumber)
            }).toString()
          : ''
      }`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(
          testRoute({
            sampleId: analysisWithoutResidue.sampleId,
            itemNumber: 1,
            copyNumber: 1
          })
        )
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid sample id', async () => {
      await request(app)
        .get(testRoute())
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await request(app)
        .get(
          testRoute({
            sampleId: '123',
            itemNumber: 1,
            copyNumber: 1
          })
        )
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the analysis does not exist', async () => {
      await request(app)
        .get(
          testRoute({
            sampleId: uuidv4(),
            itemNumber: 1,
            copyNumber: 1
          })
        )
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should get a analysis without residue', async () => {
      const res = await request(app)
        .get(
          testRoute({
            sampleId: analysisWithoutResidue.sampleId,
            itemNumber: 1,
            copyNumber: 1
          })
        )
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...analysisWithoutResidue,
        createdAt: analysisWithoutResidue.createdAt.toISOString()
      });
    });

    test('should get an analysis with residues', async () => {
      const res = await request(app)
        .get(
          testRoute({
            sampleId: analysisWithResidues.sampleId,
            itemNumber: 1,
            copyNumber: 1
          })
        )
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual({
        ...analysisWithResidues,
        createdAt: analysisWithResidues.createdAt.toISOString(),
        residues: [
          residues[0],
          {
            ...residues[1],
            analytes: complexResidueAnalytes
          }
        ]
      });
    });
  });

  describe('POST /analysis', () => {
    const testRoute = '/api/analysis';

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .send(genAnalysisToCreate())
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .post(testRoute)
          .send(payload)
          .use(tokenProvider(Sampler1Fixture))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest(
        genAnalysisToCreate({
          sampleId: '123'
        })
      );
      await badRequestTest(
        genAnalysisToCreate({
          sampleId: undefined
        })
      );
    });

    test('should fail if the user does not have the permission to create analysis', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .post(testRoute)
          .send(genAnalysisToCreate())
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(NationalCoordinator);
      await forbiddenRequestTest(AdminFixture);
    });

    test('should create an analysis and update the associated sample status', async () => {
      const analysis = genAnalysisToCreate({
        sampleId: Sample11Fixture.id
      });

      const res = await request(app)
        .post(testRoute)
        .send(analysis)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject({
        ...analysis,
        id: expect.any(String),
        createdAt: expect.any(String),
        createdBy: Sampler1Fixture.id
      });

      await expect(
        Analysis().where({ id: res.body.id }).first()
      ).resolves.toMatchObject({
        ...analysis,
        id: res.body.id,
        createdAt: expect.any(Date),
        createdBy: Sampler1Fixture.id
      });

      await expect(
        Samples().where({ id: analysis.sampleId }).first()
      ).resolves.toMatchObject({
        status: 'Analysis'
      });
    });
  });

  describe('PUT /analysis/:id', () => {
    const testRoute = (analysisId: string) => `/api/analysis/${analysisId}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute(analysisWithoutResidue.id))
        .send(genPartialAnalysis())
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid analysis id', async () => {
      const badRequestTest = async (analysisId: string) =>
        request(app)
          .put(testRoute(analysisId))
          .send(genPartialAnalysis())
          .use(tokenProvider(Sampler1Fixture))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest('123');
    });

    test('should fail if the analysis does not exist', async () => {
      await request(app)
        .put(testRoute(uuidv4()))
        .send(genPartialAnalysis())
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should fail if the user does not have the permission to update analysis', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .put(testRoute(analysisWithoutResidue.id))
          .send(genPartialAnalysis())
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(NationalCoordinator);
      await forbiddenRequestTest(AdminFixture);
    });

    test('should fail if the analysis does not belong to the user region', async () => {
      const forbiddenRequestTest = async (user: UserRefined) =>
        request(app)
          .put(testRoute(analysisWithResidues.id))
          .send(genPartialAnalysis(analysisWithResidues))
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(Sampler1Fixture);
      await forbiddenRequestTest(RegionalCoordinator);
    });

    test('should get a valid body', async () => {
      const validBody = genPartialAnalysis({
        id: analysisWithoutResidue.id,
        sampleId: Sample11Fixture.id
      });
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .put(testRoute(analysisWithoutResidue.id))
          .send({
            ...validBody,
            ...payload
          })
          .use(tokenProvider(Sampler1Fixture))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest({
        residues: 'invalid'
      });
      await badRequestTest({
        residues: [
          {
            ...genPartialResidue({
              analysisMethod: 'invalid' as any
            })
          }
        ]
      });
    });

    test('should update a analysis with adding residues', async () => {
      const analysisUpdate = {
        ...genPartialAnalysis(analysisWithoutResidue),
        residues: [
          genPartialResidue({
            analysisId: analysisWithoutResidue.id,
            reference: oneOf(SSD2Ids),
            residueNumber: 1
          }),
          genPartialResidue({
            analysisId: analysisWithoutResidue.id,
            reference: oneOf(SSD2Ids),
            residueNumber: 2,
            analytes: [
              genPartialAnalyte({
                analysisId: analysisWithoutResidue.id,
                residueNumber: 2,
                analyteNumber: 1,
                reference: oneOf(AnalyteList)
              })
            ]
          })
        ]
      };

      const res = await request(app)
        .put(testRoute(analysisWithoutResidue.id))
        .send(analysisUpdate)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        expect.objectContaining({
          ...analysisUpdate,
          createdAt: analysisUpdate.createdAt.toISOString()
        })
      );

      await expect(
        Analysis().where({ id: analysisWithoutResidue.id }).first()
      ).resolves.toMatchObject(omit(analysisUpdate, ['residues']));

      await expect(
        AnalysisResidues().where({
          analysisId: analysisWithoutResidue.id
        })
      ).resolves.toMatchObject(
        analysisUpdate.residues.map((_) => omit(_, ['analytes']))
      );

      await expect(
        ResidueAnalytes().where({
          analysisId: analysisWithoutResidue.id,
          residueNumber: 2
        })
      ).resolves.toMatchObject(
        analysisUpdate.residues[1].analytes as PartialAnalyte[]
      );
    });

    test('should update a analysis with removing residues', async () => {
      const analysisUpdate = {
        ...genPartialAnalysis(analysisWithResidues),
        residues: []
      };

      const res = await request(app)
        .put(testRoute(analysisWithResidues.id))
        .send(analysisUpdate)
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        expect.objectContaining({
          ...analysisUpdate,
          createdAt: analysisUpdate.createdAt.toISOString()
        })
      );

      await expect(
        Analysis().where({ id: analysisWithResidues.id }).first()
      ).resolves.toMatchObject(omit(analysisUpdate, ['residues']));

      await expect(
        AnalysisResidues().where({
          analysisId: analysisWithResidues.id
        })
      ).resolves.toMatchObject([]);
    });

    test('should update the sample when the analysis is completed and compliant', async () => {
      const analysisUpdate = {
        ...genPartialAnalysis(analysisWithResidues),
        status: 'Completed',
        compliance: true
      };

      await request(app)
        .put(testRoute(analysisWithResidues.id))
        .send(analysisUpdate)
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_OK);

      await expect(
        Samples().where({ id: analysisWithResidues.sampleId }).first()
      ).resolves.toMatchObject({
        status: 'Completed'
      });
      await Samples()
        .where({ id: analysisWithResidues.sampleId })
        .update({ status: Sample2Fixture.status });
    });

    test('should update the sample when the analysis is completed and not compliant', async () => {
      const analysisUpdate = {
        ...genPartialAnalysis(analysisWithResidues),
        status: 'Completed',
        compliance: false
      };

      await request(app)
        .put(testRoute(analysisWithResidues.id))
        .send(analysisUpdate)
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_OK);

      await expect(
        Samples().where({ id: analysisWithResidues.sampleId }).first()
      ).resolves.toMatchObject({
        status: 'Completed'
      });
      await Samples()
        .where({ id: analysisWithResidues.sampleId })
        .update({ status: Sample2Fixture.status });
    });

    test('should update the sample when the reviewed analysis is completed and add diff in db', async () => {
      await kysely
        .updateTable('analysis')
        .where('id', '=', analysisWithResidues.id)
        .set('status', 'Compliance')
        .execute();
      await kysely
        .updateTable('samples')
        .where('id', '=', analysisWithResidues.sampleId)
        .set('status', 'InReview')
        .execute();
      const analysis = await analysisRepository.findUnique(
        analysisWithResidues.id
      );
      const analysisUpdate = {
        ...genPartialAnalysis(analysisWithResidues),
        status: 'Completed',
        compliance: true,
        residues: analysis?.residues
      };
      await request(app)
        .put(testRoute(analysisWithResidues.id))
        .send(analysisUpdate)
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_OK);
      let analysisErrors = await kysely
        .selectFrom('analysisErrors')
        .selectAll()
        .execute();
      expect(analysisErrors).toHaveLength(0);

      await kysely
        .updateTable('analysis')
        .where('id', '=', analysisWithResidues.id)
        .set('status', 'Compliance')
        .execute();
      await kysely
        .updateTable('samples')
        .where('id', '=', analysisWithResidues.sampleId)
        .set('status', 'InReview')
        .execute();
      await request(app)
        .put(testRoute(analysisWithResidues.id))
        .send({ ...analysisUpdate, residues: [] })
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_OK);
      analysisErrors = await kysely
        .selectFrom('analysisErrors')
        .selectAll()
        .execute();
      expect(analysisErrors).toHaveLength(1);
      expect(analysisErrors[0].residues.new).toHaveLength(0);
      expect(analysisErrors[0].residues.old).toEqual(
        analysis?.residues?.map(
          ({
            analysisMethod,
            residueNumber,
            result,
            analytes,
            resultKind,
            reference
          }) => ({
            analysisMethod,
            residueNumber,
            result,
            analytes,
            resultKind,
            reference
          })
        )
      );
    });
  });
});
