import { genDocument } from 'maestro-shared/test/documentFixtures';
import {
  Sample12Fixture,
  Sample13Fixture
} from 'maestro-shared/test/sampleFixtures';
import { Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import { v4 as uuidv4 } from 'uuid';
import { beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { analysisDaiRepository } from './analysisDaiRepository';
import { analysisRepository } from './analysisRepository';
import { documentRepository } from './documentRepository';
import { executeTransaction, kysely } from './kysely';

const insertAnalysis = async () =>
  analysisRepository.insert({
    sampleId: Sample13Fixture.id,
    itemNumber: 1,
    copyNumber: 1,
    status: 'Sent',
    createdAt: new Date(),
    compliance: null,
    notesOnCompliance: null
  });

describe('analysisDaiRepository', () => {
  describe('insert', () => {
    test('creates a row with state PENDING by default', async () => {
      const analysisId = await insertAnalysis();
      const id = await analysisDaiRepository.insert(analysisId);

      const row = await kysely
        .selectFrom('analysisDai')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirstOrThrow();

      expect(row.analysisId).toBe(analysisId);
      expect(row.state).toBe('PENDING');
      expect(row.sentMethod).toBeNull();
      expect(row.sentAt).toBeNull();
      expect(row.message).toBeNull();
    });
  });

  describe('claimPending', () => {
    test('claims pending rows and skips terminal rows', async () => {
      await kysely.deleteFrom('analysisDai').execute();

      const analysisId1 = await insertAnalysis();
      const analysisId2 = await insertAnalysis();

      const pendingId = await analysisDaiRepository.insert(analysisId1);

      await analysisDaiRepository.insert(analysisId2);
      await kysely
        .updateTable('analysisDai')
        .set({ state: 'SENT', sentMethod: 'EMAIL', sentAt: new Date() })
        .where('analysisId', '=', analysisId2)
        .execute();

      const claimed = await executeTransaction((trx) =>
        analysisDaiRepository.claimPending(10, trx)
      );

      const claimedIds = claimed.map((r) => r.id);
      expect(claimedIds).toContain(pendingId);

      const fullClaimed = await kysely
        .selectFrom('analysisDai')
        .selectAll()
        .where('id', 'in', claimedIds)
        .execute();
      expect(fullClaimed.every((r) => r.state === 'PENDING')).toBe(true);
    });
  });

  describe('findManyGrouped', () => {
    let analysisId: string;

    beforeAll(async () => {
      analysisId = await insertAnalysis();
    });

    beforeEach(async () => {
      await kysely.deleteFrom('analysisDai').execute();
    });

    test('returns empty when no DAI exist for the sample', async () => {
      const result = await analysisDaiRepository.findManyGrouped({
        sampleIds: [Sample13Fixture.id]
      });
      expect(result).toEqual({ analyses: [], total: 0 });
    });

    test('returns all analyses when no filter is provided', async () => {
      await analysisDaiRepository.insert(analysisId);

      const result = await analysisDaiRepository.findManyGrouped({});
      expect(result.total).toBeGreaterThanOrEqual(1);
      expect(result.analyses.length).toBeGreaterThanOrEqual(1);
    });

    test('groups all attempts sorted asc with correct structure', async () => {
      const pendingId = await analysisDaiRepository.insert(analysisId);

      const sentId = await kysely
        .insertInto('analysisDai')
        .values({
          analysisId,
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
          analysisId,
          state: 'ERROR',
          message: 'SFTP connection failed',
          sentMethod: null,
          edi: null,
          sentAt: new Date()
        })
        .returning('id')
        .executeTakeFirstOrThrow()
        .then((r) => r.id);

      const result = await analysisDaiRepository.findManyGrouped({
        sampleIds: [Sample13Fixture.id]
      });

      expect(result.total).toBe(1);
      expect(result.analyses).toHaveLength(1);

      const group = result.analyses[0];
      expect(group.analysisId).toBe(analysisId);
      expect(group.sample).toEqual({
        id: Sample13Fixture.id,
        reference: Sample13Fixture.reference
      });
      expect(group.analysis).toEqual({ itemNumber: 1, copyNumber: 1 });
      expect(group.attempts).toHaveLength(3);

      const attemptIds = group.attempts.map((a) => a.id);
      expect(attemptIds).toContain(pendingId);
      expect(attemptIds).toContain(sentId);
      expect(attemptIds).toContain(errorId);

      expect(group.attempts[2]).toMatchObject({
        state: 'ERROR',
        message: 'SFTP connection failed'
      });
    });

    test('filters by states — only analyses whose latest attempt matches', async () => {
      await kysely
        .insertInto('analysisDai')
        .values({ analysisId, state: 'PENDING' })
        .execute();
      await kysely
        .insertInto('analysisDai')
        .values({
          analysisId,
          state: 'ERROR',
          message: 'failed',
          sentMethod: null,
          edi: null,
          sentAt: new Date()
        })
        .execute();

      const resultError = await analysisDaiRepository.findManyGrouped({
        sampleIds: [Sample13Fixture.id],
        states: ['ERROR']
      });
      expect(resultError.total).toBe(1);

      const resultSent = await analysisDaiRepository.findManyGrouped({
        sampleIds: [Sample13Fixture.id],
        states: ['SENT']
      });
      expect(resultSent.total).toBe(0);
    });

    test('filters by sentDateFrom and sentDateTo', async () => {
      const sentAt = new Date('2024-06-15T10:00:00Z');
      await kysely
        .insertInto('analysisDai')
        .values({
          analysisId,
          state: 'SENT',
          sentMethod: 'EMAIL',
          edi: false,
          sentAt
        })
        .execute();

      const resultIn = await analysisDaiRepository.findManyGrouped({
        sampleIds: [Sample13Fixture.id],
        sentDateFrom: new Date('2024-06-01'),
        sentDateTo: new Date('2024-06-30')
      });
      expect(resultIn.total).toBe(1);

      const resultOut = await analysisDaiRepository.findManyGrouped({
        sampleIds: [Sample13Fixture.id],
        sentDateFrom: new Date('2024-07-01')
      });
      expect(resultOut.total).toBe(0);
    });

    test('filters by sentMethods', async () => {
      await kysely
        .insertInto('analysisDai')
        .values({
          analysisId,
          state: 'SENT',
          sentMethod: 'EMAIL',
          edi: true,
          sentAt: new Date()
        })
        .execute();

      const resultEmail = await analysisDaiRepository.findManyGrouped({
        sampleIds: [Sample13Fixture.id],
        sentMethods: ['EMAIL']
      });
      expect(resultEmail.total).toBe(1);

      const resultSftp = await analysisDaiRepository.findManyGrouped({
        sampleIds: [Sample13Fixture.id],
        sentMethods: ['SFTP']
      });
      expect(resultSftp.total).toBe(0);
    });

    test('filters by edi', async () => {
      await kysely
        .insertInto('analysisDai')
        .values({
          analysisId,
          state: 'SENT',
          sentMethod: 'SFTP',
          edi: true,
          sentAt: new Date()
        })
        .execute();

      const resultTrue = await analysisDaiRepository.findManyGrouped({
        sampleIds: [Sample13Fixture.id],
        edi: true
      });
      expect(resultTrue.total).toBe(1);

      const resultFalse = await analysisDaiRepository.findManyGrouped({
        sampleIds: [Sample13Fixture.id],
        edi: false
      });
      expect(resultFalse.total).toBe(0);
    });

    test('filters by laboratoryIds — unknown lab returns empty', async () => {
      await kysely
        .insertInto('analysisDai')
        .values({ analysisId, state: 'PENDING' })
        .execute();

      const result = await analysisDaiRepository.findManyGrouped({
        sampleIds: [Sample13Fixture.id],
        laboratoryIds: [uuidv4()]
      });
      expect(result.total).toBe(0);
    });

    test('pagination', async () => {
      const analysisId2 = await analysisRepository.insert({
        sampleId: Sample12Fixture.id,
        itemNumber: 1,
        copyNumber: 1,
        status: 'Sent',
        createdAt: new Date(),
        compliance: null,
        notesOnCompliance: null
      });
      await analysisDaiRepository.insert(analysisId);
      await analysisDaiRepository.insert(analysisId2);

      const result1 = await analysisDaiRepository.findManyGrouped({
        sampleIds: [Sample13Fixture.id, Sample12Fixture.id],
        page: 1,
        perPage: 1
      });
      expect(result1.total).toBe(2);
      expect(result1.analyses).toHaveLength(1);

      const result2 = await analysisDaiRepository.findManyGrouped({
        sampleIds: [Sample13Fixture.id, Sample12Fixture.id],
        page: 2,
        perPage: 1
      });
      expect(result2.total).toBe(2);
      expect(result2.analyses).toHaveLength(1);
      expect(result2.analyses[0].analysisId).not.toBe(
        result1.analyses[0].analysisId
      );
    });
  });

  describe('update', () => {
    test('updates state to SENT and links documents', async () => {
      const analysisId = await insertAnalysis();
      const id = await analysisDaiRepository.insert(analysisId);

      const doc = genDocument({ createdBy: Sampler1Fixture.id });
      await documentRepository.insert(doc);

      await analysisDaiRepository.update({
        state: 'SENT',
        id,
        sentMethod: 'EMAIL',
        edi: true
      });
      await analysisDaiRepository.linkDocuments(id, [doc.id]);

      const row = await kysely
        .selectFrom('analysisDai')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirstOrThrow();

      expect(row.state).toBe('SENT');
      expect(row.sentMethod).toBe('EMAIL');
      expect(row.sentAt).not.toBeNull();
      expect(row.message).toBeNull();

      const linked = await kysely
        .selectFrom('analysisDaiDocuments')
        .select('documentId')
        .where('analysisDaiId', '=', id)
        .execute();
      expect(linked.map((r) => r.documentId)).toContain(doc.id);
    });

    test('updates state to ERROR with a message', async () => {
      const analysisId = await insertAnalysis();
      const id = await analysisDaiRepository.insert(analysisId);

      await analysisDaiRepository.update({
        edi: false,
        sentMethod: 'SFTP',
        state: 'ERROR',
        id,
        message: 'SFTP connection failed'
      });

      const row = await kysely
        .selectFrom('analysisDai')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirstOrThrow();

      expect(row.state).toBe('ERROR');
      expect(row.message).toBe('SFTP connection failed');
      expect(row.sentAt).not.toBeNull();
    });
  });
});
