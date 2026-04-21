import { genDocument } from 'maestro-shared/test/documentFixtures';
import { Sample13Fixture } from 'maestro-shared/test/sampleFixtures';
import { Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import { describe, expect, test } from 'vitest';
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
