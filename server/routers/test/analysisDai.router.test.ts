import { constants } from 'node:http2';
import { genPartialAnalysis } from 'maestro-shared/test/analysisFixtures';
import { Sample13Fixture } from 'maestro-shared/test/sampleFixtures';
import {
  AdminFixture,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { Analysis } from '../../repositories/analysisRepository';
import { kysely } from '../../repositories/kysely';
import { createServer } from '../../server';
import { analysisDaiProcessor } from '../../services/analysisDaiProcessor';
import { tokenProvider } from '../../test/testUtils';

describe('AnalysisDai router', () => {
  const { app } = createServer();

  const analysis = genPartialAnalysis({
    sampleId: Sample13Fixture.id,
    itemNumber: 1,
    copyNumber: 1,
    status: 'Sent',
    createdBy: Sampler1Fixture.id
  });

  beforeEach(async () => {
    await Analysis().insert(analysis);
  });

  afterEach(async () => {
    await kysely
      .deleteFrom('analysisDai')
      .where('analysisId', '=', analysis.id)
      .execute();
    await Analysis().where('id', analysis.id).delete();
  });

  describe('GET /analysis-dai', () => {
    const testRoute = (params?: Record<string, string>) => {
      if (!params) return '/api/analysis-dai';
      const qs = new URLSearchParams(params).toString();
      return `/api/analysis-dai?${qs}`;
    };

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute({ sampleIds: Sample13Fixture.id }))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user is not admin', async () => {
      await request(app)
        .get(testRoute({ sampleIds: Sample13Fixture.id }))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should return empty result when no DAI exist for the sample', async () => {
      const res = await request(app)
        .get(testRoute({ sampleIds: Sample13Fixture.id }))
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual({ analyses: [], total: 0 });
    });

    test('should return grouped analyses with all attempts sorted asc', async () => {
      const pendingId = await kysely
        .insertInto('analysisDai')
        .values({ analysisId: analysis.id, state: 'PENDING' })
        .returning('id')
        .executeTakeFirstOrThrow()
        .then((r) => r.id);

      const sentId = await kysely
        .insertInto('analysisDai')
        .values({
          analysisId: analysis.id,
          state: 'SENT',
          sentMethod: 'EMAIL',
          edi: false,
          sentAt: new Date()
        })
        .returning('id')
        .executeTakeFirstOrThrow()
        .then((r) => r.id);

      const errorId = await kysely
        .insertInto('analysisDai')
        .values({
          analysisId: analysis.id,
          state: 'ERROR',
          message: 'SFTP connection failed',
          sentMethod: null,
          edi: null,
          sentAt: new Date()
        })
        .returning('id')
        .executeTakeFirstOrThrow()
        .then((r) => r.id);

      const res = await request(app)
        .get(testRoute({ sampleIds: Sample13Fixture.id }))
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body.total).toBe(1);
      expect(res.body.analyses).toHaveLength(1);

      const group = res.body.analyses[0];
      expect(group.analysisId).toBe(analysis.id);
      expect(group.sample).toEqual({
        id: Sample13Fixture.id,
        reference: Sample13Fixture.reference
      });
      expect(group.analysis).toEqual({ itemNumber: 1, copyNumber: 1 });
      expect(group.sampleItem).toMatchObject({
        substanceKind: expect.any(String)
      });
      expect(group.attempts).toHaveLength(3);

      const attemptIds = group.attempts.map((a: { id: string }) => a.id);
      expect(attemptIds).toContain(pendingId);
      expect(attemptIds).toContain(sentId);
      expect(attemptIds).toContain(errorId);

      // attempts sorted asc by createdAt, last one is ERROR (inserted last)
      expect(group.attempts[2]).toMatchObject({
        state: 'ERROR',
        message: 'SFTP connection failed'
      });
    });
  });

  describe('POST /analysis-dai', () => {
    const testRoute = '/api/analysis-dai';

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .send({ analysisId: analysis.id })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user is not admin', async () => {
      await request(app)
        .post(testRoute)
        .send({ analysisId: analysis.id })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the analysisId does not exist', async () => {
      await request(app)
        .post(testRoute)
        .send({ analysisId: uuidv4() })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should create a PENDING DAI and trigger processing', async () => {
      await request(app)
        .post(testRoute)
        .send({ analysisId: analysis.id })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_CREATED);

      const inserted = await kysely
        .selectFrom('analysisDai')
        .selectAll()
        .where('analysisId', '=', analysis.id)
        .executeTakeFirst();

      expect(inserted).toMatchObject({
        analysisId: analysis.id,
        state: 'PENDING'
      });

      expect(analysisDaiProcessor.triggerProcessing).toHaveBeenCalled();
    });
  });
});
