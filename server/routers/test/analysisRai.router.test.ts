import { constants } from 'node:http2';
import { genPartialAnalysis } from 'maestro-shared/test/analysisFixtures';
import { Sample13Fixture } from 'maestro-shared/test/sampleFixtures';
import {
  AdminFixture,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Analysis } from '../../repositories/analysisRepository';
import { kysely } from '../../repositories/kysely';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

vi.mock('../../services/imapService', async (importOriginal) => {
  const actual = await importOriginal<object>();
  return { ...actual, replayRai: vi.fn() };
});
vi.mock('../../services/ediSacha/sftpService', async (importOriginal) => {
  const actual = await importOriginal<object>();
  return { ...actual, replayRai: vi.fn() };
});

const { replayRai: replayEmailRai } = await import(
  '../../services/imapService'
);
const { replayRai: replaySftpRai } = await import(
  '../../services/ediSacha/sftpService'
);

describe('AnalysisRai router', () => {
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
      .deleteFrom('analysisRai')
      .where('analysisId', '=', analysis.id)
      .execute();
    await kysely
      .deleteFrom('analysisRai')
      .where('analysisId', 'is', null)
      .execute();
    await Analysis().where('id', analysis.id).delete();
    vi.mocked(replayEmailRai).mockReset();
    vi.mocked(replaySftpRai).mockReset();
  });

  const defaultEmailPayload = { emails: [] };

  const insertRai = async (
    overrides: Partial<{
      analysisId: string | null;
      state: 'PROCESSED' | 'INTERNAL_ERROR' | 'REJECTED';
      source: 'EMAIL' | 'SFTP';
      edi: boolean;
      message: string | null;
      receivedAt: Date;
      payload: Record<string, unknown> | null;
    }> = {}
  ) => {
    const source = overrides.source ?? 'EMAIL';
    return kysely
      .insertInto('analysisRai')
      .values({
        analysisId:
          'analysisId' in overrides ? overrides.analysisId : analysis.id,
        laboratoryId: null,
        state: overrides.state ?? 'PROCESSED',
        source,
        edi: overrides.edi ?? false,
        payload:
          overrides.payload ??
          (source === 'EMAIL' ? defaultEmailPayload : null),
        message: overrides.message ?? null,
        receivedAt: overrides.receivedAt ?? new Date()
      })
      .returning('id')
      .executeTakeFirstOrThrow()
      .then((r) => r.id);
  };

  describe('GET /analysis-rai', () => {
    const testRoute = (params?: Record<string, string>) => {
      if (!params) return '/api/analysis-rai';
      const qs = new URLSearchParams(params).toString();
      return `/api/analysis-rai?${qs}`;
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

    test('should return empty result when no RAI exists for the sample', async () => {
      const res = await request(app)
        .get(testRoute({ sampleIds: Sample13Fixture.id }))
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual({ rais: [], total: 0 });
    });

    test('should filter by state and source', async () => {
      await insertRai({ state: 'PROCESSED', source: 'EMAIL' });
      await insertRai({
        analysisId: null,
        state: 'INTERNAL_ERROR',
        source: 'SFTP',
        edi: true
      });

      const errorOnly = await request(app)
        .get(testRoute({ states: 'INTERNAL_ERROR' }))
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(errorOnly.body.total).toBe(1);
      expect(errorOnly.body.rais[0]).toMatchObject({
        state: 'INTERNAL_ERROR',
        source: 'SFTP',
        edi: true
      });

      const emailOnly = await request(app)
        .get(testRoute({ sources: 'EMAIL' }))
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(emailOnly.body.total).toBe(1);
      expect(emailOnly.body.rais[0]).toMatchObject({
        state: 'PROCESSED',
        source: 'EMAIL'
      });
    });

    test('should filter by sampleIds via analysis join', async () => {
      await insertRai({ state: 'PROCESSED', source: 'EMAIL' });
      await insertRai({
        analysisId: null,
        state: 'INTERNAL_ERROR',
        source: 'EMAIL',
        message: 'orphan'
      });

      const res = await request(app)
        .get(testRoute({ sampleIds: Sample13Fixture.id }))
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body.total).toBe(1);
      expect(res.body.rais[0].sample).toEqual({
        id: Sample13Fixture.id,
        reference: Sample13Fixture.reference
      });
    });
  });

  describe('POST /analysis-rai/:id/replay', () => {
    const replayRoute = (id: string) => `/api/analysis-rai/${id}/replay`;

    test('should fail if the user is not authenticated', async () => {
      const id = await insertRai({ state: 'INTERNAL_ERROR' });
      await request(app)
        .post(replayRoute(id))
        .send({})
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user is not admin', async () => {
      const id = await insertRai({ state: 'INTERNAL_ERROR' });
      await request(app)
        .post(replayRoute(id))
        .send({})
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should return 404 for unknown RAI', async () => {
      await request(app)
        .post(replayRoute(uuidv4()))
        .send({})
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should call the EMAIL replay for an EMAIL RAI', async () => {
      const id = await insertRai({
        state: 'INTERNAL_ERROR',
        source: 'EMAIL',
        message: 'boom'
      });

      vi.mocked(replayEmailRai).mockResolvedValue(undefined);

      await request(app)
        .post(replayRoute(id))
        .send({})
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      expect(replayEmailRai).toHaveBeenCalledWith(
        expect.objectContaining({ id })
      );
      expect(replaySftpRai).not.toHaveBeenCalled();
    });

    test('should call the SFTP replay for a SFTP RAI', async () => {
      const id = await insertRai({
        state: 'INTERNAL_ERROR',
        source: 'SFTP',
        edi: true,
        message: 'boom'
      });

      vi.mocked(replaySftpRai).mockResolvedValue(undefined);

      await request(app)
        .post(replayRoute(id))
        .send({})
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      expect(replaySftpRai).toHaveBeenCalledWith(
        expect.objectContaining({ id })
      );
      expect(replayEmailRai).not.toHaveBeenCalled();
    });

    test('should refuse (409) to replay a PROCESSED RAI', async () => {
      const id = await insertRai({ state: 'PROCESSED', source: 'SFTP' });

      await request(app)
        .post(replayRoute(id))
        .send({})
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_CONFLICT);

      expect(replaySftpRai).not.toHaveBeenCalled();
      expect(replayEmailRai).not.toHaveBeenCalled();
    });

    test('should refuse (409) to replay a REJECTED RAI', async () => {
      const id = await insertRai({ state: 'REJECTED', source: 'SFTP' });

      await request(app)
        .post(replayRoute(id))
        .send({})
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_CONFLICT);

      expect(replaySftpRai).not.toHaveBeenCalled();
      expect(replayEmailRai).not.toHaveBeenCalled();
    });

    test('should mark RAI as ERROR with the new message when replay throws', async () => {
      const id = await insertRai({
        state: 'INTERNAL_ERROR',
        source: 'EMAIL',
        message: 'old'
      });

      vi.mocked(replayEmailRai).mockRejectedValue(new Error('replay failed'));

      await request(app)
        .post(replayRoute(id))
        .send({})
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      const row = await kysely
        .selectFrom('analysisRai')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirstOrThrow();
      expect(row.state).toBe('INTERNAL_ERROR');
      expect(row.message).toBe('replay failed');
    });
  });
});
